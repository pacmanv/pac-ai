/* ==========================================================================
   PAC AI · LAUNCH FILM · 24 s · 1920x1080 (or 1080x1920 when window.FORMAT = 'vertical') · 30 fps
   Every frame is a pure function of time. Picture and score both read the
   beat grid below, so every cut and hit lands on the music by construction.
   ========================================================================== */
// formats: 'wide' 16:9 (default) · 'vertical' 9:16 (TikTok, Reels, Shorts) · 'portrait' 4:5 (Instagram feed)
const FMT = window.FORMAT || 'wide', P = FMT === 'portrait', V = FMT === 'vertical' || P;  // V = narrow, stacked layouts
const W = V ? 1080 : 1920, H = P ? 1350 : V ? 1920 : 1080, FPS = 30, DUR = 24, FRAMES = DUR * FPS;
const BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4;           // 0.5 s beats, 2 s bars, 12 bars
const bt = n => n * BEAT;                                    // n-th beat in seconds
const DROP = 8.0;                                            // bar 5 downbeat: the brand reveal

const C = { bg: '#050608', bg2: '#0b0d12', ink: '#eeede8', ink2: '#a6a8ad', ink3: '#6c6f76',
            lime: '#c8ff3d', limeInk: '#0a0d02', violet: '#8b6cff', teal: '#22c3b5' };
const SANS = (px, w = 700) => `${w} ${px}px InterV`;
const SERIF = px => `italic 400 ${px}px SerifI`;
const MONO = px => `500 ${px}px MonoP`;

/* ---- storyboard (seconds) ---- */
const SHOTS = [
  { id: 'hook',    from: 0,  to: 4,  note: 'a single lime pixel multiplies on each beat, then becomes the full stop of "Every big idea starts as a pixel."' },
  { id: 'imagine', from: 4,  to: 8,  note: 'push into the pixel; it floods lime and shatters into the ink field; "Imagine more." / "Build smarter."; riser; half-beat of black' },
  { id: 'reveal',  from: 8,  to: 10, note: 'DROP: "Pac AI" slams in out of pixels with flash, shockwave and spray; eyebrow, marquee bands, "pacai.io · now live"' },
  { id: 'p0',      from: 10, to: 12, note: "Dad's Story Lab · AI web apps" },
  { id: 'p1',      from: 12, to: 14, note: 'The Feeling Wheel for Men · Interactive tools' },
  { id: 'p2',      from: 14, to: 16, note: 'Kaiju Stomp · Games (8-bit: chunky pixels, stomp shake, chiptune lead)' },
  { id: 'p3',      from: 16, to: 18, note: 'Roast My BMW · AI vision (scanner sweep, detection boxes on the beats)' },
  { id: 'rapid',   from: 18, to: 20, note: 'six offerings, one per half beat, then "Built with AI." stutters; a quarter-beat of black' },
  { id: 'end',     from: 20, to: 24, note: 'end card: glass tile, wordmark, tagline, pacai.io pill with pulse; hold' },
];
const RAPID = [['Websites.', 'sans', C.ink], ['Web apps.', 'serif', C.lime], ['Automations.', 'sans', C.ink],
               ['Digital tools.', 'serif', C.violet], ['Games.', 'sans', C.lime], ['Prototypes.', 'serif', C.ink]];
const RAPID_T = i => 18 + i * 0.25;
const PROJECTS = [
  { img: 'img-story', key: ['AI web', 'apps.'], name: "Dad's Story Lab", kind: 'AI WEB APP', tags: ['AI stories', 'Read aloud', 'Kids'], tint: C.violet, side: 1 },
  { img: 'img-wheel', key: ['Interactive', 'tools.'], name: 'The Feeling Wheel for Men', kind: 'WEB APP', tags: ['72 feelings', 'Guided', 'Interactive'], tint: C.teal, side: -1 },
  { img: 'img-kaiju', key: ['8-bit', 'games.'], name: 'Kaiju Stomp', kind: 'HTML5 GAME', tags: ['Canvas 2D', 'Web Audio', 'Boss fights'], tint: '#ff4fa3', side: 1, pixel: true },
  { img: 'img-bmw', key: ['AI', 'vision.'], name: 'Roast My BMW', kind: 'AI WEB APP', tags: ['Vision AI', 'Serverless', 'Mobile-first'], tint: '#ffb020', side: -1 },
];

/* kicks: bars 3-4 (minus the break), drop to the rapid-fire bar, then the end hit */
const KICKS = [];
for (let t = 4; t < 7.75; t += BEAT) KICKS.push(t);
for (let t = 8; t <= 19.5 + 1e-6; t += BEAT) KICKS.push(+t.toFixed(3));
KICKS.push(18.25, 18.75, 19.25);                              // double-time kick in the rapid-fire bar
KICKS.push(20);
/* every cut (and the hard cuts inside the rapid-fire bar) for the sync check */
window.CUES = [4, 8, 10, 12, 14, 16, 18, 18.25, 18.5, 18.75, 19, 19.25, 19.5, 20];

