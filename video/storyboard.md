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

- `film.js` — the whole film (scenes, effects, timing), shared by both formats; every frame is a pure function of time
- `launch.html` — 16:9 (1920×1080) shell: plays live in a browser (click for sound)
- `launch-instagram.html` — 4:5 (1080×1350) shell for Instagram feed posts; compact layouts with key content inside the centred 3:4 area the profile grid shows
- `launch-vertical.html` — 9:16 (1080×1920) shell for TikTok, Reels and Shorts; same timing and score, layouts restacked and kept clear of TikTok's top bar, caption area and right-hand action buttons
- `score.js` — the soundtrack (Web Audio), written to the same beat grid
- `render.mjs` — renders a shell to MP4 with the score muxed in: `node render.mjs launch.html out/pac-ai-launch.mp4` or `node render.mjs launch-vertical.html out/pac-ai-launch-vertical.mp4`
- `sync-check.mjs` — checks every cut lands on a beat: `node sync-check.mjs out/pac-ai-launch.mp4 --cues-file out/pac-ai-launch.cues.json`
- `assets/` — the site's fonts, project screenshots and glass tile (`images.js` holds the images as data URIs)
- `out/pac-ai-launch.mp4` — the rendered film; `out/pac-ai-launch-poster.jpg` — poster frame
- `out/pac-ai-launch-instagram.mp4` — the 4:5 Instagram feed film; `out/pac-ai-launch-instagram-poster.jpg` — its poster frame
- `out/pac-ai-launch-vertical.mp4` — the 9:16 film; `out/pac-ai-launch-vertical-poster.jpg` — its poster frame
- `out/pac-ai-launch-no-music.mp4`, `out/pac-ai-launch-vertical-no-music.mp4`, `out/pac-ai-launch-instagram-no-music.mp4` — the same films with no audio, for adding a licensed song inside TikTok, Instagram or an editor
