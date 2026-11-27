# Pac AI launch film

24 s · 1920×1080 · 30 fps · 120 BPM (12 bars of 2 s) · F minor · original score synthesized in code

| Bar | Time | Shot | What happens | Sound |
| --- | --- | --- | --- | --- |
| 1 | 0–2 | Hook | One lime pixel; it multiplies 1 → 2×2 → 4×4 → 8×8 on each beat, then collapses | Pad through a closed filter, 8-bit blip per beat |
| 2 | 2–4 | Hook | "Every big idea / starts as a *pixel*" resolves out of pixels; the pixel flies in as the full stop | Hats, pluck arp, blips on each line, a landing blip |
| 3 | 4–6 | Imagine | Push into the full stop, lime flood shatters into the ink field; "Imagine more." | Kick and bass enter, whoosh into the downbeat |
| 4 | 6–8 | Imagine | "Build *smarter*."; riser rumble, everything sucks inward; quarter beat of black at 7.75 | Clap, riser, snare roll, then silence |
| 5 | 8–10 | Reveal | **Drop:** "Pac *AI*" slams in out of pixels, flash, shockwave, chromatic split, spray; eyebrow, marquee bands, "pacai.io · now live" | Impact, full groove, supersaw stab hook |
| 6 | 10–12 | Project 1 | Dad's Story Lab · *AI web apps.* (card swings in, name on beat 2, tags on beat 3) | Groove + arp, tag blips, whoosh |
| 7 | 12–14 | Project 2 | The Feeling Wheel for Men · *Interactive tools.* | as above |
| 8 | 14–16 | Project 3 | Kaiju Stomp · 8-bit games. (chunky pixel type, stomp shake and debris on every beat) | Chiptune lead replaces the stab hook |
| 9 | 16–18 | Project 4 | Roast My BMW · *AI vision.* (scanner sweep, detection boxes on beats 2, 3, 4) | as above |
| 10 | 18–20 | Rapid fire | Websites · Web apps · Automations · Digital tools · Games · Prototypes, one per half beat; "Built with *AI*." stutters; black at 19.75 | Double-time kick, climbing plucks, 16th stutter, silence |
| 11–12 | 20–24 | End card | Glass tile + "Pac *AI*", tagline, "pacai.io →" pill with pulse ring and light sweep, "Now live"; hold, fade | End hit, F minor add9 pad, bell motif, fade |

## Files

- `launch.html` — the whole film: plays live in a browser (click for sound); every frame is a pure function of time
- `score.js` — the soundtrack (Web Audio), written to the same beat grid
- `render.mjs` — renders `launch.html` to MP4 with the score muxed in: `node render.mjs launch.html out/pac-ai-launch.mp4`
- `sync-check.mjs` — checks every cut lands on a beat: `node sync-check.mjs out/pac-ai-launch.mp4 --cues-file out/pac-ai-launch.cues.json`
- `assets/` — the site's fonts, project screenshots and glass tile (`images.js` holds the images as data URIs)
- `out/pac-ai-launch.mp4` — the rendered film; `out/pac-ai-launch-poster.jpg` — poster frame
