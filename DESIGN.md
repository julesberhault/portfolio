---
name: Jules Berhault — Marine Robotics Engineer
description: Cassette-futurist portfolio, kept clean. Smoked-charcoal screens and computer-beige reading panels, built as one piece of analog hardware.
colors:
  charcoal: "#151617"
  gunmetal: "#25282b"
  tube: "#050606"
  beige: "#d7d2c5"
  beige-key: "#e8e4d9"
  beige-edge: "#aea898"
  lamp: "#eef0ea"
  lamp-2: "#b2b5ae"
  lamp-3: "#7d817b"
  ink: "#17181a"
  ink-2: "#4a4a45"
  rule: "rgba(238, 240, 234, 0.12)"
  rule-ink: "rgba(23, 24, 26, 0.16)"
  orange: "#ef7a2b"
  orange-hi: "#ff8d3f"
  orange-deep: "#a94a14"
  amber: "#ffb43a"
  led: "#ff3b2f"
  stripe-yellow: "#f2b632"
  stripe-orange: "#e8702a"
  stripe-red: "#c8392b"
typography:
  display:
    fontFamily: "Silkscreen, VT323, ui-monospace, monospace"
    fontSize: "clamp(2.4rem, 0.6rem + 5.6vw, 6rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.075em"
  headline:
    fontFamily: "Saira Expanded, Eurostile, Arial Black, sans-serif"
    fontSize: "clamp(1.45rem, 1rem + 1.6vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "0.01em"
  wordmark:
    fontFamily: "Saira Expanded, Eurostile, Arial Black, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 800
    letterSpacing: "0.05em"
  title:
    fontFamily: "Jost, Futura, Avenir Next, system-ui, sans-serif"
    fontSize: "clamp(1.3rem, 1.1rem + 0.75vw, 1.8rem)"
    fontWeight: 600
    lineHeight: 1.25
  title-sm:
    fontFamily: "Jost, Futura, Avenir Next, system-ui, sans-serif"
    fontSize: "1.22rem"
    fontWeight: 600
    lineHeight: 1.3
  lede:
    fontFamily: "Jost, Futura, Avenir Next, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1rem + 0.9vw, 1.75rem)"
    fontWeight: 400
    lineHeight: 1.42
  body:
    fontFamily: "Jost, Futura, Avenir Next, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  contact-mail:
    fontFamily: "Jost, Futura, Avenir Next, system-ui, sans-serif"
    fontSize: "clamp(1.3rem, 0.95rem + 1.7vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.3
  label:
    fontFamily: "Jost, Futura, Avenir Next, system-ui, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0.08em"
  readout:
    fontFamily: "VT323, ui-monospace, monospace"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  readout: "3px"
  button: "6px"
  key: "7px"
  plate: "10px"
  console: "14px"
  log: "16px"
  screen: "18px"
  bezel: "26px"
  led: "50%"
spacing:
  base: "8px"
  grid-gap: "24px"
  gutter: "clamp(16px, 4vw, 48px)"
  section: "clamp(80px, 10vw, 160px)"
  section-head: "clamp(36px, 5vw, 72px)"
  nav-height: "60px"
  max-width: "1320px"
  max-width-wide: "1560px"
  stripe: "12px"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "0.78em 1.3em 0.7em"
  button-primary-hover:
    backgroundColor: "{colors.orange-hi}"
    textColor: "{colors.ink}"
  button-small:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "0.52em 0.95em 0.46em"
  link-on-charcoal:
    textColor: "{colors.lamp}"
  link-on-beige:
    textColor: "{colors.ink}"
  key:
    backgroundColor: "{colors.beige-key}"
    textColor: "{colors.ink}"
    rounded: "{rounded.key}"
    padding: "0.38em 0.78em 0.32em"
  plate:
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "4px 20px"
  readout-caption:
    textColor: "{colors.amber}"
    typography: "{typography.readout}"
    rounded: "{rounded.readout}"
    padding: "4px 7px 3px"
  bezel:
    backgroundColor: "{colors.gunmetal}"
    rounded: "{rounded.bezel}"
    padding: "10px"
  screen:
    backgroundColor: "{colors.tube}"
    rounded: "{rounded.screen}"
  log-panel:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.lamp}"
    rounded: "{rounded.log}"
    padding: "4px 28px"
  nav:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.lamp-2}"
    height: "{spacing.nav-height}"
---

# Design System: Jules Berhault — Marine Robotics Engineer

## Overview