/* ---------------------------------------------------------------- helpers */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eOut3 = k => 1 - Math.pow(1 - k, 3), eIn3 = k => k * k * k, eInOut3 = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eOutExpo = k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k), eInExpo = k => k <= 0 ? 0 : Math.pow(2, 10 * k - 10);
const eOutBack = (k, s = 1.70158) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const hash = (a, b = 0) => { let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const rng = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const kickEnv = (t, k = 7) => { let e = 0; for (const s of KICKS) if (t >= s && t - s < 1) e = Math.max(e, Math.exp(-(t - s) * k)); return e; };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const IMG = id => document.getElementById(id);

/* ---------------------------------------------------- ink field (WebGL) */
// The website's backdrop shader, driven by time and the kick envelope instead of the pointer.
const FW = V ? 360 : 640, FH = P ? 450 : V ? 640 : 360, gcv = mk(FW, FH);
const gl = gcv.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
let U = {};
if (gl) {
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;
  uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uEnergy;uniform vec3 uTint;uniform float uTintAmt;
  float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
  float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
  void main(){
    vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;vec2 m=(uMouse-.5*uRes)/uRes.y;float t=uTime*.07;
    vec2 q=vec2(fbm(p*1.3+vec2(0.,t)),fbm(p*1.3+vec2(5.2,1.3)-t));
    float d=length(p-m);float pull=exp(-d*2.4)*(.6+uEnergy*1.1);
    vec2 r=vec2(fbm(p*1.5+3.2*q+vec2(1.7,9.2)+t*1.4),fbm(p*1.5+3.2*q+vec2(8.3,2.8)-t*1.1));
    vec2 dir=p-m;r+=vec2(-dir.y,dir.x)*pull*.9;
    float f=fbm(p*1.15+2.6*r);
    vec3 col=vec3(.012,.013,.02);
    col=mix(col,vec3(.05,.12,.21),smoothstep(.2,.8,f));
    col=mix(col,vec3(.26,.13,.55),smoothstep(.5,1.1,length(q))*.7);
    col=mix(col,vec3(.02,.2,.22),smoothstep(.6,1.,r.y)*.45);
    col=mix(col,uTint*(.25+f*.6),uTintAmt*smoothstep(.35,.9,f));
    float fil=pow(smoothstep(.3,.78,r.x*f*1.3),2.6);
    col+=vec3(.78,1.,.24)*fil*(.6+uEnergy*.9);
    col+=vec3(.78,1.,.24)*exp(-d*4.)*(.1+uEnergy*.25)*(.5+f);
    vec2 v=uv-.5;col*=1.-dot(v,v)*.9;
    gl_FragColor=vec4(max(col,0.),1.);}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  for (const n of ['uRes', 'uTime', 'uMouse', 'uEnergy', 'uTint', 'uTintAmt']) U[n] = gl.getUniformLocation(pr, n);
  gl.viewport(0, 0, FW, FH);
}
const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
function inkField(t, { alpha = 1, energy = 0, mx = .5, my = .5, tint = null, tintAmt = 0 } = {}) {
  if (alpha <= 0) return;
  if (gl) {
    gl.uniform2f(U.uRes, FW, FH); gl.uniform1f(U.uTime, t + 8); gl.uniform2f(U.uMouse, mx * FW, (1 - my) * FH);
    gl.uniform1f(U.uEnergy, energy); const tc = tint ? hexRGB(tint) : [0, 0, 0]; gl.uniform3f(U.uTint, ...tc); gl.uniform1f(U.uTintAmt, tint ? tintAmt : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    ctx.save(); ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(gcv, 0, 0, W, H); ctx.restore();
  } else {
    ctx.save(); ctx.globalAlpha = alpha; const g = ctx.createRadialGradient(W * .3, H * .75, 0, W * .3, H * .75, W * .7);
    g.addColorStop(0, 'rgba(139,108,255,.45)'); g.addColorStop(1, 'rgba(5,6,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
}

/* ------------------------------------------------------------ grain */
const GRAIN = [0, 1, 2, 3].map(s => { const c = mk(256, 256), x = c.getContext('2d'), d = x.createImageData(256, 256), r = rng(s * 977 + 3);
  for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; });
function grainAndVignette(f) {
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07; ctx.fillStyle = ctx.createPattern(GRAIN[f % 4], 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

/* --------------------------------------------------- pixel text (the site's effect) */
// Runs of styled text, laid out once; each character resolves out of pixel blocks on its own clock.
const LAYOUT_CACHE = new Map(), CHAR_CACHE = new Map();
const mctx = mk(4, 4).getContext('2d');
function layoutRuns(runs, ls) {
  const key = JSON.stringify([runs, ls]); if (LAYOUT_CACHE.has(key)) return LAYOUT_CACHE.get(key);
  const chars = []; let x = 0, size = 0;
  for (const r of runs) {
    mctx.font = r.f; mctx.letterSpacing = (r.ls ?? ls ?? 0) + 'px';
    const px = parseFloat(r.f.match(/(\d+(?:\.\d+)?)px/)[1]); size = Math.max(size, px);
    for (let i = 0; i < r.t.length; i++) {
      const x0 = mctx.measureText(r.t.slice(0, i)).width, x1 = mctx.measureText(r.t.slice(0, i + 1)).width;
      chars.push({ ch: r.t[i], f: r.f, c: r.c, ls: r.ls ?? ls ?? 0, x: x + x0, w: x1 - x0, px });
    }
    x += mctx.measureText(r.t).width;
  }
  const out = { chars, width: x, size }; LAYOUT_CACHE.set(key, out); return out;
}
function charCanvas(ch) {
  const key = ch.ch + '|' + ch.f + '|' + ch.c; if (CHAR_CACHE.has(key)) return CHAR_CACHE.get(key);
  const m = Math.ceil(ch.px * .5), c = mk(Math.ceil(ch.w + m * 2 + ch.px * .3), Math.ceil(ch.px * 1.7)), x = c.getContext('2d');
  x.font = ch.f; x.fillStyle = ch.c; x.textBaseline = 'alphabetic'; x.fillText(ch.ch, m, Math.round(ch.px * 1.2));
  const out = { c, ox: m, oy: Math.round(ch.px * 1.2) }; CHAR_CACHE.set(key, out); return out;
}
const tiny = mk(1200, 600), tctx = tiny.getContext('2d');
function drawPixelated(src, dx, dy, block, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha;
  if (block <= 1.01) { ctx.drawImage(src, Math.round(dx), Math.round(dy)); ctx.restore(); return; }
  const tw = Math.max(1, Math.ceil(src.width / block)), th = Math.max(1, Math.ceil(src.height / block));
  tctx.clearRect(0, 0, tw + 2, th + 2); tctx.imageSmoothingEnabled = true; tctx.drawImage(src, 0, 0, tw, th);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tiny, 0, 0, tw, th, Math.round(dx / block) * block, Math.round(dy / block) * block, tw * block, th * block);
  ctx.restore();
}
/**
 * opts: x, y (baseline), align, t (seconds since the line starts), stagger, dur, block (max block px),
 *       rise, hold (constant residual block, e.g. 8-bit look), out (seconds since dissolve began), spray, seed
 */
function pixelLine(runs, o) {
  const L = layoutRuns(runs, o.ls);
  const x0 = o.align === 'center' ? o.x - L.width / 2 : o.align === 'right' ? o.x - L.width : o.x;
  const stagger = o.stagger ?? .03, dur = o.dur ?? .55, maxB = o.block ?? L.size * .32, rise = o.rise ?? .3;
  L.chars.forEach((ch, i) => {
    if (ch.ch === ' ') return;
    const local = (o.t - i * stagger) / dur; if (local < 0) return;
    let amount = local >= 1 ? 0 : 1 - eOut3(local), alpha = 1, dy = amount * amount * ch.px * rise;
    if (local < .22) alpha = hash(i * 31 + Math.floor(o.t * 30), 7) < .72 ? local / .22 : .15;
    if (o.out !== undefined && o.out > 0) { const k = clamp((o.out - i * (o.outStagger ?? .015)) / (o.outDur ?? .3)); amount = Math.max(amount, eIn3(k)); alpha *= 1 - k; dy -= k * ch.px * .25; }
    const block = Math.max(o.hold ?? 1, maxB * amount);
    const cc = charCanvas(ch);
    drawPixelated(cc.c, x0 + ch.x - cc.ox, o.y - cc.oy + dy, block, alpha);
    if (o.spray !== false && local < 1.1) spray(x0 + ch.x + ch.w / 2, o.y - ch.px * .35, ch.px, ch.c, o.t - i * stagger, (o.seed ?? 1) * 1000 + i);
  });
  return { x0, width: L.width, size: L.size };
}
// closed-form pixel debris: emitted while a letter resolves, falling under gravity
function spray(x, y, size, color, tl, seed, n = 7, spread = 1) {
  for (let k = 0; k < n; k++) {
    const te = k * .045, dt = tl - te, life = .55 + hash(seed, k) * .5; if (dt < 0 || dt > life) continue;
    const a = hash(seed, k + 50) * Math.PI * 2, sp = (.35 + hash(seed, k + 90)) * size * 1.9 * spread;
    const px = x + Math.cos(a) * sp * dt, py = y + (Math.sin(a) * sp - size * 1.1) * dt + size * 2.6 * dt * dt;
    const s = Math.max(3, Math.round(size * (.035 + hash(seed, k + 130) * .045)));
    ctx.globalAlpha = 1 - dt / life; ctx.fillStyle = color; ctx.fillRect(Math.round(px / s) * s, Math.round(py / s) * s, s, s);
  }
  ctx.globalAlpha = 1;
}
function textW(runs, ls) { return layoutRuns(runs, ls).width; }

/* ------------------------------------------------------ 3D project card */
const CARD_CACHE = new Map();
function cardCanvas(id, w, h, pixelated) {
  const key = id + w + 'x' + h; if (CARD_CACHE.has(key)) return CARD_CACHE.get(key);
  const c = mk(w, h), x = c.getContext('2d'), img = IMG(id), r = 28;
  x.save(); x.beginPath(); x.roundRect(0, 0, w, h, r); x.clip();
  x.imageSmoothingEnabled = !pixelated; x.fillStyle = C.bg2; x.fillRect(0, 0, w, h);
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight); x.drawImage(img, (w - img.naturalWidth * s) / 2, (h - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
  const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(.35, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.restore(); x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.roundRect(1, 1, w - 2, h - 2, r); x.stroke();
  CARD_CACHE.set(key, c); return c;
}
// perspective by vertical strips: rotY in radians, positive turns the right edge away
function card3D(src, cx, cy, w, h, rotY, scale = 1, alpha = 1, glow = null) {
  const D = 2200, N = 64, cos = Math.cos(rotY), sin = Math.sin(rotY);
  const proj = u => { const xs = (u - .5) * w, Z = xs * sin, p = D / (D + Z); return { x: cx + xs * cos * p * scale, p }; };
  ctx.save(); ctx.globalAlpha = alpha;
  if (glow) { const l = proj(0), r = proj(1); ctx.shadowColor = glow; ctx.shadowBlur = 90; ctx.fillStyle = 'rgba(0,0,0,.01)';
    ctx.beginPath(); ctx.moveTo(l.x, cy - h * l.p * scale / 2); ctx.lineTo(r.x, cy - h * r.p * scale / 2); ctx.lineTo(r.x, cy + h * r.p * scale / 2); ctx.lineTo(l.x, cy + h * l.p * scale / 2); ctx.fill(); ctx.shadowBlur = 0; }
  for (let i = 0; i < N; i++) {
    const a = proj(i / N), b = proj((i + 1) / N), pm = (a.p + b.p) / 2, hh = h * pm * scale;
    const x0 = Math.min(a.x, b.x), ww = Math.abs(b.x - a.x) + 1.2;
    ctx.drawImage(src, (i / N) * src.width, 0, src.width / N + .5, src.height, x0, cy - hh / 2, ww, hh);
    const shade = clamp((1 - pm) * 3.2, 0, .55); if (shade > .01) { ctx.fillStyle = `rgba(0,0,0,${shade})`; ctx.fillRect(x0, cy - hh / 2, ww, hh); }
  }
  ctx.restore();
}

/* ------------------------------------------------------- small pieces */
function eyebrow(text, x, y, t, color = C.ink2, dot = C.lime, align = 'left') {
  ctx.save(); ctx.font = MONO(22); ctx.letterSpacing = '5px'; ctx.textBaseline = 'middle';
  const n = Math.floor(clamp(t / .35) * text.length), s = text.slice(0, n), w = ctx.measureText(text).width;
  const xs = align === 'center' ? x - (w + 30) / 2 : x;
  if (t > 0) { ctx.fillStyle = dot; ctx.shadowColor = dot; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(xs + 7, y, 7, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
  ctx.fillStyle = color; ctx.fillText(s, xs + 30, y);
  if (n < text.length && t > 0 && Math.floor(t * 16) % 2 === 0) { const cw = ctx.measureText(s).width; ctx.fillStyle = C.lime; ctx.fillRect(xs + 32 + cw, y - 12, 13, 24); }
  ctx.restore();
}
function marqueeBand(y, angle, color, textColor, font, items, offset, alpha = 1, h = 120) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(W / 2, y); ctx.rotate(angle);
  ctx.fillStyle = color; ctx.fillRect(-W, -h / 2, W * 2, h);
  ctx.font = font; ctx.fillStyle = textColor; ctx.textBaseline = 'middle'; ctx.letterSpacing = '-2px';
  const unit = items.join('  ✦  ') + '  ✦  ', uw = ctx.measureText(unit).width;
  for (let x = -W - ((offset % uw) + uw) % uw; x < W; x += uw) ctx.fillText(unit, x, 4);
  ctx.restore();
}
function chip(text, x, y, k, tint) {
  if (k <= 0) return;
  const s = eOutBack(clamp(k), 2.4);
  ctx.save(); ctx.font = MONO(22); ctx.letterSpacing = '3px'; const w = ctx.measureText(text.toUpperCase()).width + 44;
  ctx.translate(x + w / 2, y); ctx.scale(s, s); ctx.globalAlpha = clamp(k * 3);
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.strokeStyle = tint; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-w / 2, -24, w, 48, 24); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(text.toUpperCase(), 0, 2);
  ctx.restore(); return w;
}
function ring(x, y, r, width, color, alpha) { if (alpha <= 0) return; ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }

/* ----------------------------------------------------- post effects */
const post = mk(W, H), pctx = post.getContext('2d'), chan = mk(W, H), cctx = chan.getContext('2d');
function rgbSplit(amt) {
  if (amt < .5) return;
  pctx.clearRect(0, 0, W, H); pctx.drawImage(cv, 0, 0);
  ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
  [['#ff0000', -amt], ['#00ff00', 0], ['#0000ff', amt]].forEach(([col, dx]) => {
    cctx.globalCompositeOperation = 'source-over'; cctx.clearRect(0, 0, W, H); cctx.drawImage(post, 0, 0);
    cctx.globalCompositeOperation = 'multiply'; cctx.fillStyle = col; cctx.fillRect(0, 0, W, H);
    ctx.drawImage(chan, dx, 0);
  });
  ctx.restore();
}
function sliceGlitch(seed, intensity) {
  if (intensity <= 0) return;
  pctx.clearRect(0, 0, W, H); pctx.drawImage(cv, 0, 0); const r = rng(seed);
  for (let i = 0; i < 9; i++) { const y = Math.floor(r() * H), h = 10 + Math.floor(r() * 90), dx = (r() - .5) * 160 * intensity;
    ctx.drawImage(post, 0, y, W, h, dx, y, W, h); }
}
function whip(p, dir = -1) { // horizontal smear of the current frame
  if (p <= 0) return;
  pctx.clearRect(0, 0, W, H); pctx.drawImage(cv, 0, 0); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const n = 7, spread = 260 * p; ctx.save();
  for (let i = 0; i < n; i++) { ctx.globalAlpha = 1 / n * 1.6; ctx.drawImage(post, dir * spread * (i / (n - 1) - .3), 0); }
  ctx.restore();
}
function flash(alpha, color = '#fff') { if (alpha <= 0) return; ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); }

/* ------------------------------------------------------------ camera shake */
function shake(t) {
  let a = 0;
  const hit = (s, amp, k = 9) => { if (t >= s) a += amp * Math.exp(-(t - s) * k); };
  hit(8, 26, 7); hit(20, 14, 8); hit(4, 6);
  for (let s = 14; s < 16; s += BEAT) hit(s, 13, 11);                 // kaiju stomps
  if (t > 6.5 && t < 7.75) a += 7 * seg(t, 6.5, 7.7);                  // riser rumble
  return { x: Math.sin(t * 91.3) * a + Math.sin(t * 47.1) * a * .5, y: Math.cos(t * 83.7) * a + Math.sin(t * 29.9) * a * .4 };
}

/* ================================================================ SCENES */
// each scene gets (t = global seconds, l = seconds since the shot began)

// 0–4  HOOK: one pixel, multiplying on the beat, becomes the full stop
const HOOK_PX = V ? 112 : 132;
const LINE1 = [{ t: 'Every big idea', f: SANS(HOOK_PX), c: C.ink }];
const LINE2 = [{ t: 'starts as a ', f: SANS(HOOK_PX), c: C.ink }, { t: 'pixel', f: SERIF(Math.round(HOOK_PX * 1.18)), c: C.lime }];
function hookLayout() {
  const w2 = textW(LINE2, -6), x2 = W / 2 - (w2 + 40) / 2;
  const y1 = H / 2 - 70, y2 = H / 2 + (V ? 80 : 100), s = V ? 26 : 30;
  return { y1, y2, x2: x2 - 22, dot: { x: x2 - 22 + w2 + (V ? 36 : 42), y: y2 - s / 2 - 1, s } };
}
function sceneHook(t, l) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const L = hookLayout(), cxp = W / 2, cyp = H / 2;
  // faint dot grid that pulses with the blips
  const pulse = [0, .5, 1, 1.5].reduce((m, s) => Math.max(m, l >= s ? Math.exp(-(l - s) * 5) : 0), 0);
  ctx.save(); ctx.globalAlpha = .07 + pulse * .08; ctx.fillStyle = C.ink;
  for (let x = 60; x < W; x += 60) for (let y = 60; y < H; y += 60) ctx.fillRect(x - 1.5, y - 1.5, 3, 3); ctx.restore();

  // mosaic: 1 -> 2x2 -> 4x4 -> 8x8 on beats 1-4 of bar 1, collapsing back to one pixel on the bar line
  if (l < 2.0) {
    const stage = l < .5 ? 0 : l < 1 ? 1 : l < 1.5 ? 2 : 3, n = 1 << stage, ls = [0, .5, 1, 1.5][stage];
    const grow = eOutBack(clamp((l - ls) / .22), 2.2), collapse = eInExpo(seg(l, 1.72, 2.0));
    const gap = lerp(40, 22, stage / 3) * grow * (1 - collapse);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const h = hash(i * 17 + j, stage), col = h < .55 ? C.lime : h < .78 ? C.violet : h < .92 ? C.teal : C.ink;
      const s = (V ? 26 : 30) * (stage === 0 ? grow : 1) * (1 - collapse * .4);
      const px = cxp + (i - (n - 1) / 2) * (s + gap), py = cyp + (j - (n - 1) / 2) * (s + gap);
      const flick = stage === 3 ? (hash(i * 7 + j * 13, Math.floor(l * 24)) < .12 ? .25 : 1) : 1;
      ctx.save(); ctx.globalAlpha = flick; ctx.fillStyle = col; if (col === C.lime) { ctx.shadowColor = C.lime; ctx.shadowBlur = 24; }
      ctx.fillRect(px - s / 2, py - s / 2, s, s); ctx.restore();
    }
  }
  // text: line 1 on the bar line (2.0), line 2 on beat 3 (3.0)
  if (l >= 2.0) pixelLine(LINE1, { x: W / 2, y: L.y1, align: 'center', t: l - 2.0, ls: -6, stagger: .035, seed: 1 });
  if (l >= 3.0) pixelLine(LINE2, { x: L.x2, y: L.y2, t: l - 3.0, ls: -6, stagger: .03, seed: 2 });
  // the pixel: waits at centre, then flies into place as the full stop on beat 4 (3.5)
  if (l >= 1.9) {
    const k = eInOut3(seg(l, 3.18, 3.5)), land = l >= 3.5 ? Math.exp(-(l - 3.5) * 9) : 0;
    const px = lerp(cxp, L.dot.x, k), py = lerp(cyp, L.dot.y, k) - Math.sin(k * Math.PI) * 140;
    const sx = L.dot.s * (1 + land * .5), sy = L.dot.s * (1 - land * .35);
    ctx.save(); ctx.fillStyle = C.lime; ctx.shadowColor = C.lime; ctx.shadowBlur = 30 + land * 40;
    ctx.fillRect(px - sx / 2, py - sy / 2 + (L.dot.s - sy) / 2, sx, sy); ctx.restore();
    if (l >= 3.5) for (let r = 0; r < 2; r++) ring(L.dot.x, L.dot.y, 20 + (l - 3.5) * 520 + r * 40, 3, C.lime, (1 - seg(l, 3.5, 3.95)) * .7);
  }
}

// 4–8  IMAGINE MORE / BUILD SMARTER: push into the full stop, flood, shatter into the ink field
function sceneImagine(t, l) {
  const L = hookLayout();
  if (l < .42) { // push into the pixel
    const z = 1 + eInExpo(seg(l, 0, .42)) * 70;
    ctx.save(); ctx.translate(L.dot.x, L.dot.y); ctx.scale(z, z); ctx.translate(-L.dot.x, -L.dot.y); sceneHook(t, 4); ctx.restore();
    return;
  }
  inkField(t, { energy: kickEnv(t) * .9 + .2, mx: .5 + Math.sin(t * .6) * .25, my: .55 + Math.cos(t * .5) * .15 });
  // the lime flood shatters into blocks that fall away
  const sh = seg(l, .42, .95);
  if (sh < 1) { const bs = 120, cols = Math.ceil(W / bs), rows = Math.ceil(H / bs);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const h = hash(i * 131 + j, 9), k = clamp((sh - h * .6) / .4);
      if (k >= 1) continue; ctx.globalAlpha = 1 - k; ctx.fillStyle = C.lime; const s = bs * (1 - k * .6);
      ctx.fillRect(i * bs + (bs - s) / 2, j * bs + (bs - s) / 2 + k * k * 160, s, s); } ctx.globalAlpha = 1; }
  // slow push for the two lines; then the suck-in before the break
  const suck = eInExpo(seg(l, 3.5, 3.75)), z = (1 + l * .015) * (1 - suck * .55);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); ctx.globalAlpha = 1 - suck;
  if (V) { // stacked: one word per line
    const ys = P ? [250, 450, 625, 830, 1030] : [600, 830, 1020, 1240, 1450], fp = P ? 192 : 214;
    eyebrow('PAC AI · 2026', 82, ys[0], l - .55);
    pixelLine([{ t: 'Imagine', f: SANS(fp), c: C.ink }], { x: 66, y: ys[1], t: l - .5, ls: -11, stagger: .032, seed: 3 });
    pixelLine([{ t: 'more.', f: SANS(fp), c: C.ink }], { x: 66, y: ys[2], t: l - .72, ls: -11, stagger: .032, seed: 31 });
    pixelLine([{ t: 'Build', f: SANS(fp), c: C.ink }], { x: 66, y: ys[3], t: l - 2.0, ls: -11, stagger: .032, seed: 4 });
    pixelLine([{ t: 'smarter.', f: SERIF(Math.round(fp * 1.17)), c: C.lime }], { x: 56, y: ys[4], t: l - 2.15, ls: -6, stagger: .032, seed: 41 });
  } else {
    eyebrow('PAC AI · 2026', 230, 300, l - .55);
    pixelLine([{ t: 'Imagine more.', f: SANS(214), c: C.ink }], { x: 220, y: 510, t: l - .5, ls: -11, stagger: .032, seed: 3 });
    pixelLine([{ t: 'Build ', f: SANS(214), c: C.ink }, { t: 'smarter.', f: SERIF(250), c: C.lime }], { x: 360, y: 740, t: l - 2.0, ls: -11, stagger: .032, seed: 4 });
  }
  ctx.restore();
  if (l >= 3.75) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); } // the break: a quarter beat of black
}

