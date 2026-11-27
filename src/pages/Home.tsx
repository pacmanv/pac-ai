import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePageFx } from '../fx/usePageFx'
import { fx } from '../fx/motion'
import { Finale, NavLink, Roll } from '../site/Chrome'
import { HERO, MARQUEE, PROCESS, STATEMENT } from '../site/content'
import { PROJECTS, type Project } from '../site/projects'
import type { PagePath } from '../site/routes'

/** words in the statement that light up in the accent colour */
const ACCENT_WORDS = new Set(['picture', 'magic', 'real.'])

interface PageProps {
  onNavigate: (to: PagePath) => void
  reduced: boolean
  /** seconds to hold the hero entrance (while the intro loader plays) */
  introDelay: number
}

export default function Home({ onNavigate, reduced, introDelay }: PageProps) {
  const rootRef = useRef<HTMLElement>(null)

  usePageFx(
    rootRef,
    reduced,
    (root, q) => {
      // hero: supporting bits follow the headline in
      gsap.from(q('[data-hero]'), {
        autoAlpha: 0,
        y: 30,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.09,
        delay: introDelay + 0.55,
      })

      // hero: the headline drifts back as you scroll away from it
      gsap.to(q('.hero__inner'), {
        yPercent: -18,
        scale: 0.94,
        autoAlpha: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: q('.hero')[0], start: 'top top', end: 'bottom top', scrub: true },
      })

      // hero: headline lines lean away from the pointer
      const lines = q('.hero__line')
      if (window.matchMedia('(pointer: fine)').matches) {
        const tos = lines.map((el, i) => ({
          x: gsap.quickTo(el, 'x', { duration: 1.2 + i * 0.2, ease: 'power3.out' }),
          d: (i + 1) * 14,
        }))
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5
          tos.forEach((t) => t.x(-nx * t.d))
        }
        window.addEventListener('pointermove', onMove)
        ScrollTrigger.create({ trigger: root, onKill: () => window.removeEventListener('pointermove', onMove) })
      }

      // marquee: endless, and it speeds up (and flips) with scroll velocity
      q('.marquee__row').forEach((row, i) => {
        const dir = i % 2 ? 1 : -1
        const loop = gsap.fromTo(
          row,
          { xPercent: dir < 0 ? 0 : -50 },
          { xPercent: dir < 0 ? -50 : 0, duration: 28, ease: 'none', repeat: -1 },
        )
        ScrollTrigger.create({
          trigger: q('.marquee')[0],
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 300)
            gsap.to(loop, { timeScale: (self.direction || 1) * (1 + Math.abs(v)), duration: 0.3, overwrite: true })
            gsap.to(loop, { timeScale: self.direction || 1, duration: 1.2, delay: 0.3 })
          },
        })
      })

      // statement: each word lights up as it passes through the viewport
      gsap.fromTo(
        q('.statement__word'),
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: q('.statement')[0], start: 'top 75%', end: 'bottom 55%', scrub: true },
        },
      )

      // work: pinned horizontal run on wide screens; cards swing through in 3D
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        const section = q('.work')[0]
        const track = q('.work__track')[0]
        const distance = () => track.scrollWidth - window.innerWidth
        const run = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
        q('.wcard').forEach((card) => {
          const inner = card.querySelector('.wcard__inner')
          const img = card.querySelector('.wcard__img')
          gsap.fromTo(
            inner,
            { rotationY: -28, z: -160 },
            {
              keyframes: { rotationY: [-28, 0, 28], z: [-160, 0, -160] },
              ease: 'none',
              scrollTrigger: { trigger: card, containerAnimation: run, start: 'left right', end: 'right left', scrub: true },
            },
          )
          if (img)
            gsap.fromTo(
              img,
              { xPercent: -8 },
              {
                xPercent: 8,
                ease: 'none',
                scrollTrigger: { trigger: card, containerAnimation: run, start: 'left right', end: 'right left', scrub: true },
              },
            )
        })
        gsap.fromTo(
          q('.work__bar i'),
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: true } },
        )
      })
      mm.add('(max-width: 899px)', () => {
        q('.wcard').forEach((card) =>
          gsap.from(card, {
            autoAlpha: 0,
            y: 60,
            rotationX: 12,
            duration: 1.1,
            ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          }),
        )
      })

      // process: the big outlined word slides across behind the steps
      gsap.fromTo(
        q('.process__ghost'),
        { xPercent: 10 },
        { xPercent: -30, ease: 'none', scrollTrigger: { trigger: q('.process')[0], start: 'top bottom', end: 'bottom top', scrub: true } },
      )
      gsap.from(q('.step__rule'), {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 1.4,
        ease: 'expo.inOut',
        stagger: 0.15,
        scrollTrigger: { trigger: q('.process__steps')[0], start: 'top 80%', once: true },
      })
    },
    introDelay,
  )

  const scrollToWork = () => {
    const el = document.getElementById('work')
    if (!el) return
    if (fx.lenis) fx.lenis.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <main ref={rootRef} id="main" className="page page--home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__inner">
          <p className="eyebrow" data-hero>
            <span className="eyebrow__dot" /> {HERO.eyebrow}
          </p>
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line" data-split="now">
              {HERO.lines[0]}
            </span>
            <span className="hero__line hero__line--accent" data-split="now">
              {HERO.lines[1].split(' ')[0]} <em>{HERO.lines[1].split(' ').slice(1).join(' ')}</em>
            </span>
          </h1>
          <div className="hero__foot">
            <p className="hero__intro" data-hero>
              {HERO.intro}
            </p>
            <div className="hero__actions" data-hero>
              <button type="button" className="btn btn--accent" data-magnetic="0.3" onClick={scrollToWork}>
                <Roll>{HERO.primary}</Roll>
                <span aria-hidden="true">↓</span>
              </button>
              <NavLink to="/contact" onNavigate={onNavigate} className="btn btn--ghost" data-magnetic="0.3">
                <Roll>{HERO.secondary}</Roll>
                <span aria-hidden="true">→</span>
              </NavLink>
            </div>
          </div>
        </div>
        <div className="hero__meta" data-hero aria-hidden="true">
          <span>{String(PROJECTS.length).padStart(2, '0')} shipped projects</span>
          <span className="hero__scroll">
            Scroll <i />
          </span>
        </div>
      </section>

      <section className="marquee" aria-label="What Pac AI makes">
        {[0, 1].map((r) => (
          <div key={r} className={`marquee__band${r ? ' marquee__band--alt' : ''}`} aria-hidden={r ? true : undefined}>
            <div className="marquee__row">
              {[0, 1].map((copy) =>
                MARQUEE.map((item) => (
                  <span key={`${copy}-${item}`} className="marquee__item" aria-hidden={copy ? true : undefined}>
                    {item}
                    <span className="marquee__star" aria-hidden="true">
                      ✦
                    </span>
                  </span>
                )),
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="statement" aria-label="Approach">
        <p className="statement__text">
          {STATEMENT.split(' ').map((word, i) => (
            <span key={i} className={`statement__word${ACCENT_WORDS.has(word) ? ' is-accent' : ''}`}>
              {word}{' '}
            </span>
          ))}
        </p>
      </section>

      <section id="work" className="work" aria-labelledby="work-title">
        <div className="work__head">
          <p className="eyebrow">
            <span className="eyebrow__dot" /> Selected work
          </p>
          <h2 id="work-title" className="work__title">
            Things that <em>shipped.</em>
          </h2>
          <div className="work__bar" aria-hidden="true">
            <i />
          </div>
        </div>
        <ol className="work__track">
          {PROJECTS.map((p, i) => (
            <WorkCard key={p.id} project={p} index={i} />
          ))}
          <li className="wcard wcard--more">
            <NavLink to="/portfolio" onNavigate={onNavigate} className="wcard__inner wcard__more" data-cursor="All">
              <span className="wcard__more-label">
                All work <span aria-hidden="true">→</span>
              </span>
              <span className="wcard__more-sub">Case notes, links and the playable game</span>
            </NavLink>
          </li>
        </ol>
      </section>

      <section className="process" aria-labelledby="process-title">
        <p className="process__ghost" aria-hidden="true">
          Envision · Build ·
        </p>
        <div className="process__head">
          <p className="eyebrow" data-reveal>
            <span className="eyebrow__dot" /> How it works
          </p>
          <h2 id="process-title" className="section-title" data-split>
            From a spark to something real.
          </h2>
        </div>
        <ol className="process__steps">
          {PROCESS.map((step, i) => (
            <li key={step.title} className="step" data-reveal>
              <span className="step__rule" aria-hidden="true" />
              <span className="step__num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__body">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <Finale onNavigate={onNavigate} />
    </main>
  )
}

function WorkCard({ project, index }: { project: Project; index: number }) {
  const external = project.url && !project.internal
  return (
    <li className="wcard">
      <a
        className="wcard__inner"
        href={project.url}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        data-cursor={project.internal ? 'Play' : 'Visit'}
      >
        <div className="wcard__media">
          <img
            className={`wcard__img${project.pixelated ? ' is-pixel' : ''}`}
            src={project.image}
            alt={project.imageAlt}
            width={project.width}
            height={project.height}
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
        <div className="wcard__body">
          <span className="wcard__num">{String(index + 1).padStart(2, '0')}</span>
          <div>
            <p className="wcard__kind">{project.kind}</p>
            <h3 className="wcard__title">{project.title}</h3>
          </div>
          <span className="wcard__go" aria-hidden="true">
            {external ? '↗' : '→'}
          </span>
        </div>
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    </li>
  )
}
