# DxHome — new tab extension

Replaces `chrome://newtab` with a dashboard: clock, command bar, bookmarks,
dev servers, recent tabs, reading list, tasks. A sidepanel handles backgrounds,
the reading list, and settings.

**Stack**: React 19, TypeScript, WXT, Tailwind v4, Dexie (IndexedDB), shadcn/ui,
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
│   ├── backgrounds/                # use-background, background-grid, PRESETS
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
    └── ui/                         # shadcn — biome ignores this dir
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
3. **`.dark .x` outranks a plain `@utility`.** shadcn ships `dark:bg-input/30`
   on Input, which silently beat `.glass`. Check specificity before assuming a
   utility applies.
4. **Calendar dates must use local getters**, never `toISOString()` — it returns
   UTC and shifts the day.
5. **Tabs, not spaces**, everywhere. Biome enforces it.
6. **shadcn components are vendored** and `src/shared/ui` is biome-ignored.
   Editing them is normal; regenerating via `bun comp` will overwrite.
7. **`react-day-picker` v10 renamed `table` → `month_grid`.** An unknown key in
   `classNames` fails silently — the styles just never apply.
8. **Match patterns ignore ports**, so `http://localhost/*` covers every port.

---

## Design system

Glass over a user-chosen wallpaper, defined in `assets/tailwind.css`.

- `.glass` / `.glass-raised` / `.glass-overlay` — tiers 2, 3, 4.
- `.on-wallpaper` — text shadow for text with no panel under it.
- `.content-scrim` — weights the reading column.

The tint is **dark in both themes on purpose**: the wallpaper can be a
blown-out photo, and a light tint disappears against it and takes white text
with it. Depth = tint + blur (saturated back up) + a 1px inset specular edge.

Legibility is carried by the elements, not the scrim. A scrim strong enough to
rescue white text over a sunlit photo is a black sheet over half the window,
which defeats a wallpaper-first design. Verify contrast by rendering over a
**bright** preset (`tulips`), not a dark one.

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