// 8–10  REVEAL on the drop
const MARQ = ['AI web apps', 'Games', 'Automations', 'Interactive tools', 'Prototypes', 'Shipped fast'];
function sceneReveal(t, l) {
  inkField(t, { energy: kickEnv(t) + .4 * Math.exp(-l * 3), mx: .5, my: .5 });
  // marquee bands sweep in on beat 3 (9.0)
  const mq = eOutExpo(seg(l, 1.0, 1.45));
  if (mq > 0) {
    const my = V ? [H * .5 + 300, H * .5 + 450] : [H * .5 + 255, H * .5 + 440], mf = V ? [64, 70] : [78, 84], mh = V ? 98 : 112;
    marqueeBand(my[0], -.05, C.lime, C.limeInk, SANS(mf[0]), MARQ, l * 420 + (1 - mq) * 1600, 1, mh);
    marqueeBand(my[1], .03, C.bg2, C.ink, SERIF(mf[1]), MARQ, -l * 360 - (1 - mq) * 1600, 1, mh);
  }
  // shockwave rings from the wordmark
  for (let r = 0; r < 3; r++) ring(W / 2, H / 2 - 40, 60 + eOut3(seg(l, r * .06, .7 + r * .06)) * 1300, 10 - r * 3, r === 1 ? C.violet : C.lime, (1 - seg(l, r * .06, .7 + r * .06)) * .9);
  // wordmark: slams from 1.22 to 1 with a micro overshoot, resolving out of chunky pixels in a quarter beat
  const s = l < .02 ? 1.22 : 1 + .22 * Math.exp(-l * 14) * Math.cos(l * 30);
  ctx.save(); ctx.translate(W / 2, H / 2 - 40); ctx.scale(s, s); ctx.translate(-W / 2, -(H / 2 - 40));
  pixelLine([{ t: 'Pac ', f: SANS(V ? 236 : 300), c: C.ink }, { t: 'AI', f: SERIF(V ? 268 : 340), c: C.lime }], { x: W / 2, y: H / 2 + (V ? 40 : 60), align: 'center', t: l + .06, ls: V ? -11 : -14, stagger: .02, dur: .3, block: V ? 56 : 70, rise: .05, seed: 5 });
  ctx.restore();
  // big spray burst
  for (let i = 0; i < 26; i++) spray(W / 2 + (hash(i, 3) - .5) * (V ? 520 : 700), H / 2 - 40 + (hash(i, 4) - .5) * 160, 140, hash(i, 5) < .6 ? C.lime : C.ink, l, 7000 + i, 3, 1.4);
  eyebrow('INDEPENDENT AI GARAGE', W / 2, H / 2 - (V ? 200 : 230), l - .5, C.ink2, C.lime, 'center');
  if (l >= 1.5) { const k = eOutBack(seg(l, 1.5, 1.75), 2); ctx.save(); ctx.globalAlpha = clamp((l - 1.5) * 6); ctx.font = MONO(30); ctx.letterSpacing = '6px'; ctx.textAlign = 'center'; ctx.fillStyle = C.lime;
    ctx.translate(W / 2, H / 2 + (V ? 150 : 175)); ctx.scale(k, k); ctx.fillText('PACAI.IO  ·  NOW LIVE', 0, 0); ctx.restore(); }
}

