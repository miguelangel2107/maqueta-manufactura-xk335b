/* =============================================================================
   SCADA XL-335B - Simulador para el modo demostracion
   Genera la misma imagen de memoria que publica el PLC 1 (VB1000..VB1255) con un
   ciclo de celda verosimil. Sirve para conocer las ventanas sin conectar el PLC.
   ============================================================================= */
'use strict';

(function (XL) {
  const SPEED = 18000;        // pulsos por segundo del carro (simulado)

  class Simulator {
    constructor() {
      this.img = new XL.model.MemImage();
      this.reset();
    }

    reset() {
      this.t = 0;
      this.run = false; this.pause = false; this.stopAtEnd = false;
      this.cotas = { A: 0, P: 45500, E: 87500, S: 107500 };
      this.params = { jog: 100, rebote: 1500, homingBack: 3000 };
      this.vfdMode = 2; this.rev = true; this.dirReq = 0; this.modeReq = 0;
      this.pos = 0; this.homed = false;
      this.tStep = 0; this.tSub = 0; this.tTimer = 0; this.maneuver = 0; this.manSub = 0; this.holding = false;
      this.piece = null; this.pieceType = 0;
      this.A = { step: 50, timer: 0, piece: true, material: 1 };
      this.E = { step: 0, timer: 0, prep: 0, prepTimer: 0, nestSilo: true, nestGrip: true, plateB: false, piece: false, black: false, data: 0, gripCore: false };
      this.P = { step: 0, timer: 0, piece: false };
      this.S = { step: 0, timer: 0, lane: 0, freq: 0, piece: false, pType: 0 };
      this.R = { step: 0, timer: 0, homed: true };
      this.count = { c1: 0, c2: 0, c3: 0, robot: 0, total: 0 };
      this.dt = [395, 352, 360, 305, 410, 262];
      this.faults = { E: 0, P: 0, net6: 0, qsT: 0 };
      this.life = 0;
      this.build();
    }

    // ---------------------------------------------------------------- mandos
    write(offset, values) {
      const img = this.img;
      img.setRegs(offset, values);
      const vaddr = 1000 + offset * 2;
      // Cotas (40056..40063)
      if (vaddr >= 1110 && vaddr <= 1122) {
        const keys = { 1110: 'A', 1114: 'P', 1118: 'E', 1122: 'S' };
        for (const a in keys) { const v = img.vd(+a); if (v >= -1000 && v <= 116000) this.cotas[keys[a]] = v; }
      }
      if (vaddr >= 1002 && vaddr <= 1010) {
        const j = img.vd(1002), r = img.vd(1006), hb = img.vd(1010);
        if (j >= 1 && j <= 20000) this.params.jog = j;
        if (r >= 0 && r <= 10000) this.params.rebote = r;
        if (hb >= 500 && hb <= 20000) this.params.homingBack = hb;
      }
      if (vaddr <= 1016 && vaddr + values.length * 2 > 1014) { this.dirReq = img.vb(1015); this.modeReq = img.vb(1017); }
      if (vaddr === 1000) this.command(values[0]);
      this.build();
    }

    command(mask) {
      if (!mask) return;
      const auto = true;
      if (mask & 0x01 || (mask & 0x10 && auto)) { // Marcha / SB1
        this.faults.qsT = 0; this.faults.E = 0; this.faults.P = 0;
        if (!this.homed) { this.tStep = 5; this.tTimer = 0; }
        this.run = true; this.pause = false;
      }
      if (mask & 0x02 || (mask & 0x20 && auto)) this.pause = true;
      if (mask & 0x04) { this.faults.E = 0; this.faults.P = 0; this.faults.net6 = 0; }
      if (mask & 0x08) this.stopAtEnd = true;
      if (mask & 0x40) this.pos += this.params.jog;
      if (mask & 0x80) this.pos -= this.params.jog;
      if (mask & 0x100) this.count = { c1: 0, c2: 0, c3: 0, robot: 0, total: 0 };
    }

    inject(kind) {
      if (kind === 'E') this.faults.E = 12;
      if (kind === 'P') this.faults.P = 12;
      if (kind === 'net6') this.faults.net6 = 10;
      if (kind === 'qsT') { this.faults.qsT = 1; this.run = false; }
    }

    // ---------------------------------------------------------------- simulacion
    tick(dt) {
      this.t += dt;
      this.life = (this.life + 1) & 0xFF;
      for (const k in this.faults) if (this.faults[k] > 0 && k !== 'qsT') this.faults[k] = Math.max(0, this.faults[k] - dt);
      if (this.dirReq === 1) this.rev = false;
      if (this.dirReq === 2) this.rev = true;
      if (this.modeReq === 1 || this.modeReq === 2) this.vfdMode = this.modeReq;
      const go = this.run && !this.pause && !this.faults.qsT;
      this.stations(dt, go);
      if (go) this.transport(dt);
      this.build();
    }

    moveTo(target, dt) {
      const d = target - this.pos;
      const step = SPEED * dt;
      if (Math.abs(d) <= step) { this.pos = target; return true; }
      this.pos += Math.sign(d) * step;
      return false;
    }

    // Maniobra del manipulador (pick / place) en ~2.4 s
    maneuverTick(dt, kind) {
      if (!this.maneuver) { this.maneuver = kind; this.manSub = 20; this.tTimer = 0; }
      this.tTimer += dt;
      const seq = [20, 30, 40, 45, 50, 60, 99];
      const idx = Math.min(seq.length - 1, Math.floor(this.tTimer / 0.38));
      this.manSub = seq[idx];
      if (this.manSub >= 40 && kind === 1) this.holding = true;
      if (this.manSub >= 40 && kind !== 1) this.holding = false;
      if (this.manSub === 99) { this.maneuver = 0; this.manSub = 0; this.tTimer = 0; return true; }
      return false;
    }

    transport(dt) {
      const st = this.tStep;
      if (st === 0) { this.tStep = this.homed ? 10 : 5; this.tSub = 0; return; }
      if (st === 5) {
        this.tTimer += dt;
        this.moveTo(0, dt);
        if (this.tTimer > 3) { this.homed = true; this.tStep = 10; this.tSub = 0; this.tTimer = 0; }
        return;
      }
      const targets = { 10: 'A', 20: 'E', 22: 'E', 30: 'P', 32: 'P', 50: 'S' };
      if (this.tSub <= 1) {
        this.tSub = 1;
        if (this.moveTo(this.cotas[targets[st]], dt)) this.tSub = 2;
        return;
      }
      if (this.tSub === 2) {
        const ready = {
          10: this.A.step === 50, 20: this.E.step === 0, 22: this.E.step === 120,
          30: this.P.step === 0, 32: this.P.step === 110, 50: this.S.step === 0
        }[st];
        if (ready) this.tSub = 3;
        return;
      }
      const kind = { 10: 1, 20: 2, 22: 1, 30: 2, 32: 1, 50: 3 }[st];
      if (!this.maneuverTick(dt, kind)) return;
      this.tSub = 0;
      if (st === 10) {
        this.piece = { type: 1 + Math.floor(Math.random() * 5) };
        this.pieceType = 0;
        this.A.step = 0; this.A.piece = false; this.tStep = 20;
      } else if (st === 20) {
        this.E.piece = true; this.E.black = this.piece.type === 5; this.E.step = 10; this.E.timer = 0; this.tStep = 22;
      } else if (st === 22) {
        this.E.piece = false; this.E.step = 0;
        this.pieceType = this.E.black ? 5 : 0;
        this.tStep = this.E.black ? 50 : 30;
      } else if (st === 30) {
        this.P.piece = true; this.P.step = 0; this.P.timer = -0.8; this.tStep = 32; this.P.start = true;
      } else if (st === 32) {
        this.P.piece = false; this.P.step = 0; this.tStep = 50;
      } else if (st === 50) {
        this.S.piece = true; this.S.pType = this.piece.type; this.S.step = 10; this.S.timer = 0;
        this.piece = null; this.pieceType = 0;
        if (this.stopAtEnd) { this.stopAtEnd = false; this.run = false; this.tStep = 0; } else this.tStep = 10;
      }
    }

    stations(dt, go) {
      // Alimentacion: repone una base cada vez que la cuna queda libre
      const A = this.A;
      if (go && A.step !== 50) {
        A.timer += dt;
        const order = [0, 10, 20, 30, 40, 50];
        const i = Math.min(order.length - 1, Math.floor(A.timer / 0.7));
        A.step = order[i];
        if (A.step >= 20) A.piece = true;
        if (A.step === 50) { A.timer = 0; A.material = Math.random() < 0.5 ? 1 : 0; }
      }
      // Ensamblaje: preparacion de nucleos en los dos nidos
      const E = this.E;
      if (go || E.step !== 0) {
        if (E.prep === 0) {
          if (E.nestSilo && !E.nestGrip && !(E.step >= 50 && E.step <= 70)) { E.prep = 40; E.prepTimer = 0; E.plateB = !E.plateB; }
          else if (!E.nestSilo) { E.prep = 20; E.prepTimer = 0; }
        } else {
          E.prepTimer += dt;
          if (E.prep === 20 && E.prepTimer > 1.0) { E.nestSilo = true; E.prep = 30; E.prepTimer = 0; }
          else if (E.prep === 30 && E.prepTimer > 0.7) { E.prep = 0; }
          else if (E.prep === 40 && E.prepTimer > 1.0) { E.nestGrip = true; E.nestSilo = false; E.prep = 0; }
        }
      }
      if (E.step >= 10 && E.step < 120 && !this.faults.E) {
        E.timer += dt;
        if (E.step === 10 && E.timer > 0.6) {
          if (E.black) { E.data = 5; E.step = 120; }
          else { E.data = 1; if (E.nestGrip && E.prep !== 40) { E.step = 50; E.timer = 0; } }
        } else if (E.step >= 50 && E.timer > 0.45) {
          const order = [50, 60, 70, 80, 90, 95, 100, 110, 120];
          const next = order[order.indexOf(E.step) + 1];
          if (E.step === 60) { E.gripCore = true; }
          if (E.step === 70) E.nestGrip = false;
          if (E.step === 95) E.gripCore = false;
          E.step = next; E.timer = 0;
        }
      }
      // Procesamiento
      const P = this.P;
      if (P.start && !this.faults.P) {
        P.timer += dt;
        if (P.timer > 0) {
          const order = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];
          const i = Math.min(order.length - 1, Math.floor(P.timer / 0.45));
          P.step = order[i];
          if (P.step === 110) P.start = false;
        }
      }
      // Seleccion y variador
      const S = this.S;
      if (S.step !== 0) {
        S.timer += dt;
        const lane = { 1: 30, 2: 40, 3: 50, 4: 60, 5: 60 }[S.pType];
        if (S.step === 10 && S.timer > 1.2) { S.step = 20; S.timer = 0; S.lane = lane === 60 ? 4 : (lane - 20) / 10; }
        else if (S.step === 20 && S.timer > 1.5) { S.step = lane === 60 ? 60 : 25; S.timer = 0; }
        else if (S.step === 25 && S.timer > 0.7) { S.step = lane; S.timer = 0; }
        else if ((S.step === 30 || S.step === 40 || S.step === 50) && S.timer > 0.4) { S.step += 2; S.timer = 0; S.piece = false; }
        else if ((S.step === 32 || S.step === 42 || S.step === 52) && S.timer > 2) {
          const key = { 32: 'c1', 42: 'c2', 52: 'c3' }[S.step];
          this.count[key]++; this.count.total++;
          S.step = 0; S.timer = 0;
        } else if (S.step === 60 && this.R.step === 0) { this.R.step = 100; this.R.timer = 0; }
      }
      const target = S.step === 10 || S.step === 15 ? 30 : S.step === 20 ? 18 : 0;
      S.freq += Math.max(-dt * 30, Math.min(dt * 30, target - S.freq));
      if (S.freq < 0.05) S.freq = 0;
      // Brazo
      const R = this.R;
      if (R.step >= 100) {
        R.timer += dt;
        const order = [100, 110, 120, 130, 140, 150, 160, 170, 180];
        const i = Math.floor(R.timer / 0.8);
        if (i >= order.length) { R.step = 0; R.timer = 0; this.count.robot++; this.count.total++; }
        else {
          R.step = order[i];
          if (R.step >= 110 && S.step === 60) { S.step = 0; S.piece = false; }
        }
      }
      // Tiempos neumaticos con algo de ruido
      this.dt = this.dt.map((v, i) => Math.round([395, 352, 360, 305, 410, 262][i] + (Math.random() - 0.5) * 30));
    }

    // ---------------------------------------------------------------- imagen
    build() {
      const img = this.img;
      const bitsOf = arr => arr.reduce((acc, on, i) => acc | (on ? 1 << i : 0), 0);
      const go = this.run && !this.pause;
      const qsT = !this.faults.qsT;
      const nodesDown = this.faults.net6 > 0 ? 0x40 : 0;
      img.setVb(1000, 0); img.setVb(1001, 0);
      img.setVd(1002, this.params.jog); img.setVd(1006, this.params.rebote); img.setVd(1010, this.params.homingBack);
      img.setVb(1014, 0); img.setVb(1015, this.dirReq); img.setVb(1016, 0); img.setVb(1017, this.modeReq);
      img.setVb(1020, 0);
      img.setVb(1021, bitsOf([this.run, this.pause, qsT, true, this.tStep > 0, !qsT || this.faults.E || this.faults.P, false]));
      const E = this.E, P = this.P, A = this.A, S = this.S, R = this.R;
      const eReady = E.step === 0 && !this.faults.E, pReady = P.step === 0 && !P.piece;
      img.setVb(1023, bitsOf([0, this.homed, A.step === 0, eReady, pReady, S.step === 0, R.step === 0]));
      img.setVw(1024, this.tStep);
      img.setVw(1026, A.step); img.setVw(1028, E.step); img.setVw(1030, P.step); img.setVw(1032, S.step); img.setVw(1034, R.step);
      img.setVw(1036, this.pieceType);
      img.setVb(1039, bitsOf([eReady, pReady, S.step === 0, R.step >= 110, R.step >= 100]));
      img.setVw(1040, 0);
      img.setVb(1047, bitsOf([false, false, false, false, false, nodesDown > 0]));
      const alarm = this.faults.E || this.faults.P || nodesDown;
      const beacon = !qsT ? 0x10 : alarm ? 0x08 : go ? 0x01 : 0x02;
      img.setVb(1051, beacon);
      img.setVb(1053, bitsOf([S.step === 60, R.step === 0, true, R.step > 0, false, nodesDown > 0, R.step >= 100, R.step >= 110]));
      const waitBits = this.tSub === 2 && go ? (1 << ({ 10: 0, 20: 1, 22: 2, 30: 3, 32: 4, 50: 5 }[this.tStep] || 0)) : 0;
      img.setVb(1055, waitBits);
      img.setVb(1057, bitsOf([false, false, false, this.faults.E > 0, this.faults.P > 0, false, nodesDown > 0, !qsT]));
      [1060, 1062, 1064, 1066, 1068, 1070].forEach((a, i) => img.setVw(a, this.dt[i]));
      img.setVd(1110, this.cotas.A); img.setVd(1114, this.cotas.P); img.setVd(1118, this.cotas.E); img.setVd(1122, this.cotas.S);
      img.setVd(1126, Math.round(this.pos));
      img.setVw(1132, Math.round(S.freq * 100)); img.setVw(1134, 5380); img.setVw(1136, Math.round(S.freq * 4.2)); img.setVw(1138, S.freq > 0 ? 1 : 5);
      img.setVw(1144, this.vfdMode); img.setVw(1146, 0);
      img.setVb(1181, bitsOf([S.step === 32, S.step === 42, S.step === 52, Math.abs(this.pos) < 200, false, false]));
      img.setVw(1182, this.count.c1); img.setVw(1184, this.count.c2); img.setVw(1186, this.count.c3);
      img.setVw(1188, this.count.robot); img.setVw(1190, this.count.total);

      // Transporte: E/S segun la maniobra
      const sub = this.manSub;
      const down = sub === 30 || sub === 40 || sub === 45;
      const ext = sub >= 20 && sub < 60;
      const toBelt = this.maneuver === 3 && sub >= 20 && sub < 70;
      const moving = this.tSub === 1 && go;
      img.setVb(1200, bitsOf([Math.abs(this.pos) < 200, false, false, down, !down, toBelt, !toBelt, ext]));
      img.setVb(1201, bitsOf([!ext, this.holding, true]));
      img.setVb(1202, bitsOf([S.step === 32, S.step === 42, S.step === 52, false, false, false, qsT, true]));
      img.setVb(1203, bitsOf([moving, moving && this.pos < this.cotas[{ 10: 'A', 20: 'E', 22: 'E', 30: 'P', 32: 'P', 50: 'S' }[this.tStep]] || 0, !down, toBelt, !toBelt, ext, !this.holding]));
      img.setVb(1204, bitsOf([this.holding, false, false, false, false, !go && qsT, go, !qsT]));
      img.setVb(1205, this.maneuver); img.setVb(1206, this.tSub); img.setVb(1207, 0); img.setVb(1208, sub);
      img.setVb(1209, nodesDown);
      img.setVb(1210, bitsOf([this.homed, this.tStep === 5, this.maneuver > 0, moving, this.tSub === 2 && go, false, this.stopAtEnd, R.step >= 100]));
      img.setVb(1211, this.tStep === 5 ? 20 : 0);

      // Alimentacion
      img.setVb(1212, bitsOf([A.step === 0, A.step > 0 && A.step < 50, A.step === 50, false, false, false, false, true]));
      img.setVb(1213, A.step);
      img.setVb(1214, bitsOf([A.step === 10 || A.step === 20 || A.step === 30, !(A.step === 10 || A.step === 20 || A.step === 30), A.step === 20, A.step !== 20, A.piece, true, true, A.piece && A.material === 1]));
      img.setVb(1215, A.material);
      img.setVb(1216, bitsOf([0, 0, false, false, true, true]));
      img.setVb(1217, bitsOf([A.step >= 10 && A.step <= 30, A.step === 20]));
      img.setVb(1218, bitsOf([go]));

      // Ensamblaje
      const eAl = this.faults.E > 0;
      img.setVb(1220, bitsOf([eReady, E.step >= 10 && E.step < 120, E.step === 120, eAl, false, false, false, true]));
      img.setVb(1221, E.step);
      const retExt = E.prep === 20 || (E.prep === 30 && false);
      img.setVb(1222, bitsOf([true, true, E.nestSilo, E.nestGrip, E.piece && !E.black, retExt, !retExt, E.prep !== 20]));
      img.setVb(1223, E.data);
      const vDown = E.step === 50 || E.step === 60 || E.step === 90 || E.step === 95;
      const hFwd = E.step >= 80 && E.step <= 100;
      img.setVb(1224, bitsOf([E.prep === 20, !E.plateB && E.prep !== 40, E.plateB && E.prep !== 40, E.gripCore, vDown, !vDown, !hFwd, hFwd]));
      img.setVb(1225, bitsOf([E.prep === 20, E.prep === 20, E.plateB, E.step >= 60 && E.step <= 90, vDown, hFwd, beacon & 0x18, beacon & 0x06]));
      img.setVb(1226, 0xC0 | (E.prep / 10));
      const eDiag = bitsOf([!go, E.step === 0, E.step === 10 && !E.black && !E.nestGrip, E.step === 120, false, false, eAl, false]);
      img.setVb(1227, eDiag);

      // Procesamiento
      const pAl = this.faults.P > 0;
      img.setVb(1228, bitsOf([pReady, P.step > 0 && P.step < 110, P.step === 110, pAl, false, false, false, P.step === 0 || P.step >= 100]));
      img.setVb(1229, P.step);
      const pPress = P.step >= 20 && P.step <= 80;
      const pDown = P.step === 30 || P.step === 40 || P.step === 60 || P.step === 70;
      img.setVb(1230, bitsOf([P.piece, P.step >= 10 && P.step <= 90, !pPress, pPress, !pDown, pDown]));
      img.setVb(1231, 0);
      img.setVb(1232, bitsOf([0, 0, false, false, true, true]));
      img.setVb(1233, bitsOf([P.step >= 10 && P.step <= 90, false, pPress, pDown]));
      img.setVb(1234, bitsOf([P.step > 0 && P.step < 110]));

      // Seleccion
      img.setVb(1236, bitsOf([S.step === 0, S.step > 0 && S.step !== 60, S.step === 32 || S.step === 42 || S.step === 52, false, false, false, S.step === 60, true]));
      img.setVb(1237, S.step);
      const tickEnc = S.freq > 0 ? (Math.floor(this.t * 8) & 3) : 0;
      img.setVb(1238, bitsOf([tickEnc & 1, tickEnc & 2, false, S.step === 0 && S.piece, S.step === 10 && S.timer > 0.6 && [1, 3].includes(S.pType), S.step === 10 && S.timer > 0.6 && [1, 4].includes(S.pType), false, S.step === 30]));
      img.setVb(1239, S.lane);
      img.setVw(1240, Math.round(S.freq * 100)); img.setVw(1242, Math.round(S.freq * 4.2)); img.setVw(1244, 5380);
      img.setVb(1246, this.vfdMode | (this.rev ? 0x20 : 0) | 0x40);
      img.setVb(1247, 0);
      img.setVb(1248, bitsOf([S.freq > 0 && this.vfdMode === 1, this.rev && S.freq > 0 && this.vfdMode === 1, false, false, S.step === 30, S.step === 40, S.step === 50, false]));
      img.setVb(1249, 0);

      // Brazo
      img.setVb(1250, bitsOf([R.step === 0, R.step > 0, false, false, false, false, R.step >= 110 && R.step < 120, true]));
      img.setVb(1251, R.step);
      img.setVb(1252, bitsOf([R.step === 0, R.step === 0, false, R.step === 0, false, true, false, false]));
      img.setVb(1253, 0);
      img.setVb(1254, this.life);
      img.setVb(1255, beacon);
      img.stamp = Date.now();
    }
  }

  XL.Simulator = Simulator;
})(window.XL);
