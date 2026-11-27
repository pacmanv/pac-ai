import { useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { GlassEngine } from '../GlassEngine'
import { loadGlassAssets } from './assets'
import { bindWipe } from './wipe'

export type GlassState = 'loading' | 'ready' | 'nogl' | 'error'

interface FogGlassOptions {
  /** the word traced into the fog */
  text: string
  reduced: boolean
  /** seconds before the word starts to be traced (lets a page transition finish first) */
  writeDelay: number
}

const WRITE_DURATION = 2
const WRITE_DRIPS = 3

/**
 * A full-screen fogged pane for a page: loads the photos, runs the GlassEngine
 * while the tab is visible, traces `text` into the fog, and lets the pointer wipe it.
 */
export function useFogGlass(
  stageRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { text, reduced, writeDelay }: FogGlassOptions,
): GlassState {
  const engineRef = useRef<GlassEngine | null>(null)
  const [state, setState] = useState<GlassState>('loading')

  useEffect(() => {
    let alive = true
    let cleanup = () => {}
    loadGlassAssets()
      .then(([sharp, fog]) => {
        const stage = stageRef.current
        const canvas = canvasRef.current
        if (!alive || !stage || !canvas) return
        const engine = new GlassEngine(canvas, sharp, fog, text)
        if (!engine.ok) {
          setState('nogl')
          return
        }
        engineRef.current = engine
        engine.reduced = reduced
        engine.resize(stage.clientWidth, stage.clientHeight)
        setState('ready')

        let running = false
        const tick = (_t: number, dtMs: number) => {
          engine.step(dtMs / 1000)
          if (!engine.ok) setState('nogl')
        }
        const sync = () => {
          const want = !document.hidden
          if (want && !running) gsap.ticker.add(tick)
          if (!want && running) gsap.ticker.remove(tick)
          running = want
        }
        document.addEventListener('visibilitychange', sync)
        sync()
        const ro = new ResizeObserver(() => engine.resize(stage.clientWidth, stage.clientHeight))
        ro.observe(stage)

        const w = { p: 0 }
        const tw = gsap.to(w, {
          p: 1,
          duration: reduced ? 0.01 : WRITE_DURATION,
          delay: reduced ? 0 : writeDelay,
          ease: 'power1.inOut',
          onUpdate: () => engine.setWriting(w.p),
          onComplete: () => engine.dripFromWriting(WRITE_DRIPS),
        })

        cleanup = () => {
          tw.kill()
          gsap.ticker.remove(tick)
          ro.disconnect()
          document.removeEventListener('visibilitychange', sync)
          engine.dispose()
          engineRef.current = null
        }
      })
      .catch((err: unknown) => {
        console.warn('[glass]', err)
        if (alive) setState('error')
      })
    return () => {
      alive = false
      cleanup()
    }
    // the engine is built once per page; `reduced` is synced by the effect below
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (engineRef.current) engineRef.current.reduced = reduced
  }, [reduced, state])

  useEffect(() => {
    const stage = stageRef.current
    return stage ? bindWipe(stage, engineRef) : undefined
  }, [stageRef])

  return state
}
