---
appName: ERScapades — Haunted Highway (Halloween Edition)
appDescription: A separate, corporate-appropriate Halloween-themed spin on ERScapades with clever puns, spooky-cute icons, animated cobwebs & floating ghosts, and a fresh mix of interactive game types for ERS members.
isPlanMode: false
---

## Overview

A standalone Halloween-themed route inside ERScapades that keeps everything AAA-appropriate but leans into the season: **Haunted Highway**. Same tracking, same missions concept, but with clever labels (Fright Shift, Boo-tique, Ghouliath), a purple/orange/black palette layered over AAA red accents, animated ambient effects (floating ghosts, drifting bats, cobweb corners, flickering jack-o'-lanterns), and a slightly remixed set of game types so it feels fresh — not just a reskin.

Everything is opt-in via a new nav item + route; the main red-white-blue ERScapades stays untouched.

## Tone rules (locked in)
- **Member**, never customer.
- Cheeky and clever, never scary/gory. Corporate-appropriate.
- Puns encouraged ("Tow or Treat", "Boo-tique", "Fright Shift", "Ghouliath", "Spirit XP").
- Halloween accents on top of AAA identity — the red still lives in "ERS".

## Tasks

### 1. Halloween theme tokens & animations
- Add a scoped `.halloween` theme wrapper in `index.css` with a purple/orange/black palette + AAA red accent.
- Add keyframe animations: `float-ghost`, `drift-bat`, `flicker`, `sway-web`, `bob`, `spin-slow`.
- Utility classes for cobweb corners, pumpkin glow, and a subtle animated starfield background.
- **Validation:** halloween palette applied only inside the Haunted Highway route; ambient animations run smoothly without layout shift.

### 2. Route & navigation
- Add `/haunted-highway` route in `App.tsx` (still inside the main Layout so the sidebar is preserved).
- Add a sidebar nav item labeled **"Haunted Highway 🎃"** with a pumpkin/ghost icon and a subtle pulse to signal "seasonal".
- **Validation:** clicking the nav item opens the Halloween page; route is separate from the standard home.

### 3. Haunted Highway landing page
- Themed hero: "🎃 Tow or Treat: Welcome to the Haunted Highway" with animated floating ghost, drifting bat, and cobweb corners.
- Spirit meter (Halloween-themed XP bar), "Fright Shift streak" (candle flame), "Boo-tique badges" preview.
- Featured mission of the day: "Ghouliath: The Member Who Wouldn't Hang Up".
- Quick-launch grid of themed missions with pun labels + game type badges.
- **Validation:** landing renders with ambient animations; all CTAs navigate to mission play.

### 4. Mix of Halloween-flavored game types
Reuse the existing 5 game engines but re-theme + add 2 fresh twists:
- 🎃 **Pumpkin Scramble** (word scramble — spooky ERS terms).
- 👻 **Ghost Tone Detector** (tone detection with member quotes, re-themed).
- 🦇 **Bat-Out-of-Heck Speed Round** (speed round with orange combo streaks).
- 🕯️ **Candle Meter** (escalation meter re-skinned — keep the candle from going out).
- 🕸️ **Cobweb Crossword** (terminology crossword with a Halloween word list).
- 🍬 **Trick-or-Treat Sort** (drag/tap sort: is this response a Treat 🍬 or a Trick 👻? — new mini variant using the multi-choice engine).
- 🎃 **Jack-o'-Lantern Match** (match member scenario → best response, uses multi-choice under the hood).
- **Validation:** at least 6 themed missions, each mapped to a real playable game type; game-type badges shown on cards.

### 5. Halloween achievements & Boo-tique
- New badge set: "Spirit of Service", "Ghoul Whisperer", "Candle Keeper", "Web Master", "Tow-or-Treat Champ", "Pumpkin Prodigy".
- Boo-tique preview panel on the landing page showing locked/unlocked Halloween badges with glow + hover wiggle.
- **Validation:** badges display with themed art (emoji + gradient), locked state clearly differentiated.

### 6. Fun details & micro-interactions
- Cursor-following ghost trail on the landing hero (subtle, opt-in feel — pauses on hover of interactive elements).
- Pun ticker at the top: rotating one-liners ("Our members deserve fang-tastic service.", "Don't ghost the call queue.", etc.).
- Toggle 🎃/🌙 (day/night) that shifts the ambient background from dusk to midnight.
- **Validation:** ticker rotates smoothly; day/night toggle changes background; ghost trail respects reduced-motion.

### 7. Polish & build
- Ensure no impact on the main ERScapades red-white-blue theme when navigating away.
- Run build, fix any type errors.
- **Validation:** `bun run build` succeeds.
