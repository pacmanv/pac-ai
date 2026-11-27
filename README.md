# Pac Ai — envision and build

Portfolio site for Pac Ai, live at **https://pac-ai-phi.vercel.app**.

The whole site sits behind a fogged greenhouse window. The landing page traces *Pac Ai* into the condensation;
scroll and a squeegee clears the glass, then the view zooms through into the finale. Move the pointer (or a
finger) to wipe the fog yourself. The ☰ menu leads to Portfolio, About and Contact, each its own fogged pane;
moving between pages fogs the glass over and a squeegee wipes it clear again.

## Pages

| Path | What's there |
| --- | --- |
| `/` | Landing: the fogged window, scroll story and finale |
| `/portfolio` | Four projects, each a glass pane that clears as it scrolls into view |
| `/about`, `/contact` | Glass pages, content still to come |
| `/kaiju-stomp/` | Kaiju Stomp showcase with the playable 8-bit game (keyboard) |

## Stack

React 19, TypeScript and Vite. The fog is a hand-written WebGL2 renderer (`src/GlassEngine.ts`): one
fullscreen triangle, a low-res wipe mask, a drip normal map and two photographs. Motion is GSAP with
ScrollTrigger; smooth scrolling on the landing page is Lenis. Visitors who prefer reduced motion get the same
pages without the animation, and browsers without WebGL2 get the clear photograph.

## Develop

```sh
npm install
npm run dev       # local dev server
npm run build     # type-check and build to dist/
npm run preview   # serve the production build
```

## Where things live

- `src/CondensationHero.tsx` — the landing page
- `src/GlassEngine.ts` — the WebGL2 fogged-glass renderer
- `src/App.tsx` — page routing and the fog-and-squeegee transition
- `src/site/` — menu, glass pages, routes and styles
- `src/site/projects.ts` — **portfolio content**: titles, summaries, tags and links
- `public/kaiju-stomp/` — the Kaiju Stomp showcase and game, served as-is

## Deploy

Hosted on Vercel. `vercel.json` sends every path to the app (so `/about` etc. work on reload) and redirects
`/kaiju-stomp` to `/kaiju-stomp/`.

```sh
npx vercel deploy --prod
```
