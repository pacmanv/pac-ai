import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '../lib/useReducedMotion'
import { PROJECTS, type Project } from './projects'

gsap.registerPlugin(ScrollTrigger)

const REVEAL_START = 'top 82%'

function hostOf(url: string): string {
  return new URL(url).host
}

function ProjectPane({ project, index }: { project: Project; index: number }) {
  const titleId = `project-${project.id}`
  return (
    <li className="pj">
      <article className="pj-card" aria-labelledby={titleId}>
        <div className="pj-media">
          <img
            src={project.image}
            alt={project.imageAlt}
            width={project.width}
            height={project.height}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={project.pixelated ? 'is-pixel' : undefined}
          />
          {/* the pane starts fogged; a squeegee clears it as it scrolls into view */}
          <div className="pj-fog" aria-hidden="true" />
          <div className="pj-blade" aria-hidden="true" />
        </div>

        <div className="pj-text">
          <p className="pj-kind">
            <span className="pj-num">{String(index + 1).padStart(2, '0')}</span>
            {project.kind}
          </p>
          <h2 id={titleId} className="pj-title">
            {project.title}
          </h2>
          <p className="pj-summary">{project.summary}</p>
          <ul className="pj-tags" aria-label="Tags">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          {(project.url || project.note) && (
            <div className="pj-actions">
              {project.url &&
                (project.internal ? (
                  <a className="pj-link" href={project.url}>
                    {project.linkLabel ?? 'Open'} <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <a className="pj-link" href={project.url} target="_blank" rel="noopener noreferrer">
                    {project.linkLabel ?? `Visit ${hostOf(project.url)}`} <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              {project.note && <p className="pj-note">{project.note}</p>}
            </div>
          )}
        </div>
      </article>
    </li>
  )
}

/** The four projects, each a pane of glass that clears as it scrolls into view. */
export default function PortfolioProjects() {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context((self) => {
      self.selector?.('.pj-card').forEach((card: Element) => {
        const q = gsap.utils.selector(card)
        gsap
          .timeline({ scrollTrigger: { trigger: card, start: REVEAL_START, once: true } })
          .from(card, { opacity: 0, y: 70, duration: 1.1, ease: 'expo.out' })
          .fromTo(q('.pj-fog'), { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut' }, 0.25)
          .fromTo(q('.pj-blade'), { top: '0%', autoAlpha: 1 }, { top: '100%', duration: 1.2, ease: 'power2.inOut' }, 0.25)
          .set(q('.pj-blade'), { autoAlpha: 0 })
          .from(q('.pj-text > *'), { opacity: 0, y: 18, duration: 0.9, stagger: 0.07, ease: 'expo.out' }, 0.35)
      })
    }, rootRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={rootRef} className="pj-section" aria-label="Projects">
      <ol className="pj-list">
        {PROJECTS.map((project, i) => (
          <ProjectPane key={project.id} project={project} index={i} />
        ))}
      </ol>
    </section>
  )
}