// 10–18  PROJECTS: one bar each
function sceneProject(t, l, i) {
  const PJ = PROJECTS[i], side = PJ.side, e = kickEnv(t);
  inkField(t, { energy: e * .8 + .1, mx: side > 0 ? .25 : .75, my: .5, tint: PJ.tint, tintAmt: .5, alpha: .9 });
  // ghost number drifting behind
  ctx.save(); ctx.font = SANS(560, 800); ctx.letterSpacing = '-30px'; ctx.fillStyle = 'rgba(255,255,255,.045)'; ctx.textBaseline = 'alphabetic';
  if (V) ctx.font = SANS(470, 800);
  ctx.textAlign = side > 0 ? 'left' : 'right'; ctx.fillText('0' + (i + 1), side > 0 ? 40 - l * 30 : W - 40 + l * 30, P ? H - 50 : V ? 1560 : H - 60); ctx.restore();
  // card: swings in on the downbeat, punches on beat 3
  const cw = P ? 780 : V ? 880 : 1000, ch = cw * .625, cx = P ? W / 2 : V ? W / 2 - 40 : side > 0 ? W - 120 - cw / 2 : 120 + cw / 2, cy = P ? 335 : V ? 560 : H / 2 + 10;
  const swing = eOutExpo(seg(l, 0, .5)), rot = side * (lerp(-1.0, -.26, swing) + l * .03);
  const punch = 1 + .045 * (l >= 1 ? Math.exp(-(l - 1) * 7) : 0);
  const slide = (1 - swing) * side * 500;
  let shx = 0, shy = 0;
  if (PJ.pixel) for (let s = 0; s < 2; s += BEAT) if (l >= s) { const a = Math.exp(-(l - s) * 12) * 14; shy += Math.sin((l - s) * 70) * a; }
  const card = cardCanvas(PJ.img, cw, ch, PJ.pixel);
  card3D(card, cx + slide + shx, cy + shy, cw, ch, rot, punch * (PJ.pixel ? 1 : 1), clamp(swing * 3), PJ.tint);
  // Kaiju: pixel debris kicked up by each stomp
  if (PJ.pixel) for (let s = 0; s < 2; s += BEAT) for (let k = 0; k < 6; k++) spray(cx - cw * .36 + hash(k, s * 10) * cw * .72, cy + ch / 2 - 30, 120, ['#ff4fa3', C.lime, '#4fd2ff'][k % 3], l - s, 900 + s * 100 + k, 2, 1.2);
  // Roast My BMW: scanner sweep and detection boxes on the beats
  if (i === 3) {
    const sy = cy - ch / 2 + ((l * 1.1) % 1) * ch * .9 + 30;
    ctx.save(); ctx.globalAlpha = .85; const g = ctx.createLinearGradient(0, sy - 40, 0, sy + 4); g.addColorStop(0, 'rgba(200,255,61,0)'); g.addColorStop(1, 'rgba(200,255,61,.55)');
    ctx.fillStyle = g; ctx.fillRect(cx - cw * .44, sy - 40, cw * .88, 44); ctx.fillStyle = C.lime; ctx.fillRect(cx - cw * .44, sy, cw * .88, 3); ctx.restore();
    [[.5, -.25, .1, .26, .2, 'GRILLE 98%'], [1.0, .12, .18, .22, .18, 'BADGE 87%'], [1.5, -.05, .3, .24, .16, 'EXHAUST 91%']].forEach(([at, ox, oy, bw, bh, lab]) => {
      if (l < at) return; const k = eOutBack(seg(l, at, at + .16), 2.5), x = cx + ox * cw, y = cy - ch / 2 + oy * ch + 60, w = bw * cw * k, h = bh * ch * k;
      ctx.save(); ctx.strokeStyle = C.lime; ctx.lineWidth = 3; ctx.globalAlpha = clamp((l - at) * 8);
      const c = 22; [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy2]) => { ctx.beginPath(); ctx.moveTo(x + sx * w / 2, y + sy2 * h / 2 - sy2 * c); ctx.lineTo(x + sx * w / 2, y + sy2 * h / 2); ctx.lineTo(x + sx * w / 2 - sx * c, y + sy2 * h / 2); ctx.stroke(); });
      ctx.fillStyle = C.lime; ctx.font = MONO(18); ctx.letterSpacing = '2px'; const tw = ctx.measureText(lab).width + 16;
      ctx.fillRect(x - w / 2, y - h / 2 - 30, tw, 26); ctx.fillStyle = C.limeInk; ctx.fillText(lab, x - w / 2 + 8, y - h / 2 - 11); ctx.restore(); });
  }
  // copy block
  const tx = V ? 76 : side > 0 ? 110 : W - 110 - 640, align = 'left';
  // vertical: copy sits under the card; wide: beside it
  const Y = P ? { eb: 670, k1: 800, k2: 920, name: 990, tags: 1050 } : V ? { eb: 960, k1: 1115, k2: 1250, name: 1330, tags: 1400 } : { eb: 250, k1: 430, k2: 590, name: 690, tags: 790 };
  const kp = P ? 112 : V ? 128 : 150;
  eyebrow(`0${i + 1} / 04 · ${PJ.kind}`, tx, Y.eb, l - .05, C.ink2, PJ.tint);
  const k1 = [{ t: PJ.key[0], f: SANS(kp), c: C.ink }], k2 = [{ t: PJ.key[1], f: PJ.pixel ? SANS(Math.round(kp * 1.07), 800) : SERIF(Math.round(kp * 1.17)), c: C.lime }];
  pixelLine(k1, { x: tx, y: Y.k1, align, t: l, ls: PJ.pixel ? 2 : -7, stagger: .03, dur: .45, hold: PJ.pixel ? 7 : 1, seed: 10 + i });
  pixelLine(k2, { x: tx, y: Y.k2, align, t: l - .12, ls: PJ.pixel ? 2 : -4, stagger: .03, dur: .45, hold: PJ.pixel ? 7 : 1, seed: 20 + i });
  // project name slides up on beat 2
  const nk = eOutExpo(seg(l, .5, .85));
  if (nk > 0) { ctx.save(); ctx.globalAlpha = nk; ctx.font = SANS(44, 600); ctx.letterSpacing = '-1px'; ctx.fillStyle = C.ink; ctx.fillText(PJ.name, tx, Y.name + (1 - nk) * 40);
    ctx.fillStyle = PJ.tint; ctx.fillRect(tx, Y.name + 28 + (1 - nk) * 40, 90 * nk, 4); ctx.restore(); }
  // tags pop on the eighths after beat 3
  let cx2 = tx; PJ.tags.forEach((tg, j) => { const w = chip(tg, cx2, Y.tags + (V ? 26 : 0), (l - 1 - j * .125) / .2, PJ.tint); if (w) cx2 += w + 14; });
}

