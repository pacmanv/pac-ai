import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { fx } from '../fx/motion'
import { CONTACT_EMAIL, CTA, INSTAGRAM, YEAR } from './content'
import { PAGES, linkHandler, type PagePath } from './routes'

type Navigate = (to: PagePath) => void

/** An in-site link that runs the page transition on a plain click. */
export function NavLink({
  to,
  onNavigate,
  className,
  children,
  ...rest
}: {
  to: PagePath
  onNavigate: Navigate
  className?: string
  children: ReactNode
  'data-magnetic'?: string
  'data-cursor'?: string
  'aria-current'?: 'page'
}) {
  return (
    <a href={to} className={className} onClick={linkHandler(to, onNavigate)} {...rest}>
      {children}
    </a>
  )
}

/** Text that rolls up to a copy of itself on hover. */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll" data-text={children}>
      <span>{children}</span>
    </span>
  )
}

/** Fixed header: brand, page links, a call to action and (on small screens) the menu button. Hides while scrolling down. */
export function Header({
  current,
  onNavigate,
  menuButton,
}: {
  current: PagePath
  onNavigate: Navigate
  menuButton: ReactNode
}) {
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setSolid(y > 40)
      setHidden(y > last && y > 240)
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [current])

  return (
    <header className="hdr" data-hidden={hidden || undefined} data-solid={solid || undefined}>
      <NavLink to="/" onNavigate={onNavigate} className="hdr__brand" data-magnetic="0.25" aria-current={current === '/' ? 'page' : undefined}>
        <span className="hdr__mark" aria-hidden="true" />
        Pac Ai
      </NavLink>
      <nav className="hdr__nav" aria-label="Main">
        {PAGES.map((p) => (
          <NavLink
            key={p.path}
            to={p.path}
            onNavigate={onNavigate}
            className="hdr__link"
            aria-current={current === p.path ? 'page' : undefined}
          >
            <Roll>{p.title}</Roll>
          </NavLink>
        ))}
      </nav>
      <NavLink to="/contact" onNavigate={onNavigate} className="btn btn--small hdr__cta" data-magnetic="0.3">
        <Roll>Start a project</Roll>
      </NavLink>
      {menuButton}
    </header>
  )
}

export function MenuButton({ ref, isOpen, onOpen }: { ref?: Ref<HTMLButtonElement>; isOpen: boolean; onOpen: () => void }) {
  return (
    <button
      ref={ref}
      type="button"
      className="menu-btn"
      aria-label="Open menu"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls="site-menu"
      onClick={onOpen}
    >
      <i />
      <i />
    </button>
  )
}

/** Big closing call to action plus the footer; shared by every page. */
export function Finale({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <>
      <section className="finale" aria-labelledby="finale-title">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__dot" /> Next step
        </p>
        <h2 id="finale-title" className="finale__title">
          <span className="finale__line" data-split>
            {CTA.lines[0]}
          </span>
          <span className="finale__line finale__line--accent" data-split>
            {CTA.lines[1]}
          </span>
        </h2>
        <div data-reveal>
          <NavLink to="/contact" onNavigate={onNavigate} className="orb" data-magnetic="0.45" data-cursor="Hello">
            <span className="orb__text">{CTA.button}</span>
            <span className="orb__arrow" aria-hidden="true">
              →
            </span>
          </NavLink>
        </div>
      </section>

      <footer className="ftr">
        <p className="ftr__brand">Pac Ai</p>
        <nav className="ftr__nav" aria-label="Footer">
          <NavLink to="/" onNavigate={onNavigate}>
            <Roll>Home</Roll>
          </NavLink>
          {PAGES.map((p) => (
            <NavLink key={p.path} to={p.path} onNavigate={onNavigate}>
              <Roll>{p.title}</Roll>
            </NavLink>
          ))}
          <a className="ftr__social" href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer">
            <Roll>{`Instagram ${INSTAGRAM.handle}`}</Roll>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="ftr__social" href={`mailto:${CONTACT_EMAIL}`}>
            <Roll>{CONTACT_EMAIL}</Roll>
          </a>
        </nav>
        <p className="ftr__meta">© {YEAR} Pac Ai. You envision, we build.</p>
        <button type="button" className="ftr__top" onClick={() => (fx.lenis ? fx.lenis.scrollTo(0) : window.scrollTo({ top: 0 }))}>
          <Roll>Back to top ↑</Roll>
        </button>
      </footer>
    </>
  )
}

/** Thin progress bar along the top edge. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return <div ref={barRef} className="progress" aria-hidden="true" />
}
