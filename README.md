# Pac AI: imagine more, build smarter

Portfolio site for Pac AI, live at **https://www.pacai.io** (also https://pac-ai-phi.vercel.app).

A dark, cinematic studio site. A live WebGL ink field flows behind every page and swirls around the
pointer; headlines rise in character by character; the home page runs a pinned horizontal showcase where the
project cards swing through in 3D as you scroll. A custom cursor, magnetic buttons and a full-screen wipe
between pages finish it off.

## Pages

| Path | What's there |
| --- | --- |
| `/` | Hero, marquee, scroll-lit statement, pinned 3D work showcase, process, call to action |
| `/portfolio` | Work: one large row per project, with clip-path reveals and pointer tilt |
| `/about` | Studio bio, principles and toolkit (draft copy) |
| `/contact` | A form that opens a pre-filled email, plus the address (draft copy) |
| `/kaiju-stomp/` | Kaiju Stomp showcase with the playable 8-bit game (keyboard) |

## Stack

React 19, TypeScript and Vite. The backdrop is a hand-written WebGL shader (`src/fx/ShaderField.ts`): one
fullscreen triangle of domain-warped noise, rendered at reduced resolution. Motion is GSAP (ScrollTrigger,
SplitText) with Lenis smooth scrolling on one shared ticker. Visitors who prefer reduced motion get every page
without the animation, smooth scrolling, loader or custom cursor; browsers without WebGL get a CSS gradient.

## Develop

```sh
npm install
npm run dev       # local dev server
npm run build     # type-check and build to dist/
npm run preview   # serve the production build
```

## Where things live

- `src/site/content.ts` — **site copy**: hero, statement, process, About and Contact text, contact email
- `src/site/projects.ts` — **portfolio content**: titles, summaries, tags and links
- `src/pages/` — the four pages
- `src/App.tsx` — routing, intro loader, page wipe, backdrop and cursor
- `src/fx/` — shader field, cursor, smooth scroll, magnetic/tilt effects and the shared reveal hook
- `src/styles.css` — all styles (colour tokens at the top)
- `public/kaiju-stomp/` — the Kaiju Stomp showcase and game, served as-is

## Deploy

Hosted on Vercel. `vercel.json` sends every path to the app (so `/about` etc. work on reload) and redirects
`/kaiju-stomp` to `/kaiju-stomp/`.

```sh
npx vercel deploy --prod
```
