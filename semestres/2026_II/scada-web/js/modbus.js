/* =============================================================================
   SCADA XL-335B - Cliente Modbus RTU sobre Web Serial API
   PLC 1 (Transporte) Puerto 0: esclavo Modbus, direccion 1, 19200 bps, 8-N-1.
   Solo responde con el selector fisico del PLC 1 en RUN (en TERM el puerto es PPI).
   Las transacciones se encolan: una sola trama en el bus a la vez.
   ============================================================================= */
'use strict';

(function (XL) {
  function crc16(bytes, len) {
    let crc = 0xFFFF;
    for (let i = 0; i < len; i++) {
      crc ^= bytes[i];
      for (let b = 0; b < 8; b++) crc = (crc & 1) ? (crc >>> 1) ^ 0xA001 : crc >>> 1;
    }
    return crc;
  }

  function toHex(bytes) {
    return Array.from(bytes, b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
  }

  class ModbusClient {
    constructor() {
      this.port = null;
      this.reader = null;
      this.connected = false;
      this.slave = 1;
      this.timeoutMs = 450;
      this.rx = [];               // bytes recibidos pendientes de analizar
      this.queue = [];            // transacciones pendientes
      this.busy = false;
      this.current = null;        // transaccion en curso
      this.frameLog = [];         // ultimas tramas (para la ventana Comunicacion)
      this.stats = { tx: 0, rx: 0, crc: 0, timeouts: 0, exceptions: 0, latency: 0, lastOk: 0, consecutiveFail: 0 };
      this.onDisconnect = null;
    }

    static supported() { return 'serial' in navigator; }

    async connect(opts) {
      if (!ModbusClient.supported()) throw new Error('Este navegador no tiene Web Serial. Use Google Chrome o Microsoft Edge en un PC.');
      this.slave = opts.slave || 1;
      this.timeoutMs = opts.timeoutMs || 450;
      const port = opts.port || await navigator.serial.requestPort();
      await port.open({ baudRate: opts.baud || 19200, dataBits: 8, stopBits: opts.stopBits || 1, parity: opts.parity || 'none', bufferSize: 4096 });
      this.port = port;
      this.connected = true;
      this.rx = [];
      this.stats.consecutiveFail = 0;
      this._readLoop();
      return port;
    }

    async disconnect() {
      this.connected = false;
      this._failAll(new Error('Puerto cerrado'));
      try { if (this.reader) await this.reader.cancel(); } catch (e) { /* ya cerrado */ }
      try { if (this.port) await this.port.close(); } catch (e) { /* ya cerrado */ }
      this.port = null;
      this.reader = null;
    }

    async _readLoop() {
      while (this.port && this.port.readable && this.connected) {
        try {
          this.reader = this.port.readable.getReader();
          while (true) {
            const { value, done } = await this.reader.read();
            if (done) break;
            if (value && value.length) {
              for (let i = 0; i < value.length; i++) this.rx.push(value[i]);
              this._parse();
            }
          }
        } catch (err) {
          // Cable desconectado o puerto perdido
          if (this.connected) {
            this.connected = false;
            this._failAll(err);
            if (this.onDisconnect) this.onDisconnect(err);
          }
        } finally {
          try { if (this.reader) this.reader.releaseLock(); } catch (e) { /* nada */ }
          this.reader = null;
        }
      }
    }

    _log(dir, bytes, note) {
      this.frameLog.push({ t: Date.now(), dir, hex: toHex(bytes), note: note || '' });
      if (this.frameLog.length > 80) this.frameLog.shift();
    }

    // Analiza los bytes recibidos para la transaccion en curso
    _parse() {
      const tr = this.current;
      if (!tr) { this.rx = []; return; }
      // Descarta basura hasta encontrar la direccion del esclavo
      while (this.rx.length && this.rx[0] !== this.slave) this.rx.shift();
      if (this.rx.length < 5) return;
      const fc = this.rx[1];
      let need;
      if (fc & 0x80) need = 5;
      else if (fc === 0x03) need = 5 + this.rx[2];
      else if (fc === 0x06 || fc === 0x10) need = 8;
      else { this.rx.shift(); return this._parse(); }
      if (this.rx.length < need) return;
      const frame = Uint8Array.from(this.rx.slice(0, need));
      this.rx = this.rx.slice(need);
      const crc = crc16(frame, need - 2);
      if ((frame[need - 2] | (frame[need - 1] << 8)) !== crc) {
        this.stats.crc++;
        this._log('rx', frame, 'CRC incorrecto');
        return this._finish(new Error('Error de CRC en la respuesta'));
      }
      this.stats.rx++;
      this._log('rx', frame);
      if (fc & 0x80) {
        this.stats.exceptions++;
        const codes = { 1: 'función no admitida', 2: 'dirección fuera del rango del PLC', 3: 'valor no válido', 4: 'falla del esclavo' };
        return this._finish(new Error('El PLC rechazó la trama: ' + (codes[frame[2]] || 'código ' + frame[2])));
      }
      if (fc !== tr.fc) return this._finish(new Error('Respuesta inesperada'));
      if (fc === 0x03) {
        const regs = [];
        for (let i = 0; i < frame[2]; i += 2) regs.push((frame[3 + i] << 8) | frame[4 + i]);
        return this._finish(null, regs);
      }
      return this._finish(null, true);
    }

    _finish(err, value) {
      const tr = this.current;
      if (!tr) return;
      clearTimeout(tr.timer);
      this.current = null;
      if (err) {
        this.stats.consecutiveFail++;
        tr.reject(err);
      } else {
        this.stats.consecutiveFail = 0;
        this.stats.lastOk = Date.now();
        this.stats.latency = Math.round(performance.now() - tr.t0);
        tr.resolve(value);
      }
      // Silencio de 3.5 caracteres (~2 ms a 19200) antes de la siguiente trama
      setTimeout(() => this._next(), 6);
    }

    _failAll(err) {
      if (this.current) { clearTimeout(this.current.timer); this.current.reject(err); this.current = null; }
      this.queue.splice(0).forEach(t => t.reject(err));
      this.busy = false;
    }

    _enqueue(fc, frame, priority) {
      return new Promise((resolve, reject) => {
        if (!this.connected) return reject(new Error('Sin conexión serie'));
        const tr = { fc, frame, resolve, reject };
        if (priority) this.queue.unshift(tr); else this.queue.push(tr);
        if (!this.current) this._next();
      });
    }

    async _next() {
      if (this.current || !this.queue.length || !this.connected) return;
      const tr = this.queue.shift();
      this.current = tr;
      this.rx = [];
      tr.t0 = performance.now();
      tr.timer = setTimeout(() => {
        if (this.current === tr) {
          this.stats.timeouts++;
          this._log('--', new Uint8Array(0), 'sin respuesta');
          this._finish(new Error('El PLC no respondió (¿selector del PLC 1 en RUN? ¿cable A/B?)'));
        }
      }, this.timeoutMs);
      try {
        const writer = this.port.writable.getWriter();
        await writer.write(tr.frame);
        writer.releaseLock();
        this.stats.tx++;
        this._log('tx', tr.frame);
      } catch (err) {
        if (this.current === tr) this._finish(err);
      }
    }

    _build(bytes) {
      const frame = new Uint8Array(bytes.length + 2);
      frame.set(bytes);
      const crc = crc16(frame, bytes.length);
      frame[bytes.length] = crc & 0xFF;
      frame[bytes.length + 1] = crc >> 8;
      return frame;
    }

    // Funcion 03: lectura de registros (offset 0 = 40001)
    readHolding(offset, count) {
      const f = this._build([this.slave, 0x03, offset >> 8, offset & 0xFF, count >> 8, count & 0xFF]);
      return this._enqueue(0x03, f, false);
    }

    // Funcion 16: escritura de varios registros (prioritaria frente al sondeo)
    writeMultiple(offset, values) {
      const bytes = [this.slave, 0x10, offset >> 8, offset & 0xFF, values.length >> 8, values.length & 0xFF, values.length * 2];
      values.forEach(v => { bytes.push((v >> 8) & 0xFF, v & 0xFF); });
      return this._enqueue(0x10, this._build(bytes), true);
    }
  }

  XL.ModbusClient = ModbusClient;
  XL.crc16 = crc16;
})(window.XL);
