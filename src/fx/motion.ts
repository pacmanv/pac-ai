import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import type { ShaderField } from './ShaderField'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * Site-wide motion singletons: the smooth scroller and the shader field.
 * Pages reach them through `fx` instead of prop-drilling.
 */
export const fx: { lenis: Lenis | null; field: ShaderField | null } = { lenis: null, field: null }

const lenisTick = (t: number) => fx.lenis?.raf(t * 1000)

/** One loop for Lenis and ScrollTrigger (GSAP's ticker drives both). Returns a cleanup. */
export function startSmoothScroll(): () => void {
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
  fx.lenis = lenis
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(lenisTick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(lenisTick)
    lenis.destroy()
    fx.lenis = null
  }
}

export function scrollToTop(immediate = true) {
  if (fx.lenis) fx.lenis.scrollTo(0, { immediate, force: true })
  else window.scrollTo(0, 0)
}

export function lockScroll(locked: boolean) {
  if (!fx.lenis) return
  if (locked) fx.lenis.stop()
  else fx.lenis.start()
}

/** Resolves once the web fonts are in, so split text breaks on the right lines. */
export const fontsReady: Promise<unknown> =
  typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve()

/**
 * Split an element into masked lines and characters for a rise-up reveal.
 * Returns the split so the caller can revert it on cleanup.
 */
export function splitChars(el: Element) {
  return SplitText.create(el, {
    type: 'lines, words, chars',
    linesClass: 'split-line',
    wordsClass: 'split-word',
    charsClass: 'split-char',
    mask: 'lines',
  })
}

/**
 * Magnetic hover: elements marked `data-magnetic` lean toward the pointer and
 * spring back on leave. Fine pointers only. Returns a cleanup.
 */
export function bindMagnetics(root: ParentNode): () => void {
  if (!window.matchMedia('(pointer: fine)').matches) return () => {}
  const offs: (() => void)[] = []
  root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.35
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: true })
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    offs.push(() => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      gsap.set(el, { clearProps: 'transform' })
    })
  })
  return () => offs.forEach((off) => off())
}

/** Pointer-follow 3D tilt for cards marked `data-tilt`. Fine pointers only. Returns a cleanup. */
export function bindTilt(root: ParentNode): () => void {
  if (!window.matchMedia('(pointer: fine)').matches) return () => {}
  const offs: (() => void)[] = []
  root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const max = Number(el.dataset.tilt) || 8
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry(px * max * 2)
      rx(-py * max * 2)
      el.style.setProperty('--mx', `${(px + 0.5) * 100}%`)
      el.style.setProperty('--my', `${(py + 0.5) * 100}%`)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    offs.push(() => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    })
  })
  return () => offs.forEach((off) => off())
}