**Creative North Star: "The Playback Deck"**

The page is one piece of 1977–1986 analog hardware, imagined cleanly: a smoked-charcoal deck whose screens are live cathode-ray tubes, alternating with computer-beige reading panels set like engraved equipment plates. The visitor plays back a marine robot's camera tape. The hardware is a set of materials, never a costume: no faux-bolts, no skeuomorphic knobs, no wear. Everything is built from the same few housings, one stripe, three signal colors and three faces.

Density is calm. Reading content sits on beige or on near-opaque charcoal log panels at comfortable measure (36–62ch), on a 12-column grid. Screens carry the imagery and the motion; panels carry the facts. Every screen is a live CRT rendered in one WebGL2 shader (barrel curvature, aperture grille, scanlines, bloom, VHS chroma bleed, hue drift, RGB split on events and scroll speed, tape tracking smear, rare color-split glitches), and all text sits crisp above it, except the hero name, which is drawn on the tube as phosphor. Two generated signal fields, water (sonar) and thermal (EO/IR), stand in where no photograph does.

The system rejects the dark card-grid engineer portfolio, the neon synthwave grid, glassmorphism and brutalism. The name appears at display size once, in the hero, and never runs edge to edge.

**Key Characteristics:**
- Two housings alternate: smoked charcoal for screen sections, computer beige for reading panels.
- A three-band yellow/orange/red stripe (12px) opens sections and closes the hero.
- Every color outside the housings has exactly one job: orange acts, amber reads out, LED red signals status.
- Every screen is a live CRT; text never is.
- Saira Expanded for titles, Jost for everything read, VT323 for on-screen readouts, and Silkscreen for the hero name, which is drawn on the tube.
- One easing curve, two durations; reduced motion gets a complete still world.

## Colors

A near-neutral hardware palette (charcoal, gunmetal, tube black, beige, ink) with three saturated signal colors, each bound to a single job, plus the stripe's three bands. Photographs and the signal fields supply every other hue.

### Primary
- **Walkman Orange** (orange): the only color for things you can press. Fills buttons (with ink labels), underlines every link, draws the focus ring on charcoal, the current-section underline in the nav, the text selection and the scrollbar thumb. It is the stripe's own orange, so actions belong to the hardware.
- **Hot Orange** (orange-hi): button hover only.
- **Burnt Orange** (orange-deep): the button's 3px bottom bevel, and link underlines on beige, where full orange loses contrast.

### Secondary
- **Amber Phosphor** (amber): on-screen readouts only: channel names, timecodes, frame counters, target counts, captions on photo screens, the tape step numerals and the fish school. Always VT323, uppercase, with a faint 6px phosphor bloom. Never underlined and never inside a button shape.

### Tertiary
- **LED Red** (led): status lights only (REC, PLAY, standby), as a 0.5em dot with a 6px glow that blinks in two steps over 1.6s.
- **Stripe Yellow, Stripe Orange, Stripe Red** (stripe-yellow, stripe-orange, stripe-red): the three equal bands of the hardware stripe and nothing else.

### Neutral
- **Smoked Charcoal** (charcoal): the page and every charcoal housing (Projects, Experience), the solid nav bar (at 94% opacity) and the Experience log panel (at 95%).
- **Gunmetal** (gunmetal): the bezel ring around project screens.
- **Tube Black** (tube): the glass of every screen, the hero, tape and contact housings, the ground control status strip, and the footer.
- **Computer Beige** (beige): reading panels (About, Skills), with a faint static grain (fractal noise at 7% alpha) so the plastic feels tactile.
- **Keycap Beige** (beige-key) and **Keycap Edge** (beige-edge): face and edge of the keycap tags.
- **Lamp White** (lamp), **Lamp Dim** (lamp-2), **Lamp Low** (lamp-3): text on charcoal and tube, in three steps: primary text, secondary text and meta, list dashes.
- **Ink** (ink) and **Ink Dim** (ink-2): text on beige, and plate labels, group titles and lifecycle arrows on beige.
- **Engraved Rule** (rule) and **Engraved Rule on Beige** (rule-ink): 1px dividers on charcoal and on beige.

### Named Rules
**The One Job Rule.** Orange means "press", amber means "the machine is reporting", LED red means "status". A color never borrows another's job: no orange text, no amber links, no red buttons.

**The Stripe Exclusivity Rule.** Stripe yellow and stripe red appear only inside the stripe. Of the three bands, only orange also leaves it, and only for actions.

