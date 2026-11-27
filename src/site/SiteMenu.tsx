import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { PAGES, linkHandler, type PagePath } from './routes'

interface SiteMenuProps {
  isOpen: boolean
  current: PagePath
  onClose: () => void
  onNavigate: (to: PagePath) => void
  /** the ⋯ button that opened the menu; focus goes back to it on close */
  returnFocusRef: RefObject<HTMLButtonElement | null>
}

const FOCUSABLE = 'a[href], button:not([disabled])'

/** Full-screen frosted-glass menu: the three pages, large. */
export function SiteMenu({ isOpen, current, onClose, onNavigate, returnFocusRef }: SiteMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const root = rootRef.current
    closeRef.current?.focus({ preventScroll: true })
    document.documentElement.classList.add('is-menu-open')

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !root) return
      // keep focus inside the menu while it is open
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('is-menu-open')
      returnFocusRef.current?.focus({ preventScroll: true })
    }
  }, [isOpen, onClose, returnFocusRef])

  return (
    <div
      id="site-menu"
      ref={rootRef}
      className="site-menu"
      data-open={isOpen || undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      inert={!isOpen}
      data-lenis-prevent
    >
      <div className="site-menu__glass" aria-hidden="true" />

      <div className="cd-top site-menu__top">
        <a className="cd-top__brand site-menu__brand" href="/" onClick={linkHandler('/', onNavigate)}>
          <em>Pac Ai</em>
        </a>
        <button ref={closeRef} type="button" className="site-menu-btn is-close" aria-label="Close menu" onClick={onClose}>
          <i />
          <i />
          <i />
        </button>
      </div>

      <nav className="site-menu__nav" aria-label="Pages">
        <ol>
          {PAGES.map((page, i) => (
            <li key={page.path} className="site-menu__item" style={{ '--i': i } as CSSProperties}>
              <a
                href={page.path}
                aria-current={current === page.path ? 'page' : undefined}
                onClick={linkHandler(page.path, onNavigate)}
              >
                <span className="site-menu__num">{String(page.index).padStart(2, '0')}</span>
                <span className="site-menu__mask">
                  <span className="site-menu__label">{page.title}</span>
                </span>
                <span className="site-menu__go" aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <p className="site-menu__foot">Pac Ai — envision and build.</p>
    </div>
  )
}
