import dadsStoryLab from '../assets/projects/dads-story-lab.webp'
import feelingWheel from '../assets/projects/feeling-wheel-for-men.webp'
import kaijuStomp from '../assets/projects/kaiju-stomp.webp'
import roastMyBmw from '../assets/projects/roast-my-bmw.webp'

export interface Project {
  id: string
  title: string
  /** short label above the title, e.g. "AI web app" */
  kind: string
  summary: string
  tags: readonly string[]
  image: string
  imageAlt: string
  width: number
  height: number
  url?: string
  /** a page on this site (same tab) rather than an external site (new tab) */
  internal?: boolean
  /** button text; defaults to "Visit <host>" */
  linkLabel?: string
  /** a short note shown beside (or instead of) the link */
  note?: string
  /** pixel art: scale up crisp instead of smoothed */
  pixelated?: boolean
}

/** The portfolio, in display order. Edit freely: copy, tags and links live here. */
export const PROJECTS: readonly Project[] = [
  {
    id: 'dads-story-lab',
    title: "Dad's Story Lab",
    kind: 'AI web app',
    summary:
      'A bedtime story maker. Kids pick the characters, the world and the adventure, and AI writes a cozy story to read aloud tonight.',
    tags: ['AI stories', 'Animals & dinos', 'Read aloud'],
    image: dadsStoryLab,
    imageAlt:
      "Dad's Story Lab: a Bedtime Story Maker screen where kids choose a hero like Fox or Panda, beside a generated five-minute story.",
    width: 2000,
    height: 1250,
    url: 'https://www.dadsstorylab.app',
  },
  {
    id: 'feeling-wheel-for-men',
    title: 'The Feeling Wheel for Men',
    kind: 'Web app · Emotional literacy',
    summary:
      "Something's going on and you can't name it. Six feelings in, seventy-two out: a guided wheel that narrows a vague mood down to the right word.",
    tags: ['Emotional literacy', 'Guided questions', 'Interactive wheel'],
    image: feelingWheel,
    imageAlt:
      'The Feeling Wheel for Men: a colour-coded wheel of six core feelings branching into seventy-two words, beside a start prompt.',
    width: 2000,
    height: 1250,
    url: 'https://www.feelingwheelformen.com',
  },
  {
    id: 'kaiju-stomp',
    title: 'Kaiju Stomp',
    kind: 'Game · HTML5 Canvas',
    summary:
      'A single-file 8-bit arcade game. Pick a kaiju, flatten a pixel city block by block, dodge the military and survive two boss fights.',
    tags: ['Vanilla JS', 'Canvas 2D', 'Web Audio'],
    image: kaijuStomp,
    imageAlt: 'Kaiju Stomp: pixel-art monsters rampaging through a night-time city skyline under a full moon.',
    width: 632,
    height: 395,
    url: '/kaiju-stomp/',
    internal: true,
    linkLabel: 'Play in browser',
    note: 'Keyboard required',
    pixelated: true,
  },
  {
    id: 'roast-my-bmw',
    title: 'Roast My BMW',
    kind: 'AI web app · 2026',
    summary:
      'Upload a BMW and the AI stewards file the charges: a mock verdict on every chrome grille, fake badge and oversized exhaust tip.',
    tags: ['Claude Vision', 'Serverless API', 'Mobile-first'],
    image: roastMyBmw,
    imageAlt:
      "Roast My BMW: the app on desktop and phone, with a photo upload bay and a stewards' decision listing charges against a 3 Series.",
    width: 2000,
    height: 1250,
    url: 'https://roast-my-bmw.vercel.app',
  },
]