**The Housing Rule.** A section is either a charcoal or tube housing (screens) or a beige panel (reading). Never invent a third housing color.

## Typography

**Display Font:** Silkscreen 700, the hero name only, drawn on the tube. **Headline Font:** Saira Expanded 800 (Saira at 125% width, self-hosted as a single instance), with Eurostile and Arial Black as fallbacks. The user asked for something bolder than Saira Expanded; its wide, heavy capitals read like 80s tape-deck and cassette-label lettering.
**Body Font:** Jost (with Futura, Avenir Next, system-ui)
**Readout Font:** VT323 (with ui-monospace)

**Character:** Saira Expanded is the extended hardware lettering on the deck's faceplate; Jost, a Futura revival, is the Nostromo signage voice that carries every sentence; VT323 is the DEC terminal glowing on the tube. All three are self-hosted.

### Hierarchy
- **Display** (Silkscreen 700, clamp(2.4rem → 6rem), line-height 1, uppercase, -0.075em): the hero name, once per page.
  - The user asked for a bolder cassette-futurist look with the cathode effect on it, so this is the one text that is drawn on the tube rather than above it.
  - main.js paints it into the hero screen's overlay as an amber phosphor dot matrix: round dots at about fontSize/17, a blurred phosphor glow, and the bottom veil behind it. The CRT shader then curves, scans, blooms and splits it with the picture.
  - The h1 stays in the DOM with transparent ink, for assistive tech, search and selection.
  - Without WebGL, CSS draws the same amber dot matrix (a radial-gradient mask plus a glow).
- **Headline** (Saira Expanded 800, clamp(1.45rem → 2.5rem), 1.15, uppercase, 0.01em): section titles, always in the same grid position.
- **Wordmark** (Saira Expanded 800, 0.8rem, uppercase, 0.05em): the name in the nav bar.
- **Title** (Jost 600, clamp(1.3rem → 1.8rem), 1.25): project names. **Title small** (Jost 600, 1.22rem, 1.3): experience and education entries.
- **Lede** (Jost 400, clamp(1.25rem → 1.75rem), 1.42, max 36ch): the About introduction. Section intros use Jost at clamp(1.05rem → 1.2rem) in lamp-2, max 52ch.
- **Body** (Jost 400, 1.0625rem, 1.6; 1rem under 560px): all reading text, max 62ch. Numbers use tabular lining figures.
- **Contact mail** (Jost 500, clamp(1.3rem → 2.5rem), 1.3): the email address in Contact, lamp text with a 3px orange underline.
- **Label** (Jost 600, 0.74rem, 0.08em, uppercase, ink-2 or lamp-2): engraved terms on rating plates and spec tables.
- **Readout** (VT323 400, 1.2rem, 1, 0.05em, uppercase, amber with phosphor bloom): on-screen readouts only; 1.05rem on captions and under 560px.

### Named Rules
**The Faces Rule.**
- Saira Expanded for titles and the nav wordmark.
- Jost for everything read, including the contact email and engraved labels.
- VT323 for on-screen readouts.
- Silkscreen only for the hero name on the tube.
- No other faces.

**The Crisp Text Rule.** No text ever receives scanlines, curvature or color distortion. Readouts and titles are DOM text above the tube.

## Layout

Content sits in a centered frame (max-width 1320px, growing to 1560px at 2000px+, where the root font size also steps to 112.5%, and 125% at 3000px+), with a fluid gutter of clamp(16px, 4vw, 48px). Inside it, a 12-column grid with 24px column gaps carries every section: About splits lede (columns 1–7) and plate (8–12); projects alternate media (1–7) and text (9–12) with a flipped variant; Experience sets its title in columns 1–5 and the log in 7–12; Skills sets keycap groups in a two-column block (1–7) and plates in 9–12. Everything collapses to one column under 960px.

Every section uses the same vertical padding, clamp(80px, 10vw, 160px), and a section head gap of clamp(36px, 5vw, 72px). Spacing otherwise moves on an 8px base. Screens run full-bleed where they are the section (hero, Detector tape, interlude, sonar, contact); project screens are sized by the grid inside bezels. The nav is a fixed 60px bar that turns solid after the hero; the hero screen starts below it so nothing covers the subject. Under 880px the nav links fold into a menu drawer.

Long-form motion is scroll-bound: the Detector tape is a 340vh track with a sticky full-viewport stage, and the sonar is a sticky full-viewport screen behind the Experience log.

## Elevation & Depth

