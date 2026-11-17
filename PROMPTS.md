# SmartRing Hero Section — Prompts & Specifications

This document records the exact prompt specifications and design constraints used to build the **Silver Holem** scroll-driven smart ring hero experience.

---

## 1. Initial Master Specification

```text
Build a full-screen, scroll-driven hero for "Silver Holem", a premium smart ring that tracks sleep, heart rate, and recovery. The hero plays a 190-frame image sequence scrubbed by scroll. The ring enters on load, rotates in mid-air, pauses at three features to show labeled arrows, and ends with the brand wordmark. Keep everything photographic, dark, and calm. No cartoon effects, no bouncing, no overshoot.

SKILLS TO APPLY
- Taste: sets the visual direction. Use a near-black background #0A0A0B, warm off-white text #F2F0EB (never pure white), and a brushed silver accent #C9CDD2 for arrows, dots, and the progress hairline. Mood: cinematic, dark studio, precise.
- Impeccable Design: governs layout, typography, and spacing. Use a serif display face for headlines and the wordmark (Cormorant Garamond) and a clean sans for body copy and labels (Inter). Use 8 px spacing steps and side margins of at least 6vw.
- Emil Design Engineering: governs motion and interaction. Use eased, damped scrubbing with no snapping, no bounce, and no motion longer than the scroll it belongs to.
- Conflict rule: if Taste and Impeccable disagree, Taste wins on color and mood, Impeccable wins on layout and type. If either conflicts with Emil on motion, Emil wins on timing, and the result must still feel calm.

STACK
- Next.js 15 (App Router), TypeScript (strict), Tailwind CSS v4.
- Frame scrubbing on a single <canvas>, no 3D libraries.
- Use GSAP ScrollTrigger for scroll tracking. Justify the choice in two sentences (scrub control and pinning), then use it consistently.
- Smooth the scroll-to-frame mapping with a lerp factor of 0.12 per animation frame so the frames never jump.

CONCEPT
- Pinned hero: a section 300vh tall, containing a sticky 100vh viewport.
- Entrance (on load, about 1.2 seconds): the canvas starts at 96 percent scale, 20 px lower, and 0 opacity, then eases to full scale, position, and opacity with cubic-bezier(0.22, 1, 0.36, 1). The headline fades in 150 ms after the canvas.
- Scroll progress p runs from 0 to 1 across the pinned section, and p drives everything: the frame index, the feature arrows, and the wordmark.
- Frame index = round(p * 189), so frame 0 is p = 0 and frame 189 is p = 1.
- The ring spins the whole way through the clip. Scroll stages:
  - 0 to 0.33: the ring enters and turns. Headline 1 is visible.
  - 0.33 to 0.66: stop-and-point features. Three holds pause the frame index on the sensor pod, one at p = 0.36, 0.48, and 0.60. Each hold is 0.02 wide in p. Inside a hold, the frame index is clamped to the feature frame while the arrow draws in. Outside holds, the mapping stays linear.
  - 0.66 to 1: the ring finishes its rotation and settles on the last frame. The wordmark reveals between p = 0.78 and p = 0.92.

FEATURE ARROWS (SVG overlay, not on the canvas)
- Define each feature in lib/features.ts with a label, one supporting line, a frame hold (p = 0.36, 0.48, 0.60), and an anchor point as a percentage of the frame. Starting anchors: sleep at 28% x, 40% y; heart rate at 68% x, 46% y; recovery at 62% x, 62% y. Tune these to the sensor pod's real position in each held frame.
- On hold: the arrow line draws in over 500 ms (stroke-dashoffset), the anchor dot pulses once at 1.0 to 1.15 and back, and the label fades in beside the line. Arrows are silver #C9CDD2, 1 px lines, 6 px dots.
- Arrows leave when the hold ends. Hovering a label brightens it and shows its supporting line.
- Labels: "Sleep tracking" with "Every night, measured." / "Heart rate" with "Steady, all day." / "Recovery" with "Know when to rest."

OVERLAY TEXT (exact copy, short, in the brand voice)
- Stage 0 to 0.33: h1 "Your health, on your finger." Subline: "Sleep, heart rate, and recovery in one ring." Position: left, vertically centered, max width 28ch.
- Stage 0.66 to 1: wordmark "Silver Holem" in the serif face, 64 px on mobile and 96 px on desktop, centered over the open area. Subline below: "Track every night. Recover every day." This is the only text in this stage.
- Scroll cue: a small label "Scroll" with a thin 40 px silver line below it, bottom center, fading out after p = 0.05.
- Typography: serif headlines at 48 to 72 px, sans sublines and labels at 16 to 18 px, line height 1.2 for headlines and 1.5 for sublines. Text color #F2F0EB, with a soft text-shadow of 0 2px 24px rgba(0, 0, 0, 0.45) for legibility over the haze.

FRAME ASSETS
- Frames live in /public/frames/frame_000.webp through frame_189.webp.
- Frames are 1216x684 and already cropped to remove the source watermark. Draw each frame centered and filling the canvas, using object-fit: cover logic. Scale to 102 percent at most to avoid edge artifacts. Do not scale further and do not add sharpening.
- Preload all 190 frames before the canvas draws, but render the text immediately. Show a thin silver hairline progress bar while loading.
- Decode each frame with new Image() and store it in an array. Use imageSmoothingQuality = "high".
- Cap the canvas backing store at DPR [1, 2].

LAYOUT
- Desktop (1024 px and up): the ring sits in the frame's center. Set the canvas object-position to 55% 50%, so the ring sits slightly right of center. Headline 1 sits on the left third (left 6vw, width 34vw). Arrow labels sit on the side of their anchor, never on top of the ring. Keep a 24 px minimum gap between any text and the ring. The wordmark centers over the open area above the ring.
- Mobile (below 768 px): text sits in the top 35% of the viewport in stages 1 and 2, and the ring sits in the lower 60%. In stage 3 the wordmark sits in the top 35%, with the ring below it. Arrow labels stay inside the viewport. Never let text overlap the ring.

BEHAVIOR AND ACCESSIBILITY
- Reduced motion: if prefers-reduced-motion is set, skip the entrance and scrubbing. Show frame 000 as a static image with the wordmark visible, all three arrows visible at their anchors, and no scroll cue.
- Touch: scrubbing works through native touch scroll. Do not hijack touch events.
- Suspense fallback: render the headline and scroll section first. Show the canvas after the first 10 frames are decoded, with a 300 ms fade-in.
- Low-end devices: if navigator.hardwareConcurrency is below 4, draw every second frame and round the index to the nearest even number.
- Contrast: all text meets WCAG AA. Check the sublines over the brightest part of the haze, and add a dark-to-transparent gradient from the left if needed to reach 4.5:1.
- Canvas: role="img" and aria-label="Silver smart ring from Silver Holem, floating and rotating in mid-air with sleep, heart rate, and recovery tracking shown as the light moves across the metal." Use real headings in order: h1 for the first headline, h2 for the arrow labels, and the wordmark as a styled p containing the brand name.
```

