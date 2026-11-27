import { useRef } from 'react'
import gsap from 'gsap'
import { usePageFx } from '../fx/usePageFx'
import { Finale } from '../site/Chrome'
import { PROJECTS, type Project } from '../site/projects'
import type { PagePath } from '../site/routes'

function hostOf(url: string): string {
  return new URL(url).host
}

/** The full portfolio: one large, alternating row per project. */
export default function Work({ onNavigate, reduced, delay }: { onNavigate: (to: PagePath) => void; reduced: boolean; delay: number }) {
  const rootRef = useRef<HTMLElement>(null)

  usePageFx(
    rootRef,
    reduced,
    (_root, q) => {
      q('.prow').forEach((row) => {
        const media = row.querySelector('.prow__media')
        const img = row.querySelector('.prow__img')
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: 'top 80%', once: true } })
          .fromTo(media, { clipPath: 'inset(18% 12% 18% 12% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.5, ease: 'expo.inOut' })
          .fromTo(img, { scale: 1.35 }, { scale: 1.08, duration: 1.8, ease: 'expo.out' }, 0)
        gsap.fromTo(
          img,
          { yPercent: -4 },
          { yPercent: 4, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
        gsap.fromTo(
          row.querySelector('.prow__ghost'),
          { yPercent: 30 },
          { yPercent: -30, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    },
    delay,
  )

  return (
    <main ref={rootRef} id="main" className="page page--inner">
      <header className="phead">
        <p className="eyebrow" data-reveal>
          <span className="eyebrow__dot" /> Work · {String(PROJECTS.length).padStart(2, '0')} projects
        </p>
        <h1 className="phead__title">
          <span className="phead__line" data-split="now">
            Selected
          </span>
          <span className="phead__line phead__line--accent" data-split="now">
            work.
          </span>
        </h1>
        <p className="phead__lead" data-reveal>
          AI apps, interactive tools and a game. Each one started as a rough idea and ended up live on the web.
        </p>
      </header>

      <ol className="plist">
        {PROJECTS.map((p, i) => (
          <ProjectRow key={p.id} project={p} index={i} />
        ))}
      </ol>

      <Finale onNavigate={onNavigate} />
    </main>
  )
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const titleId = `project-${project.id}`
  const external = project.url && !project.internal
  return (
    <li className={`prow${index % 2 ? ' prow--flip' : ''}`}>
      <article className="prow__card" aria-labelledby={titleId}>
        <span className="prow__ghost" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="prow__tilt" data-tilt="5">
          <div className="prow__media" data-cursor={project.internal ? 'Play' : 'Visit'}>
            <img
              className={`prow__img${project.pixelated ? ' is-pixel' : ''}`}
              src={project.image}
              alt={project.imageAlt}
              width={project.width}
              height={project.height}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <span className="prow__shine" aria-hidden="true" />
          </div>
        </div>
        <div className="prow__text">
          <p className="prow__kind" data-reveal>
            {project.kind}
          </p>
          <h2 id={titleId} className="prow__title" data-split>
            {project.title}
          </h2>
          <p className="prow__summary" data-reveal>
            {project.summary}
          </p>
          <ul className="tags" aria-label="Tags" data-reveal>
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          {(project.url || project.note) && (
            <div className="prow__actions" data-reveal>
              {project.url && (
                <a
                  className="btn btn--accent"
                  href={project.url}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  data-magnetic="0.25"
                >
                  {project.linkLabel ?? (external ? `Visit ${hostOf(project.url)}` : 'Open')}
                  <span aria-hidden="true">{external ? '↗' : '→'}</span>
                  {external && <span className="sr-only"> (opens in a new tab)</span>}
                </a>
              )}
              {project.note && <p className="prow__note">{project.note}</p>}
            </div>
          )}
        </div>
      </article>
    </li>
  )
}
