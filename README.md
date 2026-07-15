# DxHome

A minimal new tab page for Chrome and Firefox. A clock, a search bar that does
more than search, your shortcuts, tasks and reading list — over a wallpaper you
choose.

No account. No ads. No paywall. No analytics.

[Chrome Web Store](https://chromewebstore.google.com/detail/dxhome/gecffmhnbgcpikfhofgpcbddhhfnoffd)

## Features

- **Command bar** — search the web, or go straight to a domain. Type `2+3*4` to
  calculate and press Enter to copy. `!gh react`, `!npm zod`, `!mdn fetch` to
  search GitHub, npm or MDN. `:3000` or `localhost:5173` to open a dev server. A
  hint under the bar says what Enter will do.
- **Dev servers** — optionally lists the HTTP servers running on your machine,
  named after each app. Databases never appear; only things that speak HTTP can.
- **Bookmarks** — your top sites as shortcuts, plus your own.
- **Tasks** — todo list with deadlines and a calendar view. Right-click any text
  or link to capture one.
- **Reading list** — save from the sidepanel or the right-click menu, mark as
  read, filter.
- **Recent tabs** — recently closed tabs, so you never lose one.
- **Backgrounds** — presets, or right-click any image on the web.
- **Clock** — click for a full-screen focus view.

## Development

Requires [Bun](https://bun.sh).

```bash
bun install
bun dev              # chrome, with hot reload
bun dev:firefox
```

`bun dev` serves the extension on port 3000 and loads it into a fresh browser
profile.

```bash
bun test             # unit tests
bun run compile      # typecheck
bunx biome check src # lint + format
bun run build        # production build -> .output/chrome-mv3
bun run zip          # store-ready zip
```

CI runs all of the above on every push, for both Chrome and Firefox.

## Architecture

Organised by feature, not by file type. Each feature owns its components,
hooks, storage and types, and exposes them through an `index.ts`.

```
src/
  entrypoints/     newtab, sidepanel, background worker
  features/        backgrounds, bookmarks, clock, dev-servers,
                   reading-list, recent-tabs, search, settings, tasks
  shared/          ui (shadcn), lib, hooks, storage, components
```

### Storage

Everything persistent goes through `shared/storage`, never `chrome.storage`
directly:

```ts
const item = defineStorageItem<T>(area, key, fallback, { serialize, deserialize })
const { value, setValue, loaded } = useStorageItem(item)
```

Four areas, chosen per item and not interchangeable:

| Area | Lifetime | Used for |
| --- | --- | --- |
| `local` | this profile | settings, background choice, panel layout |
| `sync` | follows the user across devices, **8KB per item** | tasks |
| `session` | until the service worker dies | open-tab cache |
| Dexie | this profile, unbounded | bookmarks, reading list, recent tabs |

The service worker is torn down after ~30s idle, so nothing may be kept in a
module-scoped variable and expected to survive.

### Permissions

`topSites`, `tabs`, `storage`, `sidePanel`, `contextMenus`, `search` are
required. Localhost access for dev server discovery is an **optional** host
permission, requested from a user gesture — keeping it out of the install
prompt for everyone who never runs a dev server.

### Design

Glass over the wallpaper. The tint is dark rather than light on purpose: the
wallpaper is user-chosen, and a white tint disappears against a bright photo and
takes the white text with it. Depth is tint + blur + a 1px inset specular edge.
Text sitting directly on the wallpaper carries `on-wallpaper` for its own
shadow — the scrim alone cannot rescue contrast without becoming a black sheet
over half the window.

## License

Not currently licensed for reuse.