// 18–20  RAPID FIRE: one offering per half beat, then the stutter
function sceneRapid(t, l) {
  inkField(t, { energy: kickEnv(t) + .3, mx: .5 + Math.sin(t * 3) * .3, my: .5 });
  const idx = Math.floor(l / .25);
  if (idx < RAPID.length) {
    const [word, style, col] = RAPID[idx], wl = l - idx * .25, base = style === 'serif' ? 300 : 250, mk2 = px => style === 'serif' ? SERIF(px) : SANS(px);
    // shrink long words to fit the frame (matters in 9:16)
    const w0 = textW([{ t: word, f: mk2(base), c: col }], style === 'serif' ? -4 : -12), maxW = V ? 800 : 1700;
    const f = mk2(w0 > maxW ? Math.floor(base * maxW / w0) : base);
    const zoom = 1.12 - eOut3(clamp(wl / .25)) * .12;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2);
    pixelLine([{ t: word, f, c: col }], { x: FMT === 'vertical' ? W / 2 - 40 : W / 2, y: H / 2 + 80, align: 'center', t: wl + .02, ls: style === 'serif' ? -4 : -12, stagger: .008, dur: .12, block: 40, rise: .05, spray: false, seed: 40 + idx });
    ctx.restore();
    ctx.save(); ctx.font = MONO(26); ctx.letterSpacing = '6px'; ctx.fillStyle = C.ink3; ctx.textAlign = 'center'; ctx.fillText(`0${idx + 1} / 06`, W / 2, P ? H / 2 + 280 : V ? H / 2 + 330 : H - 150); ctx.restore();
    // progress ticks
    for (let j = 0; j < 6; j++) { ctx.fillStyle = j <= idx ? C.lime : 'rgba(255,255,255,.15)'; ctx.fillRect(W / 2 - 3 * 70 + j * 70, P ? H / 2 + 310 : V ? H / 2 + 360 : H - 120, 56, 6); }
  } else if (l < 1.75) {
    const wl = l - 1.5;
    if (V) {
      pixelLine([{ t: 'Built with', f: SANS(190), c: C.ink }], { x: W / 2, y: H / 2 - 30, align: 'center', t: wl + .06, ls: -9, stagger: .004, dur: .09, block: 46, rise: .05, spray: false, seed: 60 });
      pixelLine([{ t: 'AI.', f: SERIF(300), c: C.lime }], { x: W / 2, y: H / 2 + 230, align: 'center', t: wl + .06, ls: -6, stagger: .004, dur: .09, block: 56, rise: .05, spray: false, seed: 61 });
    } else
    pixelLine([{ t: 'Built with ', f: SANS(210), c: C.ink }, { t: 'AI.', f: SERIF(250), c: C.lime }], { x: W / 2, y: H / 2 + 70, align: 'center', t: wl + .06, ls: -10, stagger: .004, dur: .09, block: 50, rise: .05, spray: false, seed: 60 });
  }
  if (l >= 1.75) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
}

