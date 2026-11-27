import { useRef } from 'react'
import gsap from 'gsap'
import { usePageFx } from '../fx/usePageFx'
import { Finale } from '../site/Chrome'
import { ABOUT } from '../site/content'
import type { PagePath } from '../site/routes'

export default function About({ onNavigate, reduced, delay }: { onNavigate: (to: PagePath) => void; reduced: boolean; delay: number }) {
  const rootRef = useRef<HTMLElement>(null)

  usePageFx(
    rootRef,
    reduced,
    (_root, q) => {
      gsap.from(q('.chip'), {
        autoAlpha: 0,
        scale: 0.6,
        y: 20,
        duration: 0.8,
        ease: 'back.out(2)',
        stagger: { each: 0.05, from: 'random' },
        scrollTrigger: { trigger: q('.chips')[0], start: 'top 85%', once: true },
      })
    },
    delay,
  )

  return (
    <main ref={rootRef} id="main" className="page page--inner">
      <header className="phead">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__dot" /> About
        </p>
        <h1 className="phead__title">
          <span className="phead__line" data-split="now">
            {ABOUT.title[0]}
          </span>
          <span className="phead__line phead__line--accent" data-split="now">
            {ABOUT.title[1]}
          </span>
        </h1>
        <p className="phead__lead" data-reveal>
          {ABOUT.lead}
        </p>
      </header>

      <section className="about" aria-label="Story">
        <div className="about__body">
          {ABOUT.body.map((para) => (
            <p key={para} data-reveal>
              {para}
            </p>
          ))}
        </div>
      </section>

      <section className="principles" aria-labelledby="principles-title">
        <h2 id="principles-title" className="section-title" data-split>
          What matters here.
        </h2>
        <ol className="principles__grid">
          {ABOUT.principles.map((p, i) => (
            <li key={p.title} className="pcard" data-reveal data-tilt="6">
              <span className="pcard__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="pcard__title">{p.title}</h3>
              <p className="pcard__body">{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="toolkit" aria-labelledby="toolkit-title">
        <h2 id="toolkit-title" className="eyebrow" data-reveal>
          <span className="eyebrow__dot" /> Toolkit
        </h2>
        <ul className="chips">
          {ABOUT.toolkit.map((tool) => (
            <li key={tool} className="chip" data-magnetic="0.4">
              {tool}
            </li>
          ))}
        </ul>
      </section>

      <Finale onNavigate={onNavigate} />
    </main>
  )
}
