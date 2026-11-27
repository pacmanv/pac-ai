import { useLayoutEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FOG } from '../glass/assets'
import { useFogGlass } from '../glass/useFogGlass'
import { usePrefersReducedMotion } from '../lib/useReducedMotion'
import { PAGES, linkHandler, nextAfter, type PageInfo, type PagePath } from './routes'

interface GlassPageProps {
  page: PageInfo
  /** the menu button for the header */
  menu: ReactNode
  onNavigate: (to: PagePath) => void
  /** the page's content; it scrolls up over the pinned glass. Omit for an empty page. */
  children?: ReactNode
  /** short label for the scroll cue on the first screen, e.g. "4 projects" */
  contentLabel?: string
}

/** seconds: the page mounts under the fog veil; start tracing once the squeegee has passed */
const WRITE_DELAY = 0.9
const INTRO_DELAY = 0.45
const CONTENT_ID = 'page-content'

gsap.registerPlugin(ScrollTrigger)

/**
 * A page behind the same fogged glass as the landing page: its name is traced
 * into the fog and the pane can be wiped. With content, the glass stays pinned
 * and the content scrolls up over it; the link to the next page sits at the end.
 */
export default function GlassPage({ page, menu, onNavigate, children, contentLabel }: GlassPageProps) {
  const reduced = usePrefersReducedMotion()
  const mainRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useFogGlass(stageRef, canvasRef, { text: page.title, reduced, writeDelay: WRITE_DELAY })
  const next = nextAfter(page)
  const hasContent = Boolean(children)

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out' }, delay: INTRO_DELAY })
        .from('.cd-top > *', { opacity: 0, y: -8, duration: 1, stagger: 0.08 })
        .from('.pg-title .li', { yPercent: 110, duration: 1.5 }, 0.15)
        .from('.pg-kicker, .pg-stage .pg-next', { opacity: 0, y: 10, duration: 1.1, stagger: 0.12 }, 0.5)
    }, mainRef)
    return () => ctx.revert()
  }, [reduced])

  // as content scrolls up over the pinned glass, the page title and scroll cue
  // fade away so only the fogged pane remains behind it (opacity only, so it
  // stays on for reduced motion too)
  useLayoutEffect(() => {
    if (!hasContent) return
    const ctx = gsap.context(() => {
      gsap.to('.pg-head, .pg-cue', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: `#${CONTENT_ID}`, start: 'top 95%', end: 'top 45%', scrub: true },
      })
    }, mainRef)
    return () => ctx.revert()
  }, [hasContent])

  const toContent = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    document.getElementById(CONTENT_ID)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  const nextLink = (extraClass: string) => (
    <a className={`pg-next ${extraClass}`} href={next.path} onClick={linkHandler(next.path, onNavigate)}>
      {next.label} <span aria-hidden="true">{next.arrow}</span>
    </a>
  )

  return (
    <main ref={mainRef} className={`pg${hasContent ? ' pg--scroll' : ''}`} data-state={state}>
      <header className="cd-top pg-top">
        <a className="cd-top__brand" href="/" onClick={linkHandler('/', onNavigate)}>
          <em>Pac Ai</em>
        </a>
        {menu}
      </header>

      <div ref={stageRef} className={`cd-stage pg-stage${state === 'ready' ? ' is-live' : ''}`}>
        <canvas ref={canvasRef} className="cd-gl" aria-hidden="true" />
        {(state === 'nogl' || state === 'error') && (
          <div className="cd-fallback" aria-hidden="true">
            {state === 'nogl' && <img src={FOG} alt="" />}
          </div>
        )}

        <div className="cd-frame" aria-hidden="true">
          <i className="cd-bar cd-bar--v1" />
          <i className="cd-bar cd-bar--v2" />
          <i className="cd-bar cd-bar--h" />
        </div>

        <div className="pg-head">
          <p className="pg-kicker">
            {String(page.index).padStart(2, '0')} / {String(PAGES.length).padStart(2, '0')}
          </p>
          <h1 className="pg-title">
            <span className="ln">
              <span className="li">
                {page.title}
                <em>.</em>
              </span>
            </span>
          </h1>
        </div>

        {hasContent ? (
          <a className="pg-next pg-cue" href={`#${CONTENT_ID}`} onClick={toContent}>
            {contentLabel ?? 'Scroll'} <span aria-hidden="true">↓</span>
          </a>
        ) : (
          nextLink('')
        )}
      </div>

      {hasContent ? (
        <div id={CONTENT_ID} className="pg-body">
          {children}
          {nextLink('pg-next--end')}
        </div>
      ) : (
        // content for this page goes here — intentionally empty for now
        <section className="pg-content" aria-label={`${page.title} content`} />
      )}
    </main>
  )
}
