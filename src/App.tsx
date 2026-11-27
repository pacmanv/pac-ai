import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import CondensationHero from './CondensationHero'
import GlassPage from './site/GlassPage'
import PortfolioProjects from './site/PortfolioProjects'
import { PROJECTS } from './site/projects'
import { MenuButton } from './site/MenuButton'
import { SiteMenu } from './site/SiteMenu'
import { pageFor, titleFor, toPagePath, type PagePath } from './site/routes'
import { usePrefersReducedMotion } from './lib/useReducedMotion'

/** seconds: the glass fogs over, then a squeegee clears it to the next page */
const FOG_IN = 0.55
const CLEAR = 0.95
const BLADE_LAG = 0.08

/**
 * The site shell: a tiny history router over four pages, the ⋯ menu, and the
 * fog-and-squeegee transition between pages.
 */
export default function App() {
  const reduced = usePrefersReducedMotion()
  const [path, setPath] = useState<PagePath>(() => toPagePath(window.location.pathname))
  const [isMenuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const bladeRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    // unknown paths render the landing page; make the address bar agree
    if (window.location.pathname !== path) window.history.replaceState(null, '', path)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = titleFor(path)
  }, [path])

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const swap = useCallback((to: PagePath) => {
    setPath(to)
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [])

  const transition = useCallback(
    (to: PagePath) => {
      const veil = veilRef.current
      const blade = bladeRef.current
      if (reduced || !veil || !blade) {
        swap(to)
        return
      }
      timelineRef.current?.kill()
      const h = window.innerHeight
      timelineRef.current = gsap
        .timeline({ onComplete: () => gsap.set(veil, { visibility: 'hidden', pointerEvents: 'none' }) })
        .set(veil, { visibility: 'visible', pointerEvents: 'auto', opacity: 0, clipPath: 'inset(0% 0% 0% 0%)' })
        .set(blade, { y: 0, visibility: 'hidden' })
        .to(veil, { opacity: 1, duration: FOG_IN, ease: 'power2.out' })
        .add(() => swap(to))
        .set(blade, { visibility: 'visible' }, `+=${BLADE_LAG}`)
        .to(veil, { clipPath: 'inset(100% 0% 0% 0%)', duration: CLEAR, ease: 'power2.inOut' }, '<')
        .to(blade, { y: h, duration: CLEAR, ease: 'power2.inOut' }, '<')
        .set(blade, { visibility: 'hidden' })
    },
    [reduced, swap],
  )

  const navigate = useCallback(
    (to: PagePath) => {
      if (to === path) {
        setMenuOpen(false)
        return
      }
      window.history.pushState(null, '', to)
      transition(to)
    },
    [path, transition],
  )

  useEffect(() => {
    const onPop = () => transition(toPagePath(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [transition])

  useEffect(() => () => {
    timelineRef.current?.kill()
  }, [])

  const menu = <MenuButton ref={menuButtonRef} isOpen={isMenuOpen} onOpen={openMenu} />
  const page = pageFor(path)

  return (
    <>
      {page ? (
        <GlassPage
          key={page.path}
          page={page}
          menu={menu}
          onNavigate={navigate}
          contentLabel={page.path === '/portfolio' ? `${PROJECTS.length} projects` : undefined}
        >
          {page.path === '/portfolio' && <PortfolioProjects />}
        </GlassPage>
      ) : (
        <CondensationHero menu={menu} onNavigate={navigate} />
      )}

      <SiteMenu
        isOpen={isMenuOpen}
        current={path}
        onClose={closeMenu}
        onNavigate={navigate}
        returnFocusRef={menuButtonRef}
      />

      <div ref={veilRef} className="site-veil" aria-hidden="true" />
      <div ref={bladeRef} className="cd-blade site-blade" aria-hidden="true">
        <i className="cd-blade__handle" />
        <i className="cd-blade__bar" />
      </div>
    </>
  )
}
