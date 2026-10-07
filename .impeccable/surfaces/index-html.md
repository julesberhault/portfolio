---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: portfolio homepage (index.html)

## Scope and mode
- **What it is:** a single-page portfolio served as static HTML/CSS/JS from GitHub Pages. Visitor mode: **Experience** (the work leads, and contact stays within easy reach).
- **Screen sizes (mandatory):** mobile (390), tablet (768), desktop (1280–1600), wide (2560) and ultra-wide (3440×1440).
- **Content source:** `README.md`. Don't invent any claims beyond what it says.
- **Dropped:**
  - the dive / light-dimming effect and the depth gauge;
  - brutalism;
  - glassmorphism;
  - the 1960s–70s retro-futurism, now refined to **cassette futurism**.

## Page order
1. **Hero:** `assets/img/subsea.webp` (4096×2294).
   - The AUV hull is always pinned to the top center and nothing ever covers it.
   - Landscape: fill the screen, anchored to the top.
   - Ultra-wide: scale to fit the width, anchored to the top, cropping the bottom reef.
   - Portrait: size the image so the hull spans the full screen width; the area below it continues as water.
2. **About:** short intro and current role. The README's key figures (17 m, 1,800 hp, 2027, 2 awards) appear on an engraved rating plate, rolling up like counters.
3. **Projects:**
   - **USV:** `docs/abu_al_abyad` (2023), then the **Detector sequence** (48 frames in `docs/detector_in_operation/`) played full-screen by scroll position.
   - **Container-transport USV:** the Stavanger ground-station photo is a placeholder the user chose to keep. Its alt text must describe what the photo really shows.
   - **X301 AUV:** `deploying_x301` (4:3) and `operating_x301` (square) side by side at one shared height (4fr / 3fr columns). Stacked at 4:3 on phones.
   - **CoHoMa 2022:** `cohoma_challenge` plus both awards.
4. **Interlude:** *changed at build (user request)*. It's now a ground control station wall of five CRT monitors, each playing a graded stock clip and labelled only with a channel number (CH 04–09, six 20 s channels rolling across five monitors). There's a large center feed, four side monitors angled toward the operator, and an amber status strip ('Ground control · 5 feeds'). It is aria-hidden, the footer credits the clips as ambient stock footage. On phones: the center monitor first, then a 2×2 grid. The project lifecycle sits in Skills as a row of keys.
5. **Experience & Education:** the host section for the **fish school**. The school swims in when the section is read and leaves when the visitor moves to another section.
6. **Skills, Languages, Certifications, Publication**
7. **Contact:** the thermal (EO/IR) signal field behind it.

## Assets and constraints
- **Stock videos** (`assets/vid/`): re-encode them for the web and use them only as ambience.
  - The scuba diver may appear in the footage (*changed by user request*).
  - No captions. *Changed at build (user request):* the footer credit line was removed. The wall still labels each feed only by channel number.
- **Detector frames:** load them only when the section gets close; serve 960 px versions on mobile.
- **Fish school behavior:** Reynolds rules plus a flash of silver when fish turn, ripple waves through the school, the cursor or a touch acting as a predator so the school splits and re-forms around it (the bait-ball split), and 2–3 depth layers. 240 fish on desktop and 120 on phone-width screens. Pause it when it's off-screen or the tab is hidden.
- **Reduced motion:** `prefers-reduced-motion` gets a complete still fallback. Text contrast meets WCAG AA everywhere, including over photos.

## Direction contract
THESIS: **Cassette futurism**: the future as 1977–1986 analog hardware imagined it. Think the Nostromo's consoles in *Alien*, the Esper photo-enhance machine in *Blade Runner*, the Sony Sports Walkman, CRT phosphor readouts, tape counters, smoked plastic and beige housings with orange-and-red stripes. It's kept **clean and aesthetic**: the hardware is a set of materials, never a costume. This page refuses the dark card-grid engineer portfolio and the neon synthwave grid.

OWN-WORLD:
- **Two housings alternate between sections:**
  - smoked charcoal for "screen" sections, which carry media on CRT-style screens;
  - computer-beige plastic for "panel" sections, which carry the reading content, with labels set like engraving.
