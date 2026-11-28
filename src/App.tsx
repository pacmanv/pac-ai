import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Analytics } from '@vercel/analytics/react'
import { Cursor } from './fx/Cursor'
import { ShaderField } from './fx/ShaderField'
import { fontsReady, fx, lockScroll, scrollToTop, startSmoothScroll } from './fx/motion'
import { createPixelText, type PixelText } from './fx/pixelText'
import Home from './pages/Home'
import Projects from './pages/Projects'
import About from './pages/About'
import Contact from './pages/Contact'
import { Header, MenuButton, NAVIGATE_EVENT, ScrollProgress } from './site/Chrome'
import { SiteMenu } from './site/SiteMenu'
import { titleFor, toPagePath, type PagePath } from './site/routes'
import { usePrefersReducedMotion } from './lib/useReducedMotion'

/** seconds the intro loader holds the first page */
const INTRO = 2.6
/** seconds after a page swap before its entrance plays (the wipe is lifting) */
const ENTER = 1.05

const LABELS: Record<PagePath, string> = { '/': 'Home', '/portfolio': 'Projects', '/about': 'About', '/contact': 'Contact' }

/**
 * The site shell: a tiny history router over four pages, the WebGL backdrop,
 * smooth scrolling, the custom cursor, the intro loader and the wipe between pages.
 */
