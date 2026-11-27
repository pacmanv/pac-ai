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
  eyebrow: 'Independent AI studio',
  lines: ['You envision.', 'We build.'],
  intro:
    'Pac AI turns half-formed ideas into AI-powered apps, games and tools that people actually love to use.',
  primary: 'See the work',
  secondary: 'Start a project',
}

export const MARQUEE = ['AI web apps', 'Games', 'Interactive tools', 'Prototypes', 'Claude-powered', 'Shipped fast']

export const STATEMENT =
  'Every project starts as a picture of what it could be. Then it gets built quickly, carefully, and with a little bit of magic, until the picture is real.'

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
  title: ['Hey,', 'I’m Pac.'],
  lead:
    'I’m a data engineer by trade, a creative at heart, and a single dad to two incredible boys who keep me grounded, motivated, and occasionally questioning my sanity.',
  body: [
    'I’ve spent over a decade working in technology, building data platforms, solving complex problems, and helping organizations turn information into something useful. Somewhere along the way, I realized I didn’t just want to build systems for other people. I wanted to start creating things of my own.',
    'That’s where **Pac AI** comes in.',
    'I’m passionate about using AI to turn ideas into real products. Websites, web apps, automations, and digital tools that solve problems, simplify everyday work, and make life a little easier. I enjoy taking something that starts as a rough idea and bringing it to life through technology.',
    'I believe the best products aren’t necessarily the most complicated. They’re the ones that make people say, “That actually makes my life easier.”',
    'Outside of tech, I’m a dad, a lifelong learner, and someone who believes in pushing himself both mentally and physically. Whether I’m training, building something late at night, or spending time with my boys, I’m always looking for ways to grow and become a little better than I was yesterday.',
    'Pac AI is my way of exploring what’s possible, building with purpose, and sharing that journey along the way.',
  ],
  /** shown beside the story */
  roles: ['Data engineer', 'Creative', 'Dad of two', 'Builder'],
  tagline: ['Big ideas.', 'Practical solutions.', 'Built with AI.'],
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