Depth is mostly tonal and physical: housings are flat, and objects read as raised through bevels and inset highlights rather than shadows. Bottom-weighted borders make buttons and keycaps feel pressable; a 1px inset top highlight makes plates and bezels feel molded. One soft seat shadow sits under each screen bezel so the monitors rest on the deck. Glow exists only where the world emits light: phosphor readouts and LEDs.

### Shadow Vocabulary
- **Bezel seat** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), 0 24px 48px -24px rgba(0,0,0,0.7)`): the gunmetal bezel around a project screen. Nowhere else.
- **Plate highlight** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.45)`): the molded top edge of a beige rating plate.
- **Engraved outline** (`box-shadow: inset 0 0 0 1px var(--rule)`): charcoal consoles (tape steps, Experience log, tape counter).
- **Phosphor bloom** (`text-shadow: 0 0 6px rgba(255,180,58,0.45)`): amber readouts.
- **LED glow** (`box-shadow: 0 0 6px var(--led)`): status lights.

### Named Rules
**The Emitters-Only Glow Rule.** Only things that emit light glow: phosphor readouts, LEDs, and the CRT's own bloom. Buttons, panels and text do not.

**The Bevel-Not-Shadow Rule.** Pressable things are raised with a darker bottom border (3px, 2px on small buttons), not a drop shadow. Pressing moves them down 2px.

## Shapes

Rounded, molded-plastic geometry. Corners grow with the size of the object: readout captions 3px, buttons 6px, keycaps 7px, plates 10px, consoles 14–16px, screens 18px, bezels 26px (bezels 20px and screens 14px under 560px). Screens add barrel curvature in the shader (curvature 0.03–0.035) on top of their rounded corners. Dividers are 1px engraved rules. LEDs and award markers are circles. The stripe is a hard, unrounded 12px band of three equal stripes.

## Components

### Buttons
Chunky hardware keys, confident and plain.
- **Shape:** gently rounded (6px), with a 3px burnt-orange bottom bevel.
- **Primary:** solid orange with ink label, Jost 600 at 1rem, padding 0.78em 1.3em 0.7em, an optional leading line icon at 0.55em gap.
- **Hover / Focus / Active:** hover lifts to hot orange over 0.45s on the house easing; active presses down 2px; focus shows a 2px outline (lamp on charcoal, ink on beige) at 3px offset.
- **Small:** padding 0.52em 0.95em 0.46em, 0.9rem, 2px bevel (the nav Email key).

### Links
- **Style:** never orange text. Lamp text on charcoal, ink on beige, weight 500, with a 2px orange underline at 0.28em offset (burnt orange on beige).
- **Hover:** underline thickens to 3px and drops to 0.34em offset. The contact email uses a 3px underline that thickens to 5px.

### Keycap tags
- **Style:** keycap beige face, ink Jost 500 at 0.95rem, 1px keycap-edge border with a 3px bottom edge, 7px corners, 8px gaps. Static, not interactive.
- **Flow variant:** a sequence of keys joined by small chevrons drawn in ink-2 (the project lifecycle).

### Rating plates and spec tables
- **Plate (on beige):** a definition list in a 10px-cornered plate with a 1px ink border at 32%, a 16% white face and the molded top highlight. Rows are a label column (min 7.5em) and a value column, split by engraved rules. Labels are uppercase tracked Jost 600. Key figures roll up like a counter on reveal.
- **Spec table (on charcoal):** the same label/value rows without the plate, between top and bottom engraved rules, labels in lamp-2.

### Screens and bezels (signature)
- **Screen:** tube black, 18px corners inside a 10px gunmetal bezel (26px corners), 4:3 or 1:1 for project photos, full-bleed elsewhere. The WebGL2 CRT renderer draws at most two visible screens: barrel curvature, a 3px RGB aperture grille, scanlines every 3 device pixels, bloom on bright areas, edge misconvergence and vignette, a slow roll bar, grain, and YIQ chroma bleed and hue drift at rest. On top of that:
  - an RGB split driven by a mouse hover or a click or tap (never by scrolling or touch-scrolling);
  - a color-split glitch burst (about 150ms, one screen, every 10–20s).

  Nothing displaces or shakes the picture: no power-on, degauss wobble, jitter, tearing or flicker (the user asked for them removed). Screens show their picture as soon as they are visible.
