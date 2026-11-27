import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const INTERACTIVE = 'a, button, [data-cursor], input, textarea, label'

/**
 * A two-part cursor: a dot that tracks the pointer exactly and a ring that
 * trails it. Over links and buttons the ring swells; elements with
 * `data-cursor="View"` show that word inside it. Fine pointers only; the
 * native cursor comes back for touch, keyboards and reduced motion.
 */
export function Cursor({ enabled }: { enabled: boolean }) {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!enabled || !dot || !ring || !label || !window.matchMedia('(pointer: fine)').matches) return

    const html = document.documentElement
    html.classList.add('has-cursor')
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' })
    const dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' })
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' })
    const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' })
    let shown = false
    let hovering: Element | null = null

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (!shown) {
        shown = true
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY })
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 })
      }
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)

      const target = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null
      if (target === hovering) return
      hovering = target
      const word = target instanceof HTMLElement ? target.dataset.cursor : undefined
      label.textContent = word ?? ''
      ring.dataset.state = word ? 'label' : target ? 'hover' : ''
    }
    const leave = () => {
      shown = false
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.25 })
    }
    const down = () => gsap.to(ring, { scale: 0.8, duration: 0.15 })
    const up = () => gsap.to(ring, { scale: 1, duration: 0.4, ease: 'back.out(3)' })

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      html.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span ref={labelRef} className="cursor-ring__label" />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
