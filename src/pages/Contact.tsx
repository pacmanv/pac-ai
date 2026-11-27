import { useRef, useState, type FormEvent } from 'react'
import { usePageFx } from '../fx/usePageFx'
import { fx } from '../fx/motion'
import { Roll } from '../site/Chrome'
import { CONTACT, CONTACT_EMAIL, INSTAGRAM, YEAR } from '../site/content'

/**
 * Contact: a two-field form that opens the visitor's mail app with the message
 * pre-filled (no backend needed), plus the address itself, very large.
 */
export default function Contact({ reduced, delay }: { reduced: boolean; delay: number }) {
  const rootRef = useRef<HTMLElement>(null)
  const [name, setName] = useState('')
  const [idea, setIdea] = useState('')

  usePageFx(rootRef, reduced, undefined, delay)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const subject = `New project${name ? ` from ${name}` : ''}`
    const body = `${idea}\n\n${name}`
    fx.field?.pulse(1.2)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <main ref={rootRef} id="main" className="page page--inner page--contact">
      <header className="phead">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__dot" /> Contact
        </p>
        <h1 className="phead__title">
          <span className="phead__line" data-split="now">
            {CONTACT.title[0]}
          </span>
          <span className="phead__line phead__line--accent" data-split="now">
            {CONTACT.title[1]}
          </span>
        </h1>
        <p className="phead__lead" data-reveal>
          {CONTACT.lead}
        </p>
      </header>

      <section className="contact" aria-label="Send a message">
        <form className="form" onSubmit={submit} data-reveal>
          <label className="field">
            <span className="field__label">{CONTACT.fields.name}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>
          <label className="field">
            <span className="field__label">{CONTACT.fields.idea}</span>
            <textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={4} required data-lenis-prevent />
          </label>
          <button type="submit" className="btn btn--accent btn--large" data-magnetic="0.3">
            <Roll>{CONTACT.fields.send}</Roll>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="contact__direct" data-reveal>
          <p className="eyebrow">
            <span className="eyebrow__dot" /> {CONTACT.orEmail}
          </p>
          <a className="contact__email" href={`mailto:${CONTACT_EMAIL}`} data-cursor="Write">
            {CONTACT_EMAIL}
          </a>
          <a className="contact__social" href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" data-cursor="Follow">
            Instagram {INSTAGRAM.handle} <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </section>

      <footer className="ftr ftr--slim">
        <p className="ftr__meta">© {YEAR} Pac Ai. You envision, we build.</p>
      </footer>
    </main>
  )
}
