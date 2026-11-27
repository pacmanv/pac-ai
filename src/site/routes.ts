import type { MouseEvent } from 'react'

/** The site's pages. The landing page is '/', the rest are glass panes. */
export type PagePath = '/' | '/portfolio' | '/about' | '/contact'

export interface PageInfo {
  path: Exclude<PagePath, '/'>
  title: string
  index: number
}

export const PAGES: readonly PageInfo[] = [
  { path: '/portfolio', title: 'Portfolio', index: 1 },
  { path: '/about', title: 'About', index: 2 },
  { path: '/contact', title: 'Contact', index: 3 },
]

const HOME_TITLE = 'Pac Ai — Envision and Build'

/** Map any pathname onto a known page; unknown paths fall back to the landing page. */
export function toPagePath(pathname: string): PagePath {
  const clean = pathname.replace(/\/+$/, '') || '/'
  if (clean === '/') return '/'
  const page = PAGES.find((p) => p.path === clean)
  return page ? page.path : '/'
}

export function pageFor(path: PagePath): PageInfo | undefined {
  return PAGES.find((p) => p.path === path)
}

export function titleFor(path: PagePath): string {
  const page = pageFor(path)
  return page ? `${page.title} — Pac Ai` : HOME_TITLE
}

/** Where the "next" link on a page leads: on through the pages, then back to the glass. */
export function nextAfter(page: PageInfo): { path: PagePath; label: string; arrow: string } {
  const next = PAGES[PAGES.indexOf(page) + 1]
  return next
    ? { path: next.path, label: `Next — ${next.title}`, arrow: '→' }
    : { path: '/', label: 'Back to the glass', arrow: '↑' }
}

/**
 * Click handler for an in-site <a href>: plain left clicks run the glass
 * transition; modified clicks (new tab, new window) keep the browser default.
 */
export function linkHandler(to: PagePath, onNavigate: (to: PagePath) => void) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onNavigate(to)
  }
}
