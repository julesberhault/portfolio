# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS, hand-built, no build step, served by GitHub Pages from this repository. This replaces the current setup where GitHub Pages renders `README.md` through `jekyll-theme-minimal` (`_config.yml`). `README.md` stays a plain-Markdown CV that reads well on GitHub. Before the switch, decide how the site will stop Jekyll from also processing the repo (for example with a `.nojekyll` file or by removing the theme config).

## Users

- **Hiring managers and recruiters** at maritime-autonomy, defense, and robotics companies who are assessing Jules for senior or lead engineering roles. A good visit ends with them contacting him.
- **Technical peers and partners**: shipbuilders, naval architects, integrators, and researchers who want to see which vessels and systems he has built, which sensors and stacks he has integrated, and how far each platform went toward autonomy.
- **General professional audience**: anyone who follows a shared link from email, LinkedIn, or GitHub. They need a credible, current overview they can take in quickly.

## Product Purpose

The site is the personal portfolio and CV of Jules Berhault, Marine Robotics Engineer. It presents his work on autonomous surface and underwater vehicles (perception, control, sensor fusion, multi-robot coordination) and makes it easy to reach him. It succeeds when a qualified visitor understands the scale and seniority of the work within a short visit and gets in touch.

## Positioning

Jules builds real vessels, not just software or simulations. He has taken a 9 m outboard USV up to a 17 m, 1,800 hp waterjet USV, moving it from remote operation to single-operator autonomous supervision. He has followed a 17 m container-transport catamaran USV from concept design through construction (first delivery scheduled for 2027), adapted a GraalTech X-300 AUV for subsea perception, and built an award-winning multi-robot HMI for the French Army's CoHoMa challenge. His work runs across the full lifecycle (concept design → technical design → procurement → fabrication and test) and across surface, subsea, and terrestrial domains.

## Operating Context

- Visitors usually arrive from a link in an application, an email signature, LinkedIn, or GitHub, on desktop or phone.
- Recruiters skim for role, employer, years, and scope. Technical visitors want to see platforms, sensors (GNSS, INS, LiDAR, radar, EO/IR, FLS), stacks (ROS 2, C++, Python), and standards (COLREGs).
- The same content also has to work as a GitHub-rendered `README.md`.

## Capabilities and Constraints

- Content sections: intro, education, work experience, projects (grouped by employer), skills, languages, certifications, publications and presentations.
- Contact channels: email, LinkedIn, GitHub. There is no contact form or backend.
- Hosting is static only (GitHub Pages).
- Undecided: whether a downloadable PDF CV should be offered.

## Brand Commitments

- Name and title: **Jules Berhault — Marine Robotics Engineer**.
- Contact details as already published in `README.md`: julesberhault@gmail.com, LinkedIn `jules-berhault-726a6a166`, GitHub `julesberhault`.
- Voice: factual, first-hand, and engineering-specific (sizes, power, sensors, standards), as in the current README.

## Evidence on Hand

- **CV content:** `README.md` is the source of truth for every claim.
- **Photos** (`docs/`, `.jpg` and `.webp` versions; captions in `docs/INFO.md`):
  - `detector`: promotional photo of the 170 M-DETECTOR (ADSB with TII and Exail). This is a promotional image, not Jules's own photo.
  - `deploying_x301`, `operating_x301`: X301 AUV in the TII test pool, and Jules operating it remotely.
  - `ground_control_station`: Jules at the Oceaneering facility in Stavanger. It is not related to the container-transport USV. It sits in that project in `README.md` only as a placeholder until a matching image exists.
  - `cohoma_challenge`: Jules and colleagues in an armored vehicle during CoHoMa 2022.
  - `abu_al_abyad`: Jules and colleagues on the first remote-piloted USV (currently unused).
  - `headshot-circle`, `headshot-square`: headshots.
- `assets/img/subsea.(png|webp)`: a seabed photo taken from a camera on the belly of an AUV. Dense, colorful coral and small fish fill a deep-blue scene, with the AUV's hull visible along the top and the seabed taking up about two-thirds of the frame. Jules wants it as the page's first impression.
- **Videos** (`assets/vid/`, 8 clips in `.mp4` and `.webm`): **stock footage, for ambience only.** They must never be presented or captioned as Jules's own work or as any specific project.
- **Awards:** CoHoMa 2022, Human-Machine Interface award and Combative Spirit award.
- **Publication:** M.S. thesis, "Development and Optimization of a Target Detection and Tracking System at Sea" (2021).
- **Platforms (confirmed by Jules, 2026-10-06):**
  - USVs: 9 m outboard, taken from remote operation to autonomy; 17 m dual waterjet, taken from remote operation to autonomy, plus obstacle avoidance; 17 m catamaran, from concept to integration with a French naval architect and a shipbuilder in China, fully autonomous, COLREGs-compliant and long-range offshore.
  - AUV: 4 m, teleoperated offshore for data acquisition.
  - UGV platforms at ENSTA Paris.
  - DriX H-8 at Exail's robotics division (single-camera detection and tracking).
- **M.S. report (2021, in French):** https://webperso.ensta.fr/jaulin/rapport_pfe_jules_berhault.pdf. It covers horizon-referenced IR ranging for the MDT system, the error study, heave compensation, the coastline-as-horizon correction, coast-distance ray tracing sped up from 70 ms to 0.012 ms, and a MAVROS/ArduPilot interface.
- **Not available, so never invent:** testimonials, endorsements, client logos, metrics beyond those in the README, or extra publications.

## Product Principles

1. **Real hardware first.** Lead with vessels, scale, and fielded systems, because that is what sets this profile apart from a software-only robotics CV.
2. **Proof over adjectives.** Every claim should trace back to a concrete platform, sensor, date, or award in the README.
3. **Honest media.** Photos are shown with accurate captions. Stock footage is only atmosphere and never shown as evidence.
4. **One source of truth.** The README and the site say the same things, and content changes start in the README.
5. **Fast to contact.** Contact links are always within easy reach.

## Accessibility & Inclusion

No product-specific requirement has been set. Defaults to apply: WCAG 2.1 AA, meaningful alt text on project photos, and `prefers-reduced-motion` respected for any ambient video.