// 20–24  END CARD
function sceneEnd(t, l) {
  const push = 1 + l * .012;
  inkField(t, { energy: (t >= 20 ? Math.exp(-l * 3) * .8 : 0) + .25, mx: .5 + Math.sin(t * .4) * .1, my: .48, alpha: 1 });
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(push, push); ctx.translate(-W / 2, -H / 2);
  const ringY = P ? H / 2 - 300 : V ? H / 2 - 330 : H / 2 - 70;
  for (let r = 0; r < 2; r++) ring(W / 2, ringY, 100 + eOut3(seg(l, r * .08, .9 + r * .08)) * 1100, 6 - r * 2, C.lime, (1 - seg(l, r * .08, .9 + r * .08)) * .6);
  // lockup: glass tile + wordmark
  const word = [{ t: 'Pac ', f: SANS(200), c: C.ink }, { t: 'AI', f: SERIF(226), c: C.lime }], ww = textW(word, -9);
  // wide: tile beside the wordmark; vertical: tile stacked above it
  const tile = P ? 220 : V ? 250 : 230, gap = 50, total = tile + gap + ww, cyL = P ? H / 2 - 60 : V ? H / 2 - 40 : H / 2 - 70;
  const x0 = V ? W / 2 - ww / 2 - tile - gap : W / 2 - total / 2;
  const tileX = V ? W / 2 : x0 + tile / 2, tileY = P ? H / 2 - 300 : V ? H / 2 - 330 : cyL;
  const tk = eOutBack(seg(l, 0, .45), 1.8), rot = (1 - eOut3(seg(l, 0, .5))) * -.35;
  ctx.save(); ctx.translate(tileX, tileY); ctx.rotate(rot); ctx.scale(tk, tk);
  ctx.shadowColor = 'rgba(200,255,61,.35)'; ctx.shadowBlur = 70; ctx.drawImage(IMG('img-mark'), -tile / 2 - tile * .09, -tile / 2 - tile * .09, tile * 1.18, tile * 1.18); ctx.restore();
  pixelLine(word, { x: x0 + tile + gap, y: cyL + 72, t: l - .15, ls: -9, stagger: .04, dur: .5, seed: 70 });
  // tagline on beat 2 (two lines in vertical)
  if (V) {
    pixelLine([{ t: 'Imagine more.', f: SANS(64, 600), c: C.ink2 }], { x: W / 2, y: cyL + 210, align: 'center', t: l - .5, ls: -1, stagger: .018, dur: .4, block: 16, seed: 71 });
    pixelLine([{ t: 'Build smarter.', f: SERIF(80), c: C.lime }], { x: W / 2, y: cyL + 300, align: 'center', t: l - .62, ls: -1, stagger: .018, dur: .4, block: 16, seed: 72 });
  } else
  pixelLine([{ t: 'Imagine more. ', f: SANS(58, 600), c: C.ink2 }, { t: 'Build smarter.', f: SERIF(68), c: C.lime }], { x: W / 2, y: cyL + 230, align: 'center', t: l - .5, ls: -1, stagger: .018, dur: .4, block: 16, seed: 71 });
  // CTA pill on beat 3 (21.0): the site's primary button, glow and pulse ring
  if (l >= 1.0) {
    const k = eOutBack(seg(l, 1.0, 1.3), 2.2), pw = 520, ph = 104, px = W / 2, py = cyL + (P ? 420 : V ? 450 : 360);
    const pulse = ((l - 1.0) % 1.4) / 1.4;
    ctx.save(); ctx.translate(px, py); ctx.scale(k, k);
    ctx.strokeStyle = `rgba(200,255,61,${(1 - pulse) * .6})`; ctx.lineWidth = 3; const g = 6 + pulse * 30;
    ctx.beginPath(); ctx.roundRect(-pw / 2 - g, -ph / 2 - g, pw + g * 2, ph + g * 2, ph / 2 + g); ctx.stroke();
    ctx.shadowColor = 'rgba(200,255,61,.65)'; ctx.shadowBlur = 60; ctx.fillStyle = C.lime; ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fill(); ctx.shadowBlur = 0;
    // light sweep across the pill on beat 1 of bar 12
    const sw = seg(l, 2.0, 2.6); if (sw > 0 && sw < 1) { ctx.save(); ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2); ctx.clip();
      const sx = -pw / 2 - 160 + sw * (pw + 320), gr = ctx.createLinearGradient(sx - 90, 0, sx + 90, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gr; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); ctx.restore(); }
    ctx.fillStyle = C.limeInk; ctx.font = SANS(50, 700); ctx.letterSpacing = '-1px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('pacai.io  →', 0, 3);
    ctx.restore();
  }
  if (l >= 1.25) eyebrow('NOW LIVE', W / 2, P ? H / 2 - 470 : V ? H / 2 - 520 : cyL - 230, l - 1.25, C.ink2, C.lime, 'center');
  ctx.restore();
}