- **Signature mark:** a three-band hardware stripe in Walkman yellow, orange and signal red. It marks section starts and the hero's bottom edge, at one fixed thickness.
- **Colors with jobs:**
  - **Orange is the only color for clickable things** (user choice). It's the stripe's own orange, so the actions belong to the hardware.
    - Buttons are solid orange with ink-colored labels.
    - Links are never orange text. They're lamp-white text on charcoal or ink text on beige, always with an orange underline. That keeps them distinct from the amber readouts.
  - **Amber phosphor** is only for screen readouts (timecodes, frame counters, coordinates), the classic amber monochrome monitor (user choice). Readouts are never underlined and never sit in button shapes, so they can't be mistaken for actions.
  - LED red is only for "REC / PLAY" status lights.
- **Type:**
  - Display: Saira Expanded 800 (replacing Saira Expanded at the user's request for a bolder face), an extended Eurostile-style face, the classic hardware lettering.
  - Text: Jost, a Futura revival, the *Alien* title and Nostromo signage face.
  - Screen readouts: VT323, a DEC terminal face, used sparingly at small sizes.
- **Shapes:** screens with rounded corners like a slightly curved CRT, chunky rectangular hardware buttons with a subtle bevel, thin engraved rules. No glass, no drop shadows, no glow except a faint phosphor bloom on screen readouts.
- **Cathode-ray (CRT) screen effect (user request):** a real CRT treatment on every "screen". It's the page's lens distortion and its signature material.
  - Barrel curvature with rounded screen corners.
  - A visible shadow-mask / aperture-grille pattern and scanlines.
  - Phosphor bloom on bright areas (the AUV lamps, the wake, the readouts).
  - RGB misconvergence growing toward the edges, and a soft corner vignette.
  - A slow rolling refresh bar.
  - *Removed at build (user request):* the power-on line, the degauss wobble, flicker, tape jitter and glitch tearing. Nothing shakes or displaces the picture.
  - *Removed at build (user decision):* the hero's enhance reticle. The hero relies on the tube itself.
  - **Color distortion (user request):** it lives in the same shader, in the VHS / analog idiom. At rest a screen is calm and clear. Distortion rises with events and settles back.
    - *Chroma bleed:* color smears slightly to the right of sharp detail, as on VHS. It's always on, at a low level.
    - *Hue drift:* a very slow, faint wander of color phase, like an NTSC set. Always on, barely noticeable.
    - *RGB split:* the red and cyan channels pull apart and snap back together on a click or tap, when the pointer enters a screen, and in proportion to scroll speed. *Removed at build (user request):* scroll-driven split. Splits come only from a mouse hover or a click or tap.
    - *Tape tracking:* on the Detector tape, jogging fast widens the color smear and split. Holding still gives a clean frame.
    - *Glitch bursts:* rare and short (about 150 ms, at most one screen at a time, every 10–20 s). A brief color split, with no tearing.
    - *On text:* "JULES BERHAULT" enters with red and cyan offsets that converge into crisp letters, and it stays crisp after that. Orange buttons get a brief split on hover. Body text never distorts.
    - *Safety:* no more than 3 flashes per second (WCAG 2.3.1). Reduced motion turns off every animated distortion, leaving only the faint static bleed.
  - **Signal fields (inspired by grainient.supply's animated gradients, user reference):** slow, grainy, domain-warped gradient fields generated in the shader. They're our own code, never Grainient's paid assets. Each palette comes from sensor imagery Jules actually works with:
    - *Water / sonar:* deep teal-to-blue flowing light, the backdrop behind the fish school in Experience.
    - *Thermal (EO/IR):* a morphing false-color field of black, teal, orange and red, like a thermal camera. It's the CRT "standby signal" while any screen's media loads, and the backdrop of the Contact screen, replacing the second stock clip.
    - Both run through the same CRT and color-distortion effects as everything else.
    - With reduced motion, each field is a single still frame.
  - **Grain:** one film/VHS grain texture is shared by every screen and field. A much fainter static grain sits on the beige panels, so the plastic feels tactile but stays clean.
  - **Where it applies:** screens only (hero, project photos, Detector tape, interlude, fish-school sonar, contact clip). The beige panel sections stay clean, so the page keeps its clean and aesthetic balance.
  - **Text stays crisp:** all text is set above the effect and never receives scanlines or curvature.

STORY: The visitor plays back the AUV's camera tape. A real seabed on a CRT feed, then the vessels on screen (the 9 m to 17 m USV, the container-transport USV, X301, CoHoMa), with specs on engraved panels. They understand that Jules takes hardware to sea, and they email him.

FIRST VIEWPORT:
- The seabed photo is full-bleed as the AUV camera feed, with the hull pinned at the top center.
  - It's rendered through the full CRT effect: curvature, shadow mask, scanlines, bloom on the lamp beams, edge misconvergence, and a slow roll bar. Small amber phosphor readouts sit in the corners: "CH 01 · AUV belly cam" and a running timecode.
    - *Changed at build:* no coordinates on the feed. Where the photo was taken is unknown, so Abu Dhabi coordinates on it would be a false claim. The coordinates appear in About and Experience instead, tied to real places.
    - The screen starts below the nav bar so nothing covers the hull. On portrait screens the readouts sit below the hull.
- **Hero text:** **"JULES BERHAULT"** at statement size across the lower third. The user chose this.
  - *Changed at build (user request):* set in Silkscreen bold, the bolder cassette-futurist look from the user's "CRT MONITOR" reference.
  - It is drawn on the tube as an amber phosphor dot matrix with a glow, so the CRT effect applies to it: curvature, scanlines, bloom and RGB split.
  - The h1 stays in the DOM with transparent ink.
  - It's large and impactful, but it doesn't run edge to edge. It takes about half to two-thirds of the content width on desktop and is capped on wide screens. The user found a full-width name megalomaniac.
- **Below the name, at text size:**
  - "Marine Robotics Engineer · Technology Innovation Institute, Abu Dhabi";
  - an orange hardware Email button.
- The stripe runs along the bottom edge of the hero.

FORM: The user pinned cassette futurism (clean, aesthetic), replacing the earlier retro-futurism, glassmorphism and the roll. Seed 232df961 assigned grounded candidate 6, the Deck Log, which the user did not take.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Visual system (harmonized)
The goal is that the whole page reads as one piece of hardware, built from the same few materials.

- **Colors:**
  - Smoked charcoal, gunmetal and computer beige for the housings, plus ink for text on beige.
  - Orange for actions, amber phosphor for readouts, LED red for status.
  - The stripe's yellow, orange and red. Of these, only the orange also appears outside the stripe, for actions.
  - Photos and footage supply everything else.
- **One image grade:**
  - Every photo, Detector frame and clip gets the same light treatment: slightly deeper shadows, a touch less saturation and a soft vignette. It's baked into the exported files.
  - The CRT effect is rendered live by a shader, never baked into the images.
  - Jules's own photos are never altered beyond the light grade.
  - The stock clips are graded harder, so they read as atmosphere.
- **One way to build a section:**
  - Each section starts with the stripe, then a section number shown as a small segment-style readout, then a Saira Expanded title in the same place on the grid, then a one-line intro in Jost.
  - Housings by section:
    - Hero: screen (photo).
    - About: beige panel.
    - Projects: charcoal with screens.
    - Interlude: charcoal with the monitor wall.
    - Experience: charcoal, with the fish school on a sonar-style screen over the water signal field.
    - Skills: beige panel.
    - Contact: screen (thermal signal field).
- **Project photos:** shown on CRT-shaped screens sized by the 12-column grid. Each has a readout caption in VT323 (place, year) and specs on an engraved panel beside it in data style.
- **Detector sequence:** runs full-bleed as tape playback. Scrolling jogs the tape, with a "PLAY ▶" LED, a frame counter (FRM 01/48) and a timecode in the corners.
- **Signature detail:** a mechanical three-digit tape counter in the nav that rolls as the page scrolls.
- **Type:**
  - Saira Expanded only for titles, the hero name and small engraved labels on plates. The contact email is set in Jost.
  - Jost for all reading text.
  - VT323 only for on-screen readouts.
  - The name appears at display size only in the hero.
- **Grid and spacing:**
  - Content uses a 12-column grid with a maximum width that grows slightly on 2560 px screens.
  - Screens with media run full-bleed where noted.
  - Spacing is on an 8 px base, with the same top and bottom padding on every section.
- **Motion:**
  - Everything uses one easing curve and two durations.
  - Text slides and fades in.
  - Key figures (17 m, 1,800 hp, 2027) roll up like a counter.
  - Only these move continuously: the fish school, the Detector tape and the nav counter.
- **Fish:** behavior unchanged. They're drawn as amber phosphor vector shapes with a short afterglow trail, warm on the cool water field, like a school seen on a sonar or fish-finder display.
- **Icons:** one line-icon set at one stroke weight.
- **Not carried over from the README:** emoji and the colorful badges. Skills become engraved keycap-style tags.
- **Accessibility:** scanlines and curvature never sit over body text. `prefers-reduced-motion` turns off the glitches, the counters and the fish motion.

## Implementation notes
- **CRT shader:** one shared WebGL renderer draws the screens currently in view (at most two at once). Images, video, the Detector frames and the fish-school canvas go in as textures, and the signal fields are generated in the same shader (domain-warped noise plus grain), and the shader adds curvature, mask, scanlines, bloom, misconvergence, vignette, roll bar, and the color distortions (chroma bleed in YIQ space, hue drift, RGB split, tape smear, color-split glitches). One `distortion` value per screen is fed by events and scroll speed and eases back to rest.
  - **Fallback** (no WebGL, or reduced motion): a static CSS overlay with scanlines and vignette, and no roll or animation.
  - The effect pauses when a screen is off-screen or the tab is hidden.
- **Grading:** bake the grade in with ffmpeg / cwebp at export. Each photo gets a set crop point so square originals survive the plate shapes.
- **Fonts:** serve Saira Expanded, Jost and VT323 from the site itself.
- **Performance:** keep the first viewport under about 600 KB and the JS under about 30 KB.

## Unresolved
- No real image of the container-transport USV exists yet (the placeholder stays).

## Later fixes (user requests)
- The fish sonar screen is plain: no tube effect, only the water field and crisp fish (`data-plain`).
- No scroll-driven color distortion, and no tape speed smear. Touch scrolling never triggers a split; only a real mouse hover or a click or tap does.
- Tape progress is computed from the sticky frame's 100svh height, so it doesn't step backwards when a phone's address bar moves. The About counters reserve their final width, and `overflow-anchor: none` keeps the scroll position from jumping.
- Monitor-wall videos stay rendered under the tube canvas so phones keep decoding them. Each screen shows its poster until frames arrive, frames upload when currentTime advances, and playback retries on the first touch.
- Languages carry SVG flags (France, United Kingdom, Spain) in About and Skills.
- Fish: crisp, slim tapered bodies on their own device-resolution canvas over the plain sonar, with no trails. Motion is more chaotic: per-fish wander and pace, a shifting current, and periodic startles.
- About plate: the figures (largest vessel, next delivery, awards, domains) are replaced by platforms. Surface: 9 m outboard, 17 m dual waterjet, 17 m autonomous catamaran, DriX H-8. Subsea: 4 m X301, teleoperated offshore. Ground: UGV research platforms at ENSTA Paris.
- Projects updated with the user's facts:
  - 9 m and 17 m USVs: remote operation to autonomy, and obstacle avoidance on the 17 m.
  - Catamaran: from concept to integration, with a French naval architect and a shipbuilder in China. Fully autonomous, COLREGs-compliant, long-range offshore.
  - AUV: teleoperated offshore for data acquisition.
- New project: Exail, robotics division, 2021, obstacle detection and tracking from a single camera on the DriX H-8.
  - Facts come from the user and his report (https://webperso.ensta.fr/jaulin/rapport_pfe_jules_berhault.pdf).
  - It is illustrated by a synthetic IR ranging screen using the report's parameters, plus a geometry diagram.
- Fish: fading speed lines and an amber neon glow are back (CSS drop-shadow), rendered at up to 1.5× device pixels. There is no fish push on touch.
- Monitor wall on phones: the root cause was that Safari picked the WebM source and stalled on VP9. Fixed by listing MP4 first, verified in WebKit with iPhone emulation. A tap or click also unlocks playback, and WebGL context loss falls back to the plain media.
- Nav tape counter: the reels roll forward through 9→0 (and backward through 0→9) instead of spinning back through every digit.
- Fish redrawn (user request): an amber dot with a short straight tail that thins and fades linearly. The speed-line trails were removed because they read as spermatozoa.
- Fish reshaped (user request): amber water drops, fading linearly from the back of the round head to the tail tip.
- Fish calmed (user request: 'mesmerizing'): about 40% slower, gentler wander and current, rarer and weaker startles, softer flashes. 400 fish on desktop and 150 on phones, with a single-pass glow so the graphics keep up.
- Detector tape on phones: the step card was cut off on short screens. It now shows one step at a time with a progress bar, and the frame is 4:3 at most 42svh. Verified at 390×844, 375×667 and 360×740.
- Ranging illustration: the boat is now a detailed thermal workboat profile (hull shading, wheelhouse glass, flybridge, mast and radar, rail, hot exhaust, bow wave, wake, reflection) instead of a two-block silhouette.
- Ranging illustration boat simplified (user request): hull, wheelhouse with one window band, mast with radar bar, faint wake. The aft exhaust glow, rail, flybridge, antennas and reflection were removed.
- Fish glitch along a line near the bottom of phone screens: the sonar was 100svh, so it ended above the true bottom once toolbars collapsed. It is now 100lvh. Fish tails are about 20% longer (5.6 head-radii).
- Ranging illustration: the detailed boat is restored without the exhaust glow (user request). The TRK box is fitted to the vessel's outline, including pitch.
- Wide-screen fish glitch line: the zone floor and ceiling and the text-panel avoid band were on/off step forces. Fish jittered across them and each heading flip triggered a flash, giving a flickering line. These are now smooth ramps, and flashes use a smoothed turn rate.
- Ranging illustration boat: no deck rail, brighter (near white-hot), now 18 m × 6.5 m, on a darker sea, for visibility.
- Monitor wall: a random clip per monitor at start, no looping. Each ended clip changes channel to the next in the playlist, with static, a glitch and an updated CH label.
- Resize flicker on the Detector tape (and every screen): redraw inside the resize callback, so the cleared canvas never paints.
- Detector steps on phones: all four are back, highlighted as you scroll (user request). The inactive ones are one dimmed line. Verified on iPhone SE, iPhone 14 and Pixel 7 in WebKit.
- Brave iOS toolbar resizes: canvas rebuilds are debounced (200 ms) and CSS stretches in between. This applies to screens, the hero name and the fish canvas.
- Detector card content replaced (user request: not uniform). It now holds the EDGE Group spec figures in two even columns plus the autonomy-suite capsules, lit progressively as you scroll. The credit adds 'Data: EDGE Group.' On phones the figures are stacked, the readouts pinned to the frame top, and a compact variant applies under 640px height. Verified on iPhone SE, iPhone 14 and Pixel 7 (WebKit) and on desktop.
- Detector card: the data now appears item by item as you scroll (hidden until reached, space reserved) instead of dim-to-lit. The footage credit is hidden below 960px (user request).
- Detector card: hidden at the start of the tape. It appears with its title, then adds the figures and the suite one by one as you scroll (user request).
- Brave iOS rollback root cause: the window height shrinks and grows as the search bar moves, and page heights (tape 340vh, hero, Contact, sonar spacer) tracked it, so the page length changed under the finger. All of them now use a frozen --vh (updated only on width change for touch). The Detector frame is a fixed 16:9 on phones, and the vessel card may be partly hidden while the bar is expanded (user request).
- Top-anchored layout (user direction): what a shorter window hides at the bottom shows up as the reader scrolls. The fish sonar uses --vh-full (max of window and screen height on touch), so the bar never resizes it. Cleanup: removed the dead About counters (countUp, [data-count]), .screen--square and a stale .tape__steps selector; added one debounce helper for the vh, hero-name and fish-canvas resizes.
- Monitor clips re-cut without the seamless-loop crossfade (it showed as a fade just before each channel change). Fish raised to 640 on desktop and 240 on phones (6 and 4 banks).
