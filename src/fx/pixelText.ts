import { SplitText } from 'gsap/SplitText'

/**
 * Pixel text: type that resolves out of chunky pixel blocks into crisp
 * letters, then keeps reacting. Characters near the pointer briefly
 * re-pixelate, a few can glitch on their own every few seconds, and reveals
 * and dissolves throw off a spray of square "pixels" in each letter's colour.
 *
 * The real text stays in the DOM (screen readers, selection, layout). While a
 * character is animating, its DOM glyph is made transparent and a canvas
 * overlay draws a mosaic of it in the same place.
 */

type Kind = 'reveal' | 'glitch' | 'out'

interface Char {
  el: HTMLElement
  /** cached crisp bitmap of the glyph, at device pixels */
  bmp: HTMLCanvasElement | null
  bmpKey: string
  fontPx: number
  /** active animation, if any */
  anim: { start: number; dur: number; maxBlock: number; kind: Kind; jitter: number } | null
  cooldownUntil: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  max: number
  color: string
}

export interface PixelTextOptions {
  /** seconds between one letter starting and the next (default 0.03) */
  stagger?: number
  /** a short run of letters glitches every few seconds once revealed */
  ambient?: boolean
  /** letters start visible (e.g. a logo), instead of hidden until `reveal` */
  startVisible?: boolean
  /** duration multiplier: below 1 is faster (default 1) */
  speed?: number
  /** pixel block size multiplier: above 1 is chunkier (default 1) */
  blockScale?: number
}

export interface PixelText {
  /** resolve the text in out of pixels, after `delay` seconds (visible text bursts into pixels first) */
  reveal(delay?: number): void
  /** briefly re-pixelate every letter, leaving the text visible */
  glitch(delay?: number): void
  /** break the text up into pixels and let it fade away, after `delay` seconds */
  dissolve(delay?: number): void
  destroy(): void
}

const now = () => performance.now() / 1000
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeIn = (t: number) => t * t * t