- **Readout caption:** amber VT323 in the screen's lower-left corner on a 62% tube-black backing, 3px corners.
- **Corner HUD:** amber readouts pinned to a screen's top corners (channel name left; timecode, LED and status right).
- **Signal fields:** generated domain-warped grain gradients. Water: deep teal to blue with light shafts, behind the sonar. Thermal: black, teal, orange, red and hot white, false-color, behind Contact and as every screen's standby signal while media loads.
- **Detector spec card:** the tape's card is a uniform readout.
  - **Content:** a '170 M-DETECTOR' amber VT323 title, then two even columns of figures (length, beam, draft, crew, engines, drive, electric mode, payload; data from EDGE Group). Below them, 'Autonomy suite' capsules: INS, speed log, DVL, FLS SeapiX, EO/IR, radar, LiDAR, radio, 4G, Starlink.
  - **Scroll behaviour:** nothing about the Detector shows at first; the card is hidden. As the tape plays, the card fades in, then the title, each figure, the 'Autonomy suite' label and each capsule are added one after another (fade and 6px rise). Their space is reserved from the start, so the card keeps one size.
  - **On phones:** the frame is 4:3, at most 30svh (24svh on screens under 640px tall). Each figure stacks its label over its value, and the PLAY / FRM / timecode readouts sit along the top edge of the picture. The footage credit is hidden below 960px wide.
  - **Reduced motion:** everything is lit.
- **Video sources:** H.264 MP4 is listed first and VP9 WebM second. Safari/WebKit claims WebM support but stalls on these VP9 files, so MP4 must come first. A real tap or click plays and unlocks every monitor (iOS Low Power Mode). If the WebGL context is lost, `has-crt` is dropped and the plain media show.
- **Monitor playlist:** the five clips form one playlist of channels (CH 04–08). Each monitor starts on a different random clip and plays it once (no loop). When it ends, the monitor changes channel to the next clip: a 0.45 s burst of analog static in the CRT shader plus a colour glitch, with the CH label updated. There is no static under reduced motion.
- **Ground control wall (interlude):** five CRT monitors in gunmetal bezels on charcoal: a 2-column-wide center feed plus two monitors on each side, angled 14° toward the viewer with a 1600px perspective.
  - Each monitor plays a graded 640×480 stock loop (the center one plays a 1280×960 loop over rocks and reef blocks), with an amber 'CH nn' readout and an LED.
  - A tube-black status strip below carries an amber readout.
  - Video textures upload only on new frames (requestVideoFrameCallback).
  - On phones: the center monitor full width, then a 2×2 grid, with no angle.
- **Skill keys:** keycap tags carry a 1.05em mark in ink-2 before the label. Languages and tools use brand logos from Simple Icons (CC0), filled. Expertise, methods, domains and lifecycle use Lucide line icons (ISC) at a 1.8 stroke. Gazebo and Onshape have no brand mark, so they use the Lucide box and shapes icons. All marks are inlined in the page's SVG sprite, with no external requests. The project lifecycle is one row of keys joined by chevrons at full width; on phones it stacks vertically with down chevrons.
- **Paired screens:** two different aspect ratios share one height: a 4fr 4:3 tube beside a 3fr square tube. They stack at 4:3 on phones.
- **Ranging illustration (Exail project):** a live CRT screen (5:4) fed by a canvas (`assets/js/mdt.js`). It shows a synthetic white-hot infrared view in which an 18 m workboat approaches from 320 m to 55 m, with the camera rolling and heaving. The boat is a detailed thermal side profile, pitching gently: raked bow and sheer line, transom, hull shaded warm aft and cool forward with a wet waterline band, wheelhouse with cold dark glass, flybridge, mast with radar bar and antennas, bow wave, wake and a faint reflection. It deliberately has no exhaust glow and no deck rail. It is drawn near white-hot on a darker sea so it reads at a glance. The TRK box is fitted to the vessel's outer bounds (hull to antenna tip, following the pitch) with 1.5 px clearance.
  - An amber overlay draws the segmented horizon, a TRK box, the gap bracket, a bearing scale and BRG / GAP / RNG readouts.
  - Range is computed with the report's geometry and camera parameters (h = 2 m, 50° × 40° field of view, 640 × 512, Earth-curvature dip).
  - The screen is captioned "Illustration · synthetic IR view". Below it, a side-view SVG diagram in lamp lines explains d = h / tan(dip + γ).