---

## 2. Refinements: Grotesque Sans, Translucent Stat Panels & Clean Layout

```text
TYPOGRAPHY (replaces the earlier serif direction)
- Display and body: one clean, heavy grotesque sans throughout, such as Inter Display or Helvetica Neue. No serif anywhere.
- Headlines: weight 700 to 800, 64 to 88 px on desktop, 40 to 52 px on mobile. Letter-spacing -0.02em. Line height 1.0 to 1.05. Sentence case, left-aligned.
- Sublines: weight 400, 20 to 24 px on desktop, line height 1.4, color at 80 percent opacity of #F2F0EB.
- Stat numbers: weight 700, 48 to 56 px, tabular figures.
- Stat labels and footnotes: weight 500, 14 to 16 px, uppercase with 0.08em tracking for labels. Footnotes use an asterisk and sit at 12 to 13 px, 60 percent opacity.
- Color: #F2F0EB for all text. Never pure white.
- Text shadow: none. The text sits on a dark background and in empty space, so it doesn't need one.

STAT PANEL (the translucent card from the reference)
- A rounded rectangle, 16 px radius, background rgba(255, 255, 255, 0.12), backdrop-filter blur(12px), with a 1 px inner border at rgba(255, 255, 255, 0.18).
- Inside, two columns separated by a 1 px vertical divider at 30 percent opacity. Left column: the big number. Right column: the label.
- Padding 24 px vertical and 32 px horizontal. The panel is 8 px grid aligned.
- Below the panel, a footnote line in the reference style, for example "*Placeholder: replace with tested figure".

OVERLAY TEXT (placeholder values, replace with real product claims before launch)
- Stage 0 to 0.33: h1 "Health, on your finger." Subline: "Sleep, heart rate, and recovery in one ring." Left column.
- Feature holds (0.36, 0.48, 0.60): each feature appears in the right column as a stat panel, with a thin silver leader line from the sensor pod anchor on the ring out to the panel edge. The leader line never crosses the ring's inner opening.
  - Sleep: number "[X] hrs" placeholder, label "Sleep tracked nightly", footnote "*Placeholder".
  - Heart rate: number "[X] bpm" placeholder, label "Heart rate, all day".
  - Recovery: number "[X]%" placeholder, label "Recovery score each morning".
- Stage 0.66 to 1: wordmark "Silver Holem" stacked on two lines, "Silver" over "Holem", weight 800, 96 px desktop and 56 px mobile, left column. Subline below: "Track every night. Recover every day."
- Scroll cue: small label "Scroll" in uppercase, 12 px, 0.2em tracking, with a 40 px silver line below, bottom center, fading out after p = 0.05. The cue sits clear of the ring.

LAYOUT (text lives in the empty space beside the ring, never on it)
- The ring occupies the center of the frame, about 35 percent of the width. Text is never placed over it.
- Desktop (1024 px and up): the left column starts at 6vw and is 26vw wide. The headline and subline sit vertically centered in that column. The right column ends at 6vw from the right edge and is 22vw wide. Stat panels sit vertically centered in that column, one at a time.
- Leader lines run from each anchor on the ring to the right column, drawn in silver #C9CDD2 at 1 px. Anchors and leader endpoints are set in lib/features.ts as percentages of the frame.
- Keep at least 48 px between any text block and the outer edge of the ring.
- Mobile (below 768 px): the headline and subline sit in the top 30 percent of the viewport, left-aligned with 6vw margins. The ring sits in the lower 60 percent. Stat panels appear full width in the top band during each hold, replacing the headline for that moment. The wordmark sits in the top band. Never let text overlap the ring.

MOTION FOR TEXT (Emil rules: no bounce, no overshoot)
- Text entrance: fade from 0 to 1 and move up 12 px over 600 ms with cubic-bezier(0.22, 1, 0.36, 1). Stagger the headline and subline by 120 ms.
- Stat panel swap: crossfade over 300 ms. Never let two panels show at once.
- Leader lines draw in over 400 ms with stroke-dashoffset, then the anchor dot pulses once.
- Animate transform and opacity only.

ACCESSIBILITY
- Every text block meets WCAG AA. Check the sublines and stat labels against the brightest part of the frame. If the left column reads poorly, add a dark-to-transparent gradient from the left edge, no wider than 40 percent of the screen.
- Use real headings in order: h1 for the headline, h2 for each stat label, and the wordmark as a styled p.
```

---

## 3. Pacing & Readability Refinements

```text
when the typography shows up add more scroll so the user can read the details, make sure the scroll is added more when the typography shows.
```
- Extended scroll track to `600vh`.
- Widened feature hold windows from `0.02` to `0.08` across the scroll line.
- Damped lerp factor tuned to `0.08` per frame.
