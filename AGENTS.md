# DxHome — new tab extension

Replaces `chrome://newtab` with a dashboard: clock, command bar, bookmarks,
dev servers, recent tabs, reading list, tasks. A sidepanel handles backgrounds,
the reading list, and settings.

**Stack**: React 19, TypeScript, WXT, Tailwind v4, Dexie (IndexedDB), Base UI,
Biome, Bun test. Chrome MV3 and Firefox from the same source.

---

## File tree

Organised by **feature**, not by file type. A feature owns its components,
hooks, storage and types, and exposes them via `index.ts`. Import across
features through the barrel (`@/features/tasks`), never deep paths.

```
src/
├── entrypoints/
│   ├── background.ts               # service worker: context menus, tab tracking
│   ├── newtab/
│   │   ├── app.tsx                 # resizable left/right panels
│   │   ├── components/             # left-panel, right-panel
│   │   └── right-panel-context.tsx
│   └── sidepanel/                  # app.tsx, main.tsx, index.html
├── features/
│   ├── backgrounds/                # use-background, use-seed (theme colour), PRESETS
│   ├── bookmarks/                  # use-bookmarks, schema, components/
│   ├── clock/
│   ├── dev-servers/                # probe, ports, use-dev-servers
│   ├── reading-list/
│   ├── recent-tabs/
│   ├── search/                     # lib/calc, lib/actions, components/
│   ├── settings/
│   └── tasks/                      # tasks-context, schema, components/
└── shared/
    ├── components/                 # favicon, link-card, error-boundary, section-header
    ├── hooks/                      # use-is-mobile
    ├── lib/                        # utils: cn, url guards, cssUrl
    ├── storage/                    # db (Dexie), item, use-storage-item
    └── ui/                         # design-system primitives on Base UI
```

---

## Storage — read this before touching persistence

**Never call `chrome.storage` directly.** Everything goes through
`shared/storage`. There are no exceptions in the codebase; keep it that way.

```ts
const item = defineStorageItem<T, Raw>(area, key, fallback, { serialize, deserialize })
const { value, setValue, loaded } = useStorageItem(item)   // in React
await item.get() / item.set(v) / item.watch(cb)            // anywhere else
```

`chrome.storage` JSON-encodes, so **Dates do not survive** — that is what
`serialize`/`deserialize` are for (see `features/tasks/tasks-context.tsx`).

| Area | Lifetime | Holds |
| --- | --- | --- |
| `local` | this profile | `dx-newtab-settings`, `dx-background`, `dx-background-custom`, `dx-main-layout`, `dx-right-panel-section` |
| `sync` | across devices, **8KB per item** | `dx-tasks` |
| `session` | until the worker dies | `dx-open-tabs` |
| Dexie | this profile, unbounded | `bookmarks`, `recenttabs`, `readinglist` |

Dexie schema is at v5. Versions 1–4 keep their `tasks` declaration so existing
installs migrate through them; v5 drops it. **Never edit an existing version** —
add a new one. `db.test.ts` exercises the upgrade against a populated v4.

---

## Permissions

Required: `topSites`, `tabs`, `storage`, `sidePanel`, `contextMenus`, `search`.

Localhost (`http://localhost/*`, `http://127.0.0.1/*`) is an **optional** host
permission for dev server discovery, requested from a user gesture in settings.
Keep it optional: as a required permission it adds a host warning to the install
prompt for every user, and permission warnings are the biggest install blocker
in this category.

---

## Gotchas that have actually bitten

1. **The service worker dies after ~30s idle.** Nothing may live in a
   module-scoped variable and be expected to survive — that is why the open-tab
   cache is in `storage.session`.
2. **MV3 CSP is `script-src 'self'`.** `eval` and `new Function` do not work.
   The calculator is a hand-written parser for this reason.
3. **Base UI parts compose with `render`, not `asChild`.** The rendered
   element must accept a ref and spread the props it is given.
4. **Calendar dates must use local getters**, never `toISOString()` — it returns
   UTC and shifts the day.
5. **Tabs, not spaces**, everywhere. Biome enforces it.
6. **Chrome injects a stylesheet into extension pages** that sets `body`'s
   font to the system font. It is unlayered, so a font rule inside
   `@layer base` always loses. Keep the `body` rule in `tailwind.css`
   unlayered.
7. **`react-day-picker` v10 renamed `table` → `month_grid`.** An unknown key in
   `classNames` fails silently — the styles just never apply.
8. **Match patterns ignore ports**, so `http://localhost/*` covers every port.

---

## Design system

Own system after Material 3 Expressive, kept minimal. Rules and tokens are in
**`docs/DESIGN.md`** — read it before touching UI. In short: solid tonal
surfaces coloured from the wallpaper (`use-seed.ts`), no outlines, press =
squash, one easing curve, few words.

Verify by rendering over a **bright** preset (`tulips`) and a dark one
(`peaks`): the theme hue changes with each, and text on bare wallpaper must
stay readable on both.

---

## Commands

```bash
bun dev                 # chrome + HMR (serves on :3000)
bun dev:firefox
bun test                # unit tests
bun run compile         # tsc --noEmit
bunx biome check src    # lint + format
bun run build           # → .output/chrome-mv3
bun run build:firefox
bun run zip             # store package
```

CI runs biome, compile, test, and both builds on every push.
