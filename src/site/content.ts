/**
 * Site copy. Everything a visitor reads (apart from the projects, which live in
 * projects.ts) is here, so it can be edited without touching components.
 *
 * In paragraphs, **double asterisks** mark bold text.
 */

/** The contact form opens a pre-filled email to this address. */
export const CONTACT_EMAIL = 'packot06@gmail.com'

export const INSTAGRAM = { handle: '@pacmanv', url: 'https://www.instagram.com/pacmanv/' }

/** shown in the footer */
export const YEAR = new Date().getFullYear()

export const HERO = {
  eyebrow: 'Independent AI garage',
  lines: ['Imagine more.', 'Build smarter.'],
  intro:
    'Pac AI turns half-formed ideas into customized AI-powered apps, tools, and games that people actually love to use.',
  /** the main call to action */
  primary: 'Start a project',
  secondary: 'Explore projects',
}

export const MARQUEE = ['AI web apps', 'Games', 'Interactive tools', 'Prototypes', 'Shipped fast']

export const STATEMENT =
  'Every project starts as a picture of what it could be. Then it gets built quickly, carefully, and with a little bit of magic, until the picture is real.'

export const PROCESS = [
  {
    title: 'Envision',
    body: 'Shape the idea together: who it is for, what it does, and how it should feel the first time someone opens it.',
  },
  {
    title: 'Prototype',
    body: 'A real, clickable version in days, not months, so you can try it, feel it and change your mind early and cheaply.',
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
  title: ['Hey,', 'I’m Pac.'],
  lead:
    'I’ve spent nearly two decades in technology, building data platforms, solving complex problems, and helping organizations turn information into solutions. Now, I’m bringing that experience into something of my own.',
  body: [
    'That’s where **Pac AI** comes in.',
    'I’m a cloud engineer by trade, a proud dad, and a creative at heart. I use AI to turn ideas into real products, from websites and web apps to automations and digital tools that make life easier.',
    'Pac AI is about exploring what’s possible, creating something cool with purpose, and helping others bring their ideas to life.',
  ],
  /** shown beside the story */
  roles: ['Cloud engineer', 'Creative', 'Dad', 'Builder'],
  tagline: ['Imagine more.', 'Build smarter.'],
}

export const CONTACT = {
  title: ["Let's build", 'something.'],
  lead: 'Tell me about the idea, however rough. You will hear back within a couple of days.',
  fields: {
    name: 'Your name',
    idea: 'What do you want to build?',
    send: 'Send it',
  },
  orEmail: 'Or reach me directly',
}