export function createPixelText(el: HTMLElement, opts: PixelTextOptions = {}): PixelText {
  const stagger = opts.stagger ?? 0.03
  const speed = opts.speed ?? 1
  const blockScale = opts.blockScale ?? 1
  const split = SplitText.create(el, { type: 'words, chars', charsClass: 'px-char', wordsClass: 'px-word' })
  const chars: Char[] = (split.chars as HTMLElement[]).map((c) => ({
    el: c,
    bmp: null,
    bmpKey: '',
    fontPx: 16,
    anim: null,
    cooldownUntil: 0,
  }))
  // hidden until revealed (unless told otherwise); the canvas draws letters while they animate
  if (!opts.startVisible) chars.forEach((c) => (c.el.style.opacity = '0'))

  // the overlay is positioned against the element itself
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
  const canvas = document.createElement('canvas')
  canvas.className = 'px-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  // zero-sized until the first frame sizes it (a default 300x150 canvas could poke past the window edge)
  canvas.width = 0
  canvas.height = 0
  canvas.style.left = '0px'
  canvas.style.top = '0px'
  el.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  const tiny = document.createElement('canvas')
  const tctx = tiny.getContext('2d')!
  let particles: Particle[] = []
  let raf = 0
  let revealed = !!opts.startVisible
  let destroyed = false
  let ambientTimer = 0
  const timers: number[] = []

  const dpr = () => Math.min(2, window.devicePixelRatio || 1)

  /** draw one glyph crisp into its own canvas, matching the DOM's font and colour */
  function bitmapFor(c: Char): HTMLCanvasElement {
    const cs = getComputedStyle(c.el)
    const r = dpr()
    const fontPx = parseFloat(cs.fontSize)
    const key = `${c.el.textContent}|${cs.textTransform}|${cs.fontStyle}|${cs.fontWeight}|${cs.fontSize}|${cs.fontFamily}|${cs.color}|${r}`
    if (c.bmp && c.bmpKey === key) return c.bmp
    const raw = c.el.textContent ?? ''
    const text = cs.textTransform === 'uppercase' ? raw.toUpperCase() : cs.textTransform === 'lowercase' ? raw.toLowerCase() : raw
    const font = `${cs.fontStyle} ${cs.fontWeight} ${fontPx * r}px ${cs.fontFamily}`
    const rect = c.el.getBoundingClientRect()
    const scale = c.el.offsetWidth ? rect.width / c.el.offsetWidth : 1
    const m = Math.ceil(fontPx * 0.45 * r)
    const w = Math.ceil((rect.width / scale) * r) + m * 2
    const lineH = (rect.height / scale) * r
    const h = Math.ceil(lineH) + m * 2
    const bmp = c.bmp ?? document.createElement('canvas')
    bmp.width = w
    bmp.height = h
    const b = bmp.getContext('2d')!
    b.clearRect(0, 0, w, h)
    b.font = font
    b.fillStyle = cs.color
    b.textBaseline = 'alphabetic'
    const met = b.measureText(text)
    const asc = met.fontBoundingBoxAscent ?? fontPx * r * 0.9
    const desc = met.fontBoundingBoxDescent ?? fontPx * r * 0.25
    // inline-block glyph box: the font's content area is centred in the line box
    const baseline = m + (lineH - (asc + desc)) / 2 + asc
    b.fillText(text, m, baseline)
    c.bmp = bmp
    c.bmpKey = key
    c.fontPx = fontPx
    return bmp
  }

  function start(c: Char, kind: Kind, delay: number) {
    const fontPx = parseFloat(getComputedStyle(c.el).fontSize)
    const base = kind === 'reveal' ? 0.95 + Math.random() * 0.25 : kind === 'out' ? 0.5 + Math.random() * 0.15 : 0.45 + Math.random() * 0.2
    c.anim = {
      start: now() + delay,
      dur: base * speed,
      maxBlock: Math.max(3, fontPx * (kind === 'glitch' ? 0.14 : 0.3) * blockScale),
      kind,
      jitter: (Math.random() - 0.5) * 2,
    }
    c.cooldownUntil = c.anim.start + c.anim.dur + 1.2
    if (!raf) raf = requestAnimationFrame(frame)
  }

  function spray(x: number, y: number, size: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = (0.4 + Math.random()) * size * 0.06
      particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - size * 0.03,
        size: Math.max(2, Math.round(size * (0.04 + Math.random() * 0.05))),
        life: 0,
        max: 0.6 + Math.random() * 0.6,
        color,
      })
    }
  }

  let last = now()
  function frame() {
    raf = 0
    if (destroyed) return
    const t = now()
    const dt = Math.min(0.05, t - last)
    last = t
    const r = dpr()

    // size the canvas to the element, with room for descenders and italics,
    // but never past the left or right edge of the window (that would let the page scroll sideways)
    const host = el.getBoundingClientRect()
    const scale = el.offsetWidth ? host.width / el.offsetWidth : 1
    const pad = 0.5 * parseFloat(getComputedStyle(el).fontSize)
    const vw = document.documentElement.clientWidth
    const padL = Math.floor(Math.max(0, Math.min(pad, host.left / scale)))
    const padR = Math.floor(Math.max(0, Math.min(pad, (vw - host.right) / scale)))
    const cssW = el.offsetWidth + padL + padR
    const cw = Math.ceil(cssW * r)
    const ch = Math.ceil((el.offsetHeight + pad * 2) * r)
    if (canvas.width !== cw || canvas.height !== ch || canvas.dataset.padL !== String(padL)) {
      canvas.width = cw
      canvas.height = ch
      canvas.dataset.padL = String(padL)
      canvas.style.left = `${-padL}px`
      canvas.style.top = `${-pad}px`
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${el.offsetHeight + pad * 2}px`
    }
    ctx.clearRect(0, 0, cw, ch)
    ctx.imageSmoothingEnabled = false

    let active = false
    for (const c of chars) {
      const a = c.anim
      if (!a) continue
      active = true
      const local = (t - a.start) / a.dur
      if (local < 0) continue
      if (local >= 1) {
        c.anim = null
        // a dissolved letter stays gone; everything else lands back on the real text
        c.el.style.opacity = a.kind === 'out' ? '0' : '1'
        continue
      }
      c.el.style.opacity = '0'
      const bmp = bitmapFor(c)
      const rect = c.el.getBoundingClientRect()
      const m = Math.ceil(c.fontPx * 0.45 * r)
      // reveal and glitch resolve big blocks down to 1px; a dissolve grows them
      const amount = a.kind === 'out' ? easeIn(local) : 1 - easeOut(local)
      const block = Math.max(1, Math.round(a.maxBlock * r * amount))
      let x = ((rect.left - host.left) / scale + padL) * r - m
      let y = ((rect.top - host.top) / scale + pad) * r - m
      if (a.kind === 'reveal') y += Math.round(amount * amount * c.fontPx * 0.35 * r)
      else if (a.kind === 'out') y -= Math.round(amount * c.fontPx * 0.3 * r)
      else x += Math.round(a.jitter * amount * c.fontPx * 0.12 * r)
      // snap to the block grid so neighbouring letters share one pixel lattice
      x = Math.round(x / block) * block
      y = Math.round(y / block) * block
      if (a.kind === 'reveal') ctx.globalAlpha = local < 0.25 ? (Math.random() < 0.7 ? local * 4 : 0.15) : 1
      else if (a.kind === 'out') ctx.globalAlpha = local > 0.55 ? (Math.random() < 0.75 ? (1 - local) / 0.45 : 0.1) : 1
      else ctx.globalAlpha = 1
      if (block <= 1) {
        ctx.drawImage(bmp, x, y)
      } else {
        const tw = Math.ceil(bmp.width / block)
        const th = Math.ceil(bmp.height / block)
        if (tiny.width < tw) tiny.width = tw
        if (tiny.height < th) tiny.height = th
        tctx.clearRect(0, 0, tw, th)
        tctx.imageSmoothingEnabled = true
        tctx.drawImage(bmp, 0, 0, tw, th)
        ctx.drawImage(tiny, 0, 0, tw, th, x, y, tw * block, th * block)
      }
      const sprays = (a.kind === 'reveal' && local < 0.5) || (a.kind === 'out' && local > 0.3)
      if (sprays && Math.random() < 0.25) {
        spray(x + bmp.width / 2, y + bmp.height / 2, c.fontPx * r, getComputedStyle(c.el).color, a.kind === 'out' ? 2 : 1)
      }
    }
    ctx.globalAlpha = 1

    // pixel spray
    particles = particles.filter((p) => (p.life += dt) < p.max)
    for (const p of particles) {
      p.x += p.vx * dt * 60
      p.y += p.vy * dt * 60
      p.vy += 0.02 * dt * 60 * r
      ctx.globalAlpha = 1 - p.life / p.max
      ctx.fillStyle = p.color
      const s = p.size
      ctx.fillRect(Math.round(p.x / s) * s, Math.round(p.y / s) * s, s, s)
    }
    ctx.globalAlpha = 1

    if (active || particles.length) raf = requestAnimationFrame(frame)
  }

  // pointer: letters near the cursor re-pixelate for a moment
  const onMove = (e: PointerEvent) => {
    if (!revealed || e.pointerType !== 'mouse') return
    const t = now()
    for (const c of chars) {
      if (c.anim || t < c.cooldownUntil || c.el.style.opacity === '0') continue
      const rc = c.el.getBoundingClientRect()
      const dx = e.clientX - (rc.left + rc.width / 2)
      const dy = e.clientY - (rc.top + rc.height / 2)
      const reach = Math.max(rc.height * 0.9, 18)
      if (dx * dx + dy * dy < reach * reach) start(c, 'glitch', (Math.hypot(dx, dy) / reach) * 0.08)
    }
  }
  el.addEventListener('pointermove', onMove)

  // ambient: a short run of letters glitches every few seconds
  function scheduleAmbient() {
    if (!opts.ambient || destroyed || ambientTimer) return
    ambientTimer = window.setTimeout(() => {
      ambientTimer = 0
      if (!document.hidden && revealed) {
        const n = 2 + Math.floor(Math.random() * 3)
        const from = Math.floor(Math.random() * Math.max(1, chars.length - n))
        chars.slice(from, from + n).forEach((c, i) => {
          if (!c.anim) start(c, 'glitch', i * 0.04)
        })
      }
      scheduleAmbient()
    }, 3800 + Math.random() * 4200)
  }

  return {
    reveal(delay = 0) {
      chars.forEach((c, i) => start(c, 'reveal', delay + i * stagger + Math.random() * 0.12))
      const total = (delay + chars.length * stagger + 1.4 * speed) * 1000
      timers.push(
        window.setTimeout(() => {
          revealed = true
          scheduleAmbient()
        }, total),
      )
    },
    glitch(delay = 0) {
      chars.forEach((c, i) => start(c, 'glitch', delay + i * stagger * 0.6))
    },
    dissolve(delay = 0) {
      revealed = false
      chars.forEach((c, i) => start(c, 'out', delay + i * stagger * 0.7 + Math.random() * 0.06))
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      clearTimeout(ambientTimer)
      timers.forEach(clearTimeout)
      el.removeEventListener('pointermove', onMove)
      canvas.remove()
      split.revert()
    },
  }
}