/* ================================================================ DRAW */
function draw(frame) {
  const t = frame / FPS;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const sk = shake(t); ctx.translate(sk.x, sk.y);
  // whip transitions straddle the project cuts: outgoing scene smears out, incoming smears in
  const shot = SHOTS.find(s => t >= s.from && t < s.to) || SHOTS[SHOTS.length - 1], l = t - shot.from;
  const render = id => {
    if (id === 'hook') sceneHook(t, t);
    else if (id === 'imagine') sceneImagine(t, t - 4);
    else if (id === 'reveal') sceneReveal(t, t - 8);
    else if (id[0] === 'p') sceneProject(t, t - 10 - 2 * +id[1], +id[1]);
    else if (id === 'rapid') sceneRapid(t, t - 18);
    else sceneEnd(t, t - 20);
  };
  render(shot.id);
  ctx.restore();
  // post: whips into the montage cuts (outgoing last 0.18 s, incoming first 0.12 s)
  for (const cut of [10, 12, 14, 16, 18]) {
    if (t >= cut - .18 && t < cut) whip(eIn3(seg(t, cut - .18, cut)), -1);
    if (t >= cut && t < cut + .12) whip(1 - eOut3(seg(t, cut, cut + .12)), -1);
  }
  // hits: flash and chromatic split on the drop and the end card, glitch on the stutter
  if (t >= 8 && t < 8.6) { rgbSplit(26 * Math.exp(-(t - 8) * 9)); flash(.85 * Math.exp(-(t - 8) * 14), '#f4ffd6'); }
  if (t >= 20 && t < 20.5) { rgbSplit(14 * Math.exp(-(t - 20) * 10)); flash(.5 * Math.exp(-(t - 20) * 14), '#f4ffd6'); }
  if (t >= 4.35 && t < 4.45) flash(1, C.lime);
  if (t >= 19.5 && t < 19.75) { const q = Math.floor((t - 19.5) * 16); if (q % 2) { sliceGlitch(q * 31 + 7, 1); rgbSplit(18); } else rgbSplit(4); }
  for (const s of [10, 12, 14, 16]) if (t >= s && t < s + .2) rgbSplit(10 * Math.exp(-(t - s) * 18));
  grainAndVignette(frame);
  if (t > 23.7) flash(seg(t, 23.7, 24) , '#000');
}

window.FRAMES = FRAMES; window.FPS = FPS; window.draw = draw;
window.SHOTS = SHOTS;
