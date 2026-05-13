# DxHome — Chrome Extension New Tab Page

## Overview

Minimal new tab page Chrome extension with sidepanel. Replaces `chrome://newtab` with customizable dashboard: clock, search bar, bookmarks, recent tabs, reading list, tasks. Sidepanel provides background picker, reading list management, settings.

**Stack**: React 19, TypeScript, WXT framework, Tailwind CSS v4, Dexie (IndexedDB), shadcn/ui, Biome (linter/formatter).

---

## File Tree

```
src/
├── components/
│   ├── bookmark/
│   │   ├── bookmark-dialog.tsx
│   │   ├── bookmark-form.tsx
│   │   ├── bookmarks.tsx
│   │   ├── index.tsx
│   │   └── single-bookmark.tsx
│   ├── reading-list/
│   │   └── newtab-reading-list.tsx
│   ├── recent-tabs/
│   │   ├── recent-tabs.tsx
│   │   ├── single-tab.tsx
│   │   └── tabs-dialog.tsx        # dead code, unused
│   ├── tasks/
│   │   ├── index.ts
│   │   ├── single-task.tsx
│   │   ├── task-form.tsx
│   │   └── Tasks.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── calendar.tsx           # react-day-picker wrapper
│   │   ├── card.tsx
│   │   ├── context-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── field.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   └── textarea.tsx
│   ├── clock.tsx
│   ├── favicon.tsx
│   ├── link-card.tsx              # shared card (recent tabs + reading list)
│   └── search.tsx
├── entrypoints/
│   ├── background.ts              # service worker
│   ├── newtab/
│   │   ├── app.tsx                # main newtab layout
│   │   ├── index.html
│   │   └── main.tsx
│   └── sidepanel/
│       ├── App.tsx
│       ├── main.tsx
│       ├── ReadingList.tsx
│       └── Settings.tsx
├── hooks/
│   ├── useBackground.ts
│   ├── useBookmarks.ts
│   ├── useNewtabSettings.ts
│   ├── useReadingList.ts
│   ├── useRecentTabs.ts
│   ├── useSettings.ts
│   └── useTasks.ts
├── lib/
│   ├── db.ts                      # Dexie schema
│   └── utils.ts                   # cn()
```

---

## Layout (newtab)

CSS grid split: `lg:grid-cols-[6fr_4fr]`.

**Left panel** (scrollable, `h-screen overflow-y-auto`):
- Clock (optional)
- Search bar (optional) — `chrome.search.query()` via `"search"` permission
- Bookmarks grid (optional) — seeded from `chrome.topSites`, stored in Dexie
- Recent Tabs & Reading List — tabbed UI when both enabled, standalone otherwise

**Right panel** (sidebar, hidden on mobile, `max-lg:hidden`):
- Tasks — list view or calendar view with toggle

---

## Background Service (`entrypoints/background.ts`)

- `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`
- 4 context menus: Save to Reading List, Set Image as Background, Add to Tasks, Bookmark This Page
- Tracks open tabs in memory (`openTabs` Record), saves to `db.recenttabs` on tab close

---

## Data Storage

### Dexie (IndexedDB) — `lib/db.ts`

| Table | Schema | Purpose |
|---|---|---|
| `bookmarks` | `++id, label, url` | Seeded from topSites + manual adds |
| `tasks` | `++id, title, done, deadline, createdAt` | Legacy table, most tasks use chrome.storage.sync |
| `recenttabs` | `++id, title, url, icon` | Auto-tracked closed tabs |
| `readinglist` | `++id, url, read, savedAt` | Saved pages from context menu |

DB versions 1→2→3→4 with incremental schema migration.

### chrome.storage.sync — `useTasks.ts`

- Key: `"dx-tasks"`
- Cross-device sync. Date round-trip via ISO string.
- Fields: `id (cuid2)`, `title`, `description?`, `done`, `deadline?`, `createdAt`

### chrome.storage.local

- Key `"dx-newtab-settings"` — visibility toggles for each section
- Key `"dx-background-custom"` — custom background image URL

### Chrome Permissions (`wxt.config.ts`)

`topSites`, `tabs`, `storage`, `sidePanel`, `contextMenus`, `search`

---

## Key Components

### LinkCard (`components/link-card.tsx`)

Shared card for Recent Tabs and Reading List items.

Props: `icon: ReactNode`, `title`, `url`, `description?`, `read?`

- Grid: `grid-cols-[1.25rem_auto]` (icon + text)
- Built-in URL formatting (`hostname/...` when path/search/hash exist)
- Read state: line-through title + dimmed
- Hover: `backdrop-blur-2xl border-primary`

### Tasks (`components/tasks/Tasks.tsx`)

Dual-view via `view` state (`"tasks"` | `"calendar"`):
- **List view**: ScrollArea with `SingleTask` cards
- **Calendar view**: `react-day-picker` Calendar + dot indicators on deadline dates
  - Select date → tasks with deadline on that date below calendar
  - Timezone-safe: uses `getFullYear()`/`getMonth()`/`getDate()` not `toISOString()`
  - Task cards: left border, darker bg, title + formatted deadline ("May 12, 2025, 11:00 AM")

### NewtabReadingList (`components/reading-list/newtab-reading-list.tsx`)

- PAGE_SIZE=10, paginator in header
- `tabbed` prop: hides title/icon for tabbed mode
- flex-wrap layout

### RecentTabs (`components/recent-tabs/recent-tabs.tsx`)

- MAX_TABS=10
- Each tab: `LinkCard` wrapped in ContextMenu (Delete action)
- `tabbed` prop: hides header for tabbed mode

---

## State Management

| Hook | Storage | Reactivity |
|---|---|---|
| `useNewtabSettings` | `chrome.storage.local` | `onChanged` listener |
| `useTasks` | `chrome.storage.sync` | `onChanged` listener |
| `useBookmarks` | Dexie | `useLiveQuery` |
| `useReadingList` | Dexie | `useLiveQuery` |
| `useRecentTabs` | Dexie | `useLiveQuery` |
| `useBackground` | `chrome.storage.local` | Direct read/write |
| `useSettings` | `chrome.storage.local` | Direct read/write |

---

## Styling

- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- `tw-animate-css` for animations
- `cn()` from `lib/utils.ts` (clsx + tailwind-merge)
- Fonts: `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`
- Semantic tokens: `bg-background`, `text-foreground`, `bg-secondary`, `text-muted-foreground`, `border`, etc.

---

## Key Gotchas

1. **Biome linter auto-formats on save** — renames files to lowercase (e.g., `App.tsx` → `app.tsx`), reformats JSX, re-indents. Always read file before editing.
2. **Tab indentation** — ALL files use tabs, never spaces. Python heredocs and Edit tool must use `\t`.
3. **Calendar timezone** — always use local date methods for date keys. `toISOString()` returns UTC and shifts dates.
4. **chrome.storage.sync quota** — ~100KB total. Tasks use sync for cross-device. Dexie for everything else.
5. **Sidepanel PascalCase** — sidepanel files use PascalCase (`App.tsx`), newtab uses lowercase (`app.tsx`). Biome only enforces on some dirs.
6. **`tabs-dialog.tsx` is dead code** — not imported anywhere, safe to remove.

---

## CLI Commands

```bash
bun run dev             # WXT dev server + HMR
bun run build           # Production build → .output/
bun run dev:firefox     # Firefox dev
bun run zip             # Chrome Web Store package
bun run compile         # TypeScript type check
bun run optimize        # Optimize background images (scripts/optimize-images.ts)
```
