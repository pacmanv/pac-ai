/**
 * Site copy. Everything a visitor reads (apart from the projects, which live in
 * projects.ts) is here, so it can be edited without touching components.
 *
 * DRAFT: the About and Contact copy below is placeholder text written for the
 * redesign. Replace it with your own words, and set CONTACT_EMAIL.
 */

/** TODO: replace with your real address. The contact form opens a pre-filled email to it. */
export const CONTACT_EMAIL = 'hello@example.com'

/** shown in the footer */
export const YEAR = new Date().getFullYear()

export const HERO = {
  eyebrow: 'Independent AI studio',
  lines: ['We envision.', 'We build.'],
  intro:
    'Pac Ai turns half-formed ideas into AI-powered apps, games and tools that people actually love to use.',
  primary: 'See the work',
  secondary: 'Start a project',
}

export const MARQUEE = ['AI web apps', 'Games', 'Interactive tools', 'Prototypes', 'Claude-powered', 'Shipped fast']

export const STATEMENT =
  'Every project starts as a picture of what it could be. Then it gets built — quickly, carefully, and with a little bit of magic — until the picture is real.'

export const PROCESS = [
  {
    title: 'Envision',
    body: 'Shape the idea together: who it is for, what it does, and how it should feel the first time someone opens it.',
  },
  {
    title: 'Prototype',
    body: 'A working version in days, not months, so you can click it, feel it and change your mind early and cheaply.',
  },
  {
    title: 'Build & ship',
    body: 'Fast, accessible, production-ready, and live on the web, with AI where it genuinely helps and nowhere it does not.',
  },
] as const

export const CTA = {
  lines: ['Have an idea?', "Let's build it."],
  button: 'Start a project',
}

export const ABOUT = {
  title: ['A small studio', 'with big ideas.'],
  lead:
    'Pac Ai is an independent studio that designs and builds playful, useful software — bedtime-story makers, emotional-literacy tools, arcade games and AI that roasts your car.',
  body: [
    'Every project begins with a clear picture of what it could be, then gets built end to end: product thinking, interface design, AI integration and the code that ships it.',
    'The goal is always the same: something people remember, that works beautifully on the phone in their pocket.',
  ],
  principles: [
    { title: 'Delight first', body: 'Software should feel good to use. Motion, sound and wit are features, not decoration.' },
    { title: 'Ship it real', body: 'Prototypes are for learning; the finish line is a live product real people use.' },
    { title: 'AI with purpose', body: 'Models are a material like any other: used where they make the experience better.' },
  ],
  toolkit: ['React', 'TypeScript', 'Claude API', 'WebGL', 'GSAP', 'Canvas 2D', 'Web Audio', 'Serverless', 'Vercel'],
}

export const CONTACT = {
  title: ["Let's build", 'something.'],
  lead: 'Tell me about the idea — however rough. You will hear back within a couple of days.',
  fields: {
    name: 'Your name',
    idea: 'What do you want to build?',
    send: 'Send it',
  },
  orEmail: 'Or email directly',
}
