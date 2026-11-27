import type { RefObject } from 'react'
import type { GlassEngine } from '../GlassEngine'

const MOUSE_RADIUS = 38
const MOUSE_RADIUS_HELD = 58
const TOUCH_RADIUS = 40

/**
 * Lets the pointer wipe the fogged glass on `stage`. Mouse wipes as it moves
 * (wider while the button is held); touch uses touch events, which keep firing
 * while the page scrolls, so a finger both scrolls and wipes. Buttons and links
 * are left alone. Returns the cleanup.
 */
export function bindWipe(stage: HTMLElement, engineRef: RefObject<GlassEngine | null>): () => void {
  let down = false
  const local = (x: number, y: number) => {
    const r = stage.getBoundingClientRect()
    return { x: x - r.left, y: y - r.top }
  }
  const onUi = (t: EventTarget | null) => t instanceof Element && !!t.closest('button, a')

  const move = (e: PointerEvent) => {
    if (e.pointerType === 'touch' || onUi(e.target)) return
    const p = local(e.clientX, e.clientY)
    engineRef.current?.wipe(p.x, p.y, down ? MOUSE_RADIUS_HELD : MOUSE_RADIUS)
  }
  const press = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') down = true
  }
  const release = () => {
    down = false
  }
  const leave = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') engineRef.current?.lift()
  }
  const tMove = (e: TouchEvent) => {
    if (onUi(e.target)) return
    const t = e.touches[0]
    if (!t) return
    const p = local(t.clientX, t.clientY)
    engineRef.current?.wipe(p.x, p.y, TOUCH_RADIUS)
  }
  const tStart = (e: TouchEvent) => {
    if (onUi(e.target)) return
    engineRef.current?.lift()
    tMove(e)
  }
  const tEnd = () => engineRef.current?.lift()

  stage.addEventListener('pointermove', move)
  stage.addEventListener('pointerdown', press)
  window.addEventListener('pointerup', release)
  stage.addEventListener('pointerleave', leave)
  stage.addEventListener('touchstart', tStart, { passive: true })
  stage.addEventListener('touchmove', tMove, { passive: true })
  stage.addEventListener('touchend', tEnd, { passive: true })
  return () => {
    stage.removeEventListener('pointermove', move)
    stage.removeEventListener('pointerdown', press)
    window.removeEventListener('pointerup', release)
    stage.removeEventListener('pointerleave', leave)
    stage.removeEventListener('touchstart', tStart)
    stage.removeEventListener('touchmove', tMove)
    stage.removeEventListener('touchend', tEnd)
  }
}
