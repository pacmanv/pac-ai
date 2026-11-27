import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { bindMagnetics, bindTilt, fontsReady, splitChars } from './motion'

type Split = ReturnType<typeof splitChars>

/**
 * Wires the motion every page shares, from markup attributes:
 *
 * - `data-split`   headline rises in character by character when it scrolls into view
 *                  (`data-split="now"` plays immediately, e.g. a page title)
 * - `data-reveal`  fades up when it scrolls into view (batched)
 * - `data-magnetic` / `data-tilt`  pointer effects, see motion.ts
 *
 * `extra` adds page-specific timelines inside the same GSAP context, so all
 * of it is reverted when the page unmounts. Reduced motion skips the lot.
 */
export function usePageFx(
  rootRef: RefObject<HTMLElement | null>,
  reduced: boolean,
  extra?: (root: HTMLElement, q: (sel: string) => HTMLElement[]) => void,
  delay = 0,
) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const unbind = [bindMagnetics(root), bindTilt(root)]
    if (reduced) return () => unbind.forEach((u) => u())

    const splits: Split[] = []
    let ctx: gsap.Context | null = null
    let cancelled = false

    // hide split targets now so they never flash before fonts arrive
    gsap.set(root.querySelectorAll('[data-split], [data-reveal]'), { autoAlpha: 0 })

    fontsReady.then(() => {
      if (cancelled) return
      ctx = gsap.context(() => {
        const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root)

        q('[data-split]').forEach((el) => {
          const split = splitChars(el)
          splits.push(split)
          gsap.set(el, { autoAlpha: 1 })
          const now = el.dataset.split === 'now'
          gsap.from(split.chars, {
            yPercent: 115,
            rotate: 6,
            duration: 1.1,
            ease: 'expo.out',
            stagger: { each: 0.025 },
            delay: now ? delay : 0,
            scrollTrigger: now ? undefined : { trigger: el, start: 'top 88%', once: true },
          })
        })

        ScrollTrigger.batch(q('[data-reveal]'), {
          start: 'top 90%',
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { autoAlpha: 0, y: 40 },
              { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: delay * 0.6 },
            ),
        })

        extra?.(root, q)
      }, root)
      ScrollTrigger.refresh()
    })

    return () => {
      cancelled = true
      ctx?.revert()
      splits.forEach((s) => s.revert())
      unbind.forEach((u) => u())
    }
    // extra is defined inline by pages; it only needs to run per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, rootRef, delay])
}
