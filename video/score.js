/* ==========================================================================
   PAC AI · LAUNCH FILM · SCORE
   Original, synthesized in Web Audio. F minor, 120 BPM, 12 bars (24.0 s).

   bar  1   (0-2)   Fm   pad wakes up through a closed filter; 8-bit blips as the pixel multiplies
   bar  2   (2-4)   Db   hats + pluck arp; blips on each line of text; a "landing" blip as the pixel sets
   bar  3   (4-6)   Ab   kick + sidechained bass enter on the push-in; filter opens
   bar  4   (6-8)   Eb   clap, riser, snare roll; everything cuts at 7.75 (the break)
   bar  5   (8-10)  Fm   DROP: impact, full groove, supersaw stab hook
   bars 6-9 (10-18) Db Ab Eb Db   project montage; whooshes land on each downbeat;
                                  bar 8 (Kaiju) swaps the stab hook for a chiptune lead
   bar 10   (18-20) Eb   one pluck per offering, climbing; stutter at 19.5; silence at 19.75
   bars 11-12 (20-24) Fm(add9)   end hit, bell motif, pad rings out
   ========================================================================== */
window.SCORE = ac => {
  const SR = ac.sampleRate, BEAT = .5;
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

  /* ---- buses ---- */
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .16;
  const master = ac.createGain(); master.gain.value = .8; master.connect(comp); comp.connect(ac.destination);
  // fade the tail
  master.gain.setValueAtTime(.8, 22.4); master.gain.linearRampToValueAtTime(0, 24);

  // reverb from a seeded, decaying noise impulse
  const irLen = Math.floor(SR * 2.6), ir = ac.createBuffer(2, irLen, SR);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < irLen; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / irLen, 3.2); }
  const verb = ac.createConvolver(); verb.buffer = ir; const verbOut = ac.createGain(); verbOut.gain.value = .32; verb.connect(verbOut); verbOut.connect(master);
  // dotted-eighth delay for plucks and stabs
  const dly = ac.createDelay(1); dly.delayTime.value = BEAT * .75; const fb = ac.createGain(); fb.gain.value = .32; const dlp = ac.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 3200;
  dly.connect(dlp); dlp.connect(fb); fb.connect(dly); const dlyOut = ac.createGain(); dlyOut.gain.value = .28; dlp.connect(dlyOut); dlyOut.connect(master); dlyOut.connect(verb);

  // sidechain: pad + bass duck under every kick after the drop
  const duck = ac.createGain(); duck.connect(master); duck.gain.value = 1;
  const drums = ac.createGain(); drums.gain.value = .95; drums.connect(master);
  const fx = ac.createGain(); fx.gain.value = .8; fx.connect(master); fx.connect(verb);

  const noise = (() => { const b = ac.createBuffer(1, SR * 2, SR), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1; return b; })();
  const noiseSrc = (t, dur) => { const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; s.start(t, rnd() * 1.5); s.stop(t + dur + .05); return s; };
  const env = (g, t, a, peak, d, sus = .0001) => { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(sus, .0001), t + a + d); };

  /* ---- instruments ---- */
  const kick = (t, v = 1) => {
    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(165, t); o.frequency.exponentialRampToValueAtTime(46, t + .11); o.frequency.exponentialRampToValueAtTime(38, t + .4);
    env(g, t, .003, 1.0 * v, .42); o.connect(g); g.connect(drums); o.start(t); o.stop(t + .5);
    const n = noiseSrc(t, .02), hp = ac.createBiquadFilter(), ng = ac.createGain(); hp.type = 'highpass'; hp.frequency.value = 2500; env(ng, t, .001, .35 * v, .015); n.connect(hp); hp.connect(ng); ng.connect(drums);
  };
  const clap = (t, v = 1) => {
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 1.1; const g = ac.createGain(); bp.connect(g); g.connect(drums);
    const s = ac.createGain(); s.gain.value = .25; g.connect(s); s.connect(verb);
    [0, .011, .022].forEach((o, i) => { const n = noiseSrc(t + o, .2), ng = ac.createGain(); env(ng, t + o, .001, (i === 2 ? .7 : .45) * v, i === 2 ? .19 : .02); n.connect(ng); ng.connect(bp); });
  };
  const snare = (t, v = 1) => {
    const n = noiseSrc(t, .15), bp = ac.createBiquadFilter(), g = ac.createGain(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = .8; env(g, t, .001, .45 * v, .11); n.connect(bp); bp.connect(g); g.connect(drums);
    const o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = 210; env(og, t, .001, .25 * v, .07); o.connect(og); og.connect(drums); o.start(t); o.stop(t + .12);
  };
  const hat = (t, v = 1, open = false) => {
    const n = noiseSrc(t, open ? .3 : .06), hp = ac.createBiquadFilter(), g = ac.createGain(); hp.type = 'highpass'; hp.frequency.value = open ? 7000 : 8500;
    env(g, t, .001, (open ? .16 : .11) * v, open ? .24 : .035); n.connect(hp); hp.connect(g); g.connect(drums);
  };
  const bass = (t, n, dur, v = 1) => {
    const o = ac.createOscillator(), sub = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; o.frequency.value = midi(n); sub.type = 'sine'; sub.frequency.value = midi(n - 12);
    lp.type = 'lowpass'; lp.Q.value = 6; lp.frequency.setValueAtTime(1400, t); lp.frequency.exponentialRampToValueAtTime(260, t + dur * .9);
    const sg = ac.createGain(); sg.gain.value = .9; env(g, t, .006, .34 * v, dur, .001);
    o.connect(lp); lp.connect(g); sub.connect(sg); sg.connect(g); g.connect(duck); [o, sub].forEach(x => { x.start(t); x.stop(t + dur + .05); });
  };
  const pad = (t, dur, notes, { cutoff = [600, 2400], v = .12, sidechain = true, attack = .3 } = {}) => {
    const lp = ac.createBiquadFilter(), g = ac.createGain(); lp.type = 'lowpass'; lp.Q.value = 1.2;
    lp.frequency.setValueAtTime(cutoff[0], t); lp.frequency.exponentialRampToValueAtTime(cutoff[1], t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + attack); g.gain.setValueAtTime(v, t + dur - .08); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .25);
    lp.connect(g); g.connect(sidechain ? duck : master); const sv = ac.createGain(); sv.gain.value = .5; g.connect(sv); sv.connect(verb);
    notes.forEach(n => [-9, 0, 9].forEach(dt => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + dur + .3); }));
  };
  const pluck = (t, n, v = 1, len = .22) => {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'square'; o2.type = 'sawtooth'; o.frequency.value = midi(n); o2.frequency.value = midi(n) * 1.003;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(5200, t); lp.frequency.exponentialRampToValueAtTime(700, t + len); env(g, t, .002, .09 * v, len);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(master); g.connect(dly); [o, o2].forEach(x => { x.start(t); x.stop(t + len + .05); });
  };
  const stab = (t, notes, v = 1) => {
    const lp = ac.createBiquadFilter(), g = ac.createGain(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(6500, t); lp.frequency.exponentialRampToValueAtTime(1500, t + .16);
    env(g, t, .003, .075 * v, .16); lp.connect(g); g.connect(duck); g.connect(dly);
    notes.forEach(n => [-14, -5, 5, 14].forEach(dt => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + .22); }));
  };
  const pulseWave = (() => { const N = 32, re = new Float32Array(N), im = new Float32Array(N), d = .25; for (let k = 1; k < N; k++) im[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * d); return ac.createPeriodicWave(re, im); })();
  const chip = (t, n, len = .11, v = 1) => { // 8-bit pulse lead
    const o = ac.createOscillator(), g = ac.createGain(); o.setPeriodicWave(pulseWave); o.frequency.value = midi(n);
    g.gain.setValueAtTime(.075 * v, t); g.gain.setValueAtTime(.075 * v, t + len * .8); g.gain.linearRampToValueAtTime(0, t + len); o.connect(g); g.connect(master); g.connect(dly); o.start(t); o.stop(t + len + .02);
  };
  const blip = (t, n, v = 1, down = false) => { // the pixel sound: two quick 8-bit steps
    const o = ac.createOscillator(), g = ac.createGain(); o.setPeriodicWave(pulseWave);
    o.frequency.setValueAtTime(midi(n), t); o.frequency.setValueAtTime(midi(n + (down ? -12 : 12)), t + .035);
    g.gain.setValueAtTime(.06 * v, t); g.gain.setValueAtTime(.06 * v, t + .07); g.gain.linearRampToValueAtTime(0, t + .09); o.connect(g); g.connect(fx); o.start(t); o.stop(t + .1);
  };
  const riser = (t0, t1, v = 1) => {
    const n = noiseSrc(t0, t1 - t0), bp = ac.createBiquadFilter(), g = ac.createGain(); bp.type = 'bandpass'; bp.Q.value = 3;
    bp.frequency.setValueAtTime(300, t0); bp.frequency.exponentialRampToValueAtTime(9000, t1); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.32 * v, t1 - .02); g.gain.linearRampToValueAtTime(0, t1);
    n.connect(bp); bp.connect(g); g.connect(fx);
    const o = ac.createOscillator(), og = ac.createGain(), lp = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(midi(41), t0); o.frequency.exponentialRampToValueAtTime(midi(77), t1);
    lp.type = 'lowpass'; lp.frequency.value = 2400; og.gain.setValueAtTime(.0001, t0); og.gain.exponentialRampToValueAtTime(.05 * v, t1 - .02); og.gain.linearRampToValueAtTime(0, t1);
    o.connect(lp); lp.connect(og); og.connect(fx); o.start(t0); o.stop(t1 + .02);
  };
  const whoosh = (tEnd, dur = .35, v = 1) => { // swells into a downbeat and stops on it
    const t0 = tEnd - dur, n = noiseSrc(t0, dur), bp = ac.createBiquadFilter(), g = ac.createGain(); bp.type = 'bandpass'; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(500, t0); bp.frequency.exponentialRampToValueAtTime(5000, tEnd); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.22 * v, tEnd - .01); g.gain.linearRampToValueAtTime(0, tEnd + .01);
    n.connect(bp); bp.connect(g); g.connect(fx);
  };
  const impact = (t, v = 1) => {
    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(30, t + 1.0); env(g, t, .004, .9 * v, 1.3); o.connect(g); g.connect(drums); o.start(t); o.stop(t + 1.4);
    const n = noiseSrc(t, 1.8), hp = ac.createBiquadFilter(), ng = ac.createGain(); hp.type = 'highpass'; hp.frequency.value = 3500; env(ng, t, .002, .22 * v, 1.6); n.connect(hp); hp.connect(ng); ng.connect(fx);
    const n2 = noiseSrc(t, .3), lp = ac.createBiquadFilter(), ng2 = ac.createGain(); lp.type = 'lowpass'; lp.frequency.value = 400; env(ng2, t, .002, .5 * v, .25); n2.connect(lp); lp.connect(ng2); ng2.connect(drums);
  };
  const bell = (t, n, v = 1) => {
    [[1, 1], [2.76, .4], [5.4, .18], [8.9, .08]].forEach(([r, a]) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = midi(n) * r; env(g, t, .002, .07 * v * a, 1.6 / r + .3); o.connect(g); g.connect(master); g.connect(verb); o.start(t); o.stop(t + 2.2); });
  };
  const sweepDown = (t, dur) => { const n = noiseSrc(t, dur), lp = ac.createBiquadFilter(), g = ac.createGain(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(7000, t); lp.frequency.exponentialRampToValueAtTime(300, t + dur);
    env(g, t, .01, .12, dur); n.connect(lp); lp.connect(g); g.connect(fx); };

  /* ---- harmony (bar index 0-11) ---- */
  const CH = { Fm: [56, 60, 65, 68], Db: [56, 61, 65, 68], Ab: [56, 60, 63, 68], Eb: [55, 58, 63, 67], Fm9: [53, 60, 63, 67, 72] };
  const ROOT = { Fm: 41, Db: 37, Ab: 44, Eb: 39, Fm9: 41 };
  const PROG = ['Fm', 'Db', 'Ab', 'Eb', 'Fm', 'Db', 'Ab', 'Eb', 'Db', 'Eb', 'Fm9', 'Fm9'];
  const barT = b => b * 2;

  /* ---- bars 1-2: the pixel ---- */
  pad(0, 2, CH.Fm, { cutoff: [300, 900], v: .08, sidechain: false, attack: .9 });
  pad(2, 2, CH.Db, { cutoff: [900, 1600], v: .1, sidechain: false, attack: .2 });
  [72, 77, 80, 84].forEach((n, i) => blip(i * BEAT, n, 1 + i * .2));          // 1 -> 2x2 -> 4x4 -> 8x8
  sweepDown(1.72, .28);                                                         // mosaic collapses
  blip(2.0, 77, 1.1); blip(3.0, 80, 1.1); blip(3.5, 89, 1.3, true);            // line 1, line 2, the pixel lands
  for (let t = 2; t < 4; t += BEAT / 4) hat(t, ((t * 4) % 2 < 1 ? .5 : .8) * (.4 + (t - 2) * .3));
  const ARP = [0, 1, 2, 3, 2, 1, 0, 2];
  for (let i = 0; i < 16; i++) pluck(2 + i * BEAT / 4, CH.Db[ARP[i % 8]] + 12, .35 + i * .03);

  /* ---- bars 3-4: Imagine more / Build smarter ---- */
  whoosh(4, .5, .8);
  for (const [b, name] of [[2, 'Ab'], [3, 'Eb']]) {
    const t0 = barT(b); pad(t0, 2, CH[name], { cutoff: [1200, 3400], v: .12 });
    for (let i = 0; i < 8; i++) { const t = t0 + i * BEAT / 2; if (t >= 7.75) break; bass(t + BEAT / 2 * 0, ROOT[name] + (i % 2 ? 12 : 0), .2, i % 2 ? .7 : 1); }
    for (let i = 0; i < 16; i++) { const t = t0 + i * BEAT / 4; if (t >= 7.75) break; pluck(t, CH[name][ARP[i % 8]] + 12, .55); hat(t, i % 2 ? .9 : .5); }
  }
  blip(4.5, 84, 1.2); blip(6.0, 87, 1.2);
  for (let t = 4; t < 7.75; t += BEAT) kick(t, t < 4.01 ? .8 : 1);
  [6.5, 7.5].forEach(t => clap(t));
  riser(6.0, 7.75, 1);
  for (let i = 0; i < 4; i++) snare(7.0 + i * .125, .4 + i * .08);           // roll: eighths...
  for (let i = 0; i < 4; i++) snare(7.5 + i * .0625, .7 + i * .08);          // ...then sixteenths into the break
  // the break: 7.75-8.0 is silent (everything above stops before it)

  /* ---- drop + montage: bars 5-9 (8-18) ---- */
  impact(8, 1);
  const HOOK = [0, 3, 6, 10, 12, 14];   // 16th positions of the stab hook
  for (let b = 4; b <= 8; b++) {
    const t0 = barT(b), name = PROG[b];
    pad(t0, 2, CH[name], { cutoff: [2000, 4200], v: .11 });
    for (let i = 0; i < 8; i++) { const t = t0 + i * BEAT / 2; bass(t, ROOT[name] + (i % 2 ? 12 : 0), .22, i % 2 ? .8 : 1); }
    for (let i = 0; i < 4; i++) kick(t0 + i * BEAT);
    clap(t0 + BEAT); clap(t0 + 3 * BEAT);
    for (let i = 0; i < 16; i++) { const t = t0 + i * BEAT / 4; hat(t, i % 4 === 2 ? 1 : i % 2 ? .75 : .45, i % 4 === 2); }
    if (b === 7) { // Kaiju Stomp: chiptune lead instead of the stab hook
      const RIFF = [75, 79, 82, 87, 82, 79, 75, 79, 77, 79, 82, 84, 87, null, 87, 91];
      RIFF.forEach((n, i) => n && chip(t0 + i * BEAT / 4, n, .11, 1));
    } else {
      const v = CH[name].map(n => n + 12);
      HOOK.forEach(p => stab(t0 + p * BEAT / 4, v, p === 0 ? 1.15 : 1));
    }
    if (b >= 5) { // montage: arp + chip pops on the tags (beat 3 eighths) + whoosh into the next bar
      for (let i = 0; i < 16; i++) pluck(t0 + i * BEAT / 4, CH[name][ARP[i % 8]] + 24, .28, .14);
      [0, 1, 2].forEach(j => blip(t0 + 1 + j * .125, 84 + j * 3, .7));
    }
    if (b < 8) whoosh(t0 + 2, .3, .9); else whoosh(18, .25, .9);
  }
  // sidechain pump on every kick 8-19.75
  for (let t = 8; t < 19.75; t += BEAT) { duck.gain.setValueAtTime(.3, t); duck.gain.linearRampToValueAtTime(1, t + .2); }
  // rapid-fire bar pumps on every eighth, so each word's hit has room to land
  for (const t of [18.25, 18.75, 19.25]) { duck.gain.setValueAtTime(.3, t); duck.gain.linearRampToValueAtTime(1, t + .18); }
  duck.gain.setValueAtTime(1, 19.8);

  /* ---- bar 10: rapid fire (18-20) ---- */
  { const t0 = 18, name = 'Eb'; pad(t0, 1.5, CH[name], { cutoff: [2500, 5000], v: .1 });
    for (let i = 0; i < 6; i++) { const t = t0 + i * .25; bass(t, ROOT[name] + (i % 2 ? 12 : 0), .2); pluck(t, [63, 67, 70, 75, 79, 82][i], 1.3, .2); stab(t, CH[name].map(n => n + 12), .7); }
    for (let i = 0; i < 4; i++) kick(t0 + i * BEAT);
    clap(18.5); clap(19.5);
    [18.25, 18.75, 19.25].forEach(t => { kick(t, .9); snare(t, .5); });      // double-time kick: every word lands on one
    for (let i = 0; i < 14; i++) hat(t0 + i * BEAT / 4, i % 2 ? .8 : .5);
    // 19.5: "Built with AI." stutters in 16ths
    for (let i = 0; i < 4; i++) { const t = 19.5 + i * .0625; stab(t, [63, 67, 70, 75], 1.1 - i * .1); blip(t, 87 - i * 2, .8); }
    // 19.75-20.0: silence
  }

  /* ---- bars 11-12: end card (20-24) ---- */
  impact(20, .85); kick(20, 1.1);
  pad(20, 3.9, CH.Fm9, { cutoff: [1800, 900], v: .14, sidechain: false, attack: .02 });
  bass(20, 41, 1.6, 1.1);
  [[20.0, 84], [20.5, 79], [21.0, 87], [21.5, 84], [22.0, 91]].forEach(([t, n], i) => bell(t, n, i === 2 ? 1.4 : 1));
  blip(21.0, 84, 1.0);                                   // CTA pops in
  for (let t = 20.25; t < 22; t += BEAT / 2) hat(t, .45);
  for (let i = 0; i < 8; i++) pluck(20 + i * BEAT / 2, CH.Fm9[[1, 2, 3, 4][i % 4]] + 12, .4 - i * .03, .3);
};
