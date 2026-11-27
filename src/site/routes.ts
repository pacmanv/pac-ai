import type { MouseEvent } from 'react'

/** The site's pages. The landing page is '/'. */
export type PagePath = '/' | '/portfolio' | '/about' | '/contact'

export interface PageInfo {
  path: Exclude<PagePath, '/'>
  title: string
  index: number
}

export const PAGES: readonly PageInfo[] = [
  { path: '/portfolio', title: 'Work', index: 1 },
  { path: '/about', title: 'About', index: 2 },
  { path: '/contact', title: 'Contact', index: 3 },
]

const HOME_TITLE = 'Pac Ai | You Envision, We Build'

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
  return page ? `${page.title} | Pac Ai` : HOME_TITLE
}

/**
 * Click handler for an in-site <a href>: plain left clicks run the page
 * transition; modified clicks (new tab, new window) keep the browser default.
 */
export function linkHandler(to: PagePath, onNavigate: (to: PagePath) => void) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onNavigate(to)
  }
}
