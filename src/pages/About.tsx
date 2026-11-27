import { useRef, type ReactNode } from 'react'
import { usePageFx } from '../fx/usePageFx'
import { Finale } from '../site/Chrome'
import { ABOUT } from '../site/content'
import type { PagePath } from '../site/routes'

/** Renders **double-asterisk** spans in a content string as <strong>. */
function rich(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))
}

export default function About({ onNavigate, reduced, delay }: { onNavigate: (to: PagePath) => void; reduced: boolean; delay: number }) {
  const rootRef = useRef<HTMLElement>(null)

  usePageFx(rootRef, reduced, undefined, delay)

  return (
    <main ref={rootRef} id="main" className="page page--inner">
      <header className="phead">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__dot" /> About
        </p>
        <h1 className="phead__title">
          <span className="phead__line" data-pixel="now">
            {ABOUT.title[0]}
          </span>
          <span className="phead__line phead__line--accent" data-pixel="now">
            {ABOUT.title[1]}
          </span>
        </h1>
        <p className="phead__lead about__lead" data-reveal>
          {ABOUT.lead}
        </p>
      </header>

      <section className="about" aria-label="My story">
        <aside className="about__aside" aria-hidden="true">
          <p className="eyebrow">
            <span className="eyebrow__dot" /> My story
          </p>
          <ul className="about__roles">
            {ABOUT.roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        </aside>
        <div className="about__body">
          {ABOUT.body.map((para) => (
            <p key={para} className={para.includes('**') ? 'about__callout' : undefined} data-reveal>
              {rich(para)}
            </p>
          ))}
        </div>
      </section>

      <section className="tagline" aria-label="In short">
        <p className="tagline__text">
          {ABOUT.tagline.map((line, i) => (
            <span key={line} className={`tagline__line${i === ABOUT.tagline.length - 1 ? ' tagline__line--accent' : ''}`} data-pixel>
              {line}
            </span>
          ))}
        </p>
      </section>

      <Finale onNavigate={onNavigate} />
    </main>
  )
}
