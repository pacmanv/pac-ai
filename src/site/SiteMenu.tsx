import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { lockScroll } from '../fx/motion'
import { CONTACT_EMAIL, INSTAGRAM } from './content'
import { PAGES, linkHandler, type PagePath } from './routes'

interface SiteMenuProps {
  isOpen: boolean
  current: PagePath
  onClose: () => void
  onNavigate: (to: PagePath) => void
  /** the button that opened the menu; focus goes back to it on close */
  returnFocusRef: RefObject<HTMLButtonElement | null>
}

const FOCUSABLE = 'a[href], button:not([disabled])'
const ITEMS: { path: PagePath; title: string }[] = [{ path: '/', title: 'Home' }, ...PAGES]

/** Full-screen menu: the pages, very large, rising in one after another. */
export function SiteMenu({ isOpen, current, onClose, onNavigate, returnFocusRef }: SiteMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const root = rootRef.current
    closeRef.current?.focus({ preventScroll: true })
    document.documentElement.classList.add('is-menu-open')
    lockScroll(true)

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
      lockScroll(false)
      returnFocusRef.current?.focus({ preventScroll: true })
    }
  }, [isOpen, onClose, returnFocusRef])

  return (
    <div
      id="site-menu"
      ref={rootRef}
      className="menu"
      data-open={isOpen || undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      inert={!isOpen}
      data-lenis-prevent
    >
      <div className="menu__top">
        <span className="menu__brand">Pac AI</span>
        <button ref={closeRef} type="button" className="menu-btn is-close" aria-label="Close menu" onClick={onClose}>
          <i />
          <i />
        </button>
      </div>

      <nav className="menu__nav" aria-label="Pages">
        <ol>
          {ITEMS.map((item, i) => (
            <li key={item.path} className="menu__item" style={{ '--i': i } as CSSProperties}>
              <a
                href={item.path}
                aria-current={current === item.path ? 'page' : undefined}
                onClick={linkHandler(item.path, onNavigate)}
              >
                <span className="menu__num">{String(i).padStart(2, '0')}</span>
                <span className="menu__mask">
                  <span className="menu__label">{item.title}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="menu__foot">
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer">
          Instagram {INSTAGRAM.handle}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  )
}
