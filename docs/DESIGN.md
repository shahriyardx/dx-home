# Design system

Our own system after Material 3 Expressive, kept minimal: solid tonal
shapes over the wallpaper, bold tight type, no lines, motion only where
something is touched. It lives in two places:

- **Tokens** — `src/assets/tailwind.css`. The only place a colour, radius or
  curve is defined.
- **Primitives** — `src/shared/ui/*`, built on Base UI (`@base-ui/react`).
  Change a look here, not at call sites.

## Colour comes from the wallpaper

`features/backgrounds/use-seed.ts` sets two numbers on `<html>`:
`--seed-h` (the wallpaper's dominant OKLCH hue) and `--seed-c` (how
colourful it is, 0–1). Every token holds a fixed lightness and takes its hue
from the seed, so contrast never changes whatever the wallpaper.

Presets carry a precomputed `seed` (from `seedFromPixels`, see
`seed.ts`). Custom images are sampled at runtime; a cross-origin image falls
back to the default.

Always dark: surfaces are solid, so text on them never depends on the photo.

## Tokens

| Token | Use |
| --- | --- |
| `bg-surface` (`-hover`) | panels, cards, tiles on the wallpaper |
| `bg-field` (`-hover`) | inputs, neutral buttons, rows inside a surface |
| `bg-overlay` + `elevated` | dialogs, menus, popovers |
| `text-fg` / `text-muted` | primary / secondary text |
| `bg-primary` `text-on-primary` | the main action. One per screen |
| `bg-tonal` `text-on-tonal` | selected states, secondary actions |
| `danger`, `danger-container` | destructive |
| `rounded-field` 0.875rem | inputs, menu items |
| `rounded-menu` 1.25rem | menus, popovers |
| `rounded-surface` 1.75rem | big surfaces, the search bar |
| `rounded-sheet` 2rem | dialogs, the tasks panel |
| `rounded-press` 0.625rem | the shape a pressable squashes to |
| `ease-expressive` | the only curve, and the default |

## Rules

- **Three tones, no outlines.** Separate by tone and spacing. Overlays get the
  one ring (`elevated`).
- **Press = squash.** Anything clickable gets `pressable`: scale 0.97 and
  tighten to `rounded-press` while held.
- **Finite radii on anything that animates.** `rounded-full` can't
  interpolate; pills use half their height.
- **No overshoot.** On a radius it flashes a sharp corner.
- **Type.** Roboto Flex. Titles bold and tight; labels semibold.
- **Text on bare wallpaper** gets `on-wallpaper` and stays white/70 or more.
- **Few words.** Sentence case. A self-explanatory label gets no description.
- **Motion on touch, not on a loop.** The page-load `rise` is the one
  exception, and it plays once.
