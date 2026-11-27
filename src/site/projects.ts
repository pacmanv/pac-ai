import dadsStoryLab from '../assets/projects/dads-story-lab.webp'
import feelingWheel from '../assets/projects/feeling-wheel-for-men.webp'
import kaijuStomp from '../assets/projects/kaiju-stomp.webp'
import roastMyBmw from '../assets/projects/roast-my-bmw.webp'

export interface Project {
  id: string
  title: string
  /** short label above the title, e.g. "AI web app" */
  kind: string
  /** one line for the home page cards */
  short: string
  /** a few sentences for the Projects page */
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
    short: 'Kids pick the hero and the world, and AI writes a cozy bedtime story to read aloud.',
    summary:
      'A bedtime story maker built for reading together. Kids choose their hero, from foxes and pandas to dinosaurs, then pick a world and an adventure, and AI writes a cozy story sized for tonight: a quick tale, a classic story or a longer adventure. Every story is new, gentle and ready to read aloud.',
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
    short: 'A guided wheel that turns a vague mood into the right word for it.',
    summary:
      "Something's going on and you can't name it. The Feeling Wheel for Men starts with six core feelings and narrows them down to seventy-two precise words, asking a few guided questions along the way to help you land on the one that fits. A simple, practical way to build emotional literacy, one feeling at a time.",
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
    short: 'An 8-bit arcade rampage: flatten the city and survive two boss fights.',
    summary:
      'A single-file 8-bit arcade game written in plain JavaScript. Pick your kaiju, flatten a pixel city block by block, dodge the military as it fights back, and survive two boss fights. The sprites, the city and the sound are all made in code with Canvas 2D and Web Audio, and it plays right in the browser.',
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
    short: 'Upload a BMW and a panel of AI stewards hands down the verdict.',
    summary:
      'Upload a photo of a BMW and a panel of AI stewards reviews the evidence, then files the charges: chrome grilles, fake badges, oversized exhaust tips and more, each with a mock verdict. It runs on AI vision behind a serverless API and is designed mobile-first, so you can roast a car the moment you spot it.',
    tags: ['Claude Vision', 'Serverless API', 'Mobile-first'],
    image: roastMyBmw,
    imageAlt:
      "Roast My BMW: the app on desktop and phone, with a photo upload bay and a stewards' decision listing charges against a 3 Series.",
    width: 2000,
    height: 1250,
    url: 'https://roast-my-bmw.vercel.app',
  },
]