- **Resize:** mobile toolbars (Brave and Safari on iOS) fire bursts of resizes while scrolling. Screens keep their backing canvas and let CSS stretch the picture during a burst. They rebuild once, 200 ms after the size settles, and redraw immediately inside that step, so they never flash blank. The hero name overlay and the fish canvas are debounced the same way.
- **Fish sonar height:** the sticky sonar is 100lvh (the large viewport), so on phones it still reaches the true bottom when the browser toolbars collapse. With 100svh it ended on a visible line where fish and their glow were cut off.
- **Fish sonar is plain:** this one screen skips the tube (`data-plain`): the water field and crisp fish, with no curvature, scanlines or split.
- **Flags:** language names in About and Skills carry 1.5×1em inline SVG flags (France, United Kingdom, Spain) with 2px corners and a hairline edge.
- **Fish banks:** several loose banks (5 on desktop, 3 on mobile; about 400 and 150 fish).
  - **Drawing:** each fish is an amber water drop: a round head tapering to a point about 5.6 head-radii behind it. A linear gradient fades it from the back of the round head to the tip. Faster fish stretch slightly lengthwise. One shared Path2D and gradient are drawn per fish with a transform, plus a white flash layer on turns and startles. There are no lingering trails (the canvas clears every frame). An amber neon glow comes from a single CSS drop-shadow (one pass, light enough for phones), on their own canvas over the plain water field at up to 1.5× device pixels.
  - **Motion:** slow and mesmerizing by design: about 36–90 px/s (0.6–1.5 px per frame). Each fish has its own gentle wander and pace, a slow current moves the banks, and a mild startle loosens part of a bank every 6 to 11 s. Zone edges are smooth force ramps, never on/off thresholds, and flashes follow a smoothed turn rate, so fish don't flicker along an invisible line.

### Navigation
- **Style:** fixed 60px bar, transparent over the hero, then charcoal at 94% with an engraved bottom rule. Saira Expanded wordmark left; Jost 500 links at 0.95rem in lamp-2, lamp on hover; the current section gets lamp text with a 2px orange underline at 0.45em offset.
- **Tape counter:** three rolling digit windows (dark gradient cells, 2px corners) on a near-black 5px housing, rolling with scroll. Hidden under 420px.
- **Mobile:** under 880px, a "Menu" toggle with three bars that cross into an X opens a full-width drawer of 1.1rem links split by engraved rules; the nav Email key hides.

### Log panel
- **Style:** charcoal at 95% with an engraved outline and 16px corners, padding 4px 28px, entries split by engraved rules. Used for the Experience and Education timelines over the sonar, and (as the 14px tape-step console) for the Detector steps, where inactive steps dim to 40% lamp and the active one lights up with its amber numeral.

### Stripe
The 12px three-band stripe (yellow, orange, red in equal thirds) is pinned to the top edge of every section after the hero and to the hero's bottom edge, which opens About.

## Do's and Don'ts

### Do:
- **Do** open every section with the 12px stripe at its top edge, and close the hero with it.
- **Do** keep orange for buttons, link underlines, focus and the current-nav underline; links stay lamp or ink text.
- **Do** set every on-screen readout in amber VT323, uppercase, with the 6px phosphor bloom.
- **Do** run every new screen (photo, video, sequence or field) through the shared CRT renderer, inside a gunmetal bezel when it sits in the grid.
- **Do** keep all text above the tube effect, and give titles over a live field a 0 1px 2px dark text shadow for legibility.
- **Do** use the one easing curve, cubic-bezier(0.16, 1, 0.3, 1), at 0.45s for state and 0.9s for reveals.
- **Do** ship a complete still fallback: under reduced motion screens hold one frame with only the static bleed, counters, glitches, fish motion and blinking stop, and the tape becomes a static stack; without WebGL, screens show a CSS scanline-and-vignette overlay and static water and thermal gradients.
- **Do** use one line-icon set at stroke width 1.6, inline SVG.

### Don't:
- **Don't** set orange text, amber links, or anything clickable in amber or red.
- **Don't** put scanlines, curvature or color distortion on body text, and don't let distortion exceed 3 flashes per second.
- **Don't** use stripe yellow or stripe red outside the stripe.
- **Don't** add glass, backdrop blur, or glow on anything that does not emit light.
- **Don't** add another typeface or set reading text in Saira Expanded, VT323 or Silkscreen.
- **Don't** set the name at display size anywhere but the hero, or let it run edge to edge.
- **Don't** build the dark card-grid engineer portfolio or the neon synthwave grid.
- **Don't** add wear, rivets, knobs or other hardware costume; the hardware is materials only.