export default function App() {
  const reduced = usePrefersReducedMotion()
  const [path, setPath] = useState<PagePath>(() => toPagePath(window.location.pathname))
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [delay, setDelay] = useState(() => (reduced ? 0 : INTRO))
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const wipeRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const labelPxRef = useRef<PixelText | null>(null)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    // unknown paths render the landing page; make the address bar agree
    if (window.location.pathname !== path) window.history.replaceState(null, '', path)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = titleFor(path)
  }, [path])

  // backdrop: the shader field, steered by pointer and scroll, dimming below the fold
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const field = ShaderField.create(canvas, !reduced)
    fx.field = field
    if (!field) return
    field.play()
    const onMove = (e: PointerEvent) => field.pointer(e.clientX, e.clientY)
    const onDown = () => field.pulse(0.45)
    const onScroll = () => {
      const v = window.scrollY / window.innerHeight
      field.setScroll(v)
      canvas.style.opacity = String(1 - Math.min(0.5, v * 0.5))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onScroll)
      field.destroy()
      fx.field = null
    }
  }, [reduced])

  // smooth scrolling (skipped for reduced motion)
  useEffect(() => {
    if (reduced) return
    return startSmoothScroll()
  }, [reduced])

  // intro loader: the share-image composition (wordmark, tagline, glows) resolves out of
  // pixels while the count runs to 100, then the curtain lifts
  useLayoutEffect(() => {
    const loader = loaderRef.current
    if (!loader) return
    if (reduced) {
      loader.remove()
      return
    }
    lockScroll(true)
    const count = loader.querySelector('.loader__count')
    const n = { v: 0 }
    const pixels: PixelText[] = []
    let cancelled = false
    fontsReady.then(() => {
      if (cancelled) return
      const word = loader.querySelector<HTMLElement>('.loader__word')
      const tag = loader.querySelector<HTMLElement>('.loader__tag')
      if (word) pixels.push(createPixelText(word, { stagger: 0.07 }))
      if (tag) pixels.push(createPixelText(tag, { stagger: 0.022 }))
      gsap.set([word, tag], { autoAlpha: 1 })
      pixels[0]?.reveal(0.05)
      pixels[1]?.reveal(0.55)
    })
    const tl = gsap
      .timeline({
        onComplete: () => {
          pixels.forEach((p) => p.destroy())
          loader.remove()
          lockScroll(false)
        },
      })
      .from(loader.querySelectorAll('.loader__glow'), { autoAlpha: 0, scale: 0.6, duration: 1.4, ease: 'expo.out', stagger: 0.12 }, 0)
      .to(n, {
        v: 100,
        duration: INTRO - 0.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (count) count.textContent = String(Math.round(n.v)).padStart(3, '0')
        },
      }, 0)
      .to(loader.querySelector('.loader__bar i'), { scaleX: 1, duration: INTRO - 0.5, ease: 'power2.inOut' }, 0)
      .add(() => fx.field?.pulse(1.2), INTRO - 0.5)
      .to(loader.querySelector('.loader__center'), { scale: 1.06, autoAlpha: 0, filter: 'blur(8px)', duration: 0.7, ease: 'expo.in' }, INTRO - 0.6)
      .to(loader, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, INTRO - 0.35)
    return () => {
      cancelled = true
      tl.kill()
      pixels.forEach((p) => p.destroy())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const swap = useCallback((to: PagePath, enterDelay: number) => {
    setDelay(enterDelay)
    setPath(to)
    setMenuOpen(false)
    scrollToTop()
  }, [])

  const transition = useCallback(
    (to: PagePath) => {
      const wipe = wipeRef.current
      const label = wipe?.querySelector<HTMLElement>('.wipe__label')
      if (reduced || !wipe || !label) {
        swap(to, 0)
        return
      }
      timelineRef.current?.kill()
      labelPxRef.current?.destroy()
      labelPxRef.current = null
      label.textContent = LABELS[to]
      fx.field?.pulse(1)
      // the header rides above the wipe while it plays, and its "Pac AI" pixelates too
      const root = document.documentElement
      root.classList.add('is-transitioning')
      window.dispatchEvent(new CustomEvent(NAVIGATE_EVENT))
      const finish = () => {
        labelPxRef.current?.destroy()
        labelPxRef.current = null
        root.classList.remove('is-transitioning')
      }
      timelineRef.current = gsap
        .timeline({ onComplete: finish, onInterrupt: finish })
        .set(wipe, { visibility: 'visible', yPercent: 100 })
        .to(wipe, { yPercent: 0, duration: 0.55, ease: 'expo.inOut' })
        // the page name resolves out of pixels...
        .add(() => {
          labelPxRef.current = createPixelText(label, { stagger: 0.05, speed: 0.6, blockScale: 1.15 })
          labelPxRef.current.reveal(0)
        }, 0.2)
        .add(() => swap(to, ENTER), 0.75)
        // ...then breaks back up into pixels as the wipe lifts off the new page
        .add(() => labelPxRef.current?.dissolve(0), 1.4)
        .to(wipe, { yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, 1.65)
        .set(wipe, { visibility: 'hidden' })
    },
    [reduced, swap],
  )

  const navigate = useCallback(
    (to: PagePath) => {
      if (to === path) {
        setMenuOpen(false)
        scrollToTop(false)
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

  useEffect(
    () => () => {
      timelineRef.current?.kill()
      labelPxRef.current?.destroy()
    },
    [],
  )

  const pageProps = { reduced, delay }
  return (
    <>
      <canvas ref={canvasRef} className="backdrop" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <ScrollProgress />
      <Header
        current={path}
        onNavigate={navigate}
        reduced={reduced}
        introDelay={reduced ? 0 : INTRO + 0.4}
        menuButton={<MenuButton ref={menuButtonRef} isOpen={isMenuOpen} onOpen={openMenu} />}
      />

      {path === '/' && <Home key="/" onNavigate={navigate} reduced={reduced} introDelay={delay} />}
      {path === '/portfolio' && <Projects key="/portfolio" onNavigate={navigate} {...pageProps} />}
      {path === '/about' && <About key="/about" onNavigate={navigate} {...pageProps} />}
      {path === '/contact' && <Contact key="/contact" {...pageProps} />}

      <SiteMenu isOpen={isMenuOpen} current={path} onClose={closeMenu} onNavigate={navigate} returnFocusRef={menuButtonRef} />

      <div ref={wipeRef} className="wipe" aria-hidden="true">
        <span className="wipe__label" />
      </div>

      <div ref={loaderRef} className="loader" aria-hidden="true">
        <i className="loader__glow loader__glow--violet" />
        <i className="loader__glow loader__glow--lime" />
        <i className="loader__glow loader__glow--teal" />
        <div className="loader__center">
          <p className="loader__brand">
            <span className="loader__word">
              Pac <em>AI</em>
            </span>
          </p>
          <p className="loader__tag">
            Imagine more. <b>Build smarter.</b>
          </p>
        </div>
        <div className="loader__bar">
          <i />
        </div>
        <p className="loader__count">000</p>
      </div>

      <Cursor enabled={!reduced} />
      <Analytics />
    </>
  )
}
