# SUPPA — Drama Queen (artist site)

Single-page artist site for SUPPA's debut single **Drama Queen** — a living,
breathing scroll modeled on the [blanc](https://github.com/rafetangorra-tech/blanc)
site's scroll grammar: Lenis smooth scroll wired into GSAP ScrollTrigger,
pinned scrub sections, melt-curtain transitions with grown drip edges, and
living-portrait video layers over every photo.

Plain HTML/CSS/JS — no build step. GSAP + Lenis load from CDN.

## Structure

```
index.html      the whole site
css/style.css   dark chrome/red theme + scroll-engine base states
js/main.js      the scroll engine (Lenis + GSAP), drip-edge generator,
                lazy living-media loader
assets/         web-optimized stills (.jpg) + living-portrait loops (.mp4)
```

## The scroll, section by section

1. **Intro (pinned)** — giant chrome SUPPA wordmark behind the living cover;
   scrolling spreads and fades the wordmark while the cover breathes forward.
2. **The single (pinned)** — the intro's black melts down and away (drip edge
   trailing); label → title → blurb → CTAs mix in channel by channel, scrubbed
   both ways. A record spins with the cover as its label.
3. **Behind the song** — the writing credit: Drama Queen was written by the
   [blanc](https://rafetangorra-tech.github.io/blanc/) collective, with more
   SUPPA × blanc music to come.
4. **Photos ("In motion")** — living portraits: each still carries a subtle looping video
   that plays only in view; frames arrive oversized and drained, flooding to
   color as they settle. Parallax via `data-speed`.
5. **About / Booking** — reversible reveals; booking melts in on hot pink.

Living media degrades gracefully: every video sits over its own poster still,
loads lazily (`data-src`), and removes itself on error — no JS, reduced
motion, or a missing file all fall back to the photograph.

## Before going live

Search `index.html` for `TODO`:

- Replace the `#` streaming links (Spotify / Apple Music / YouTube)
- Paste the streaming embed into the single section
- Replace the placeholder bio and booking email
- Add real social profile links

## Publish with GitHub Pages

Repo → Settings → Pages → Deploy from branch → `main` / root.
(Repo is private by default; Pages on a private repo requires making the
repo public or a paid plan.)

## Regenerating assets

Full-resolution originals live in the Suppa Shoot archive. Stills are
web-optimized JPEGs; the `.mp4` loops are 5-second Seedance 2.0
living-portrait renders (subtle idle motion, locked camera, silent).
