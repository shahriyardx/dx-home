# Changelog

## 0.4.0 — 2026-11-26

A full redesign since 0.0.6.

### New

- **Weather** on the date line. The city is found automatically from your
  connection, or typed in settings. Celsius or Fahrenheit. Checked once a day.
- **Tasks panel**: add a task from a one-line field that opens in place, with
  a note, a date, and a clock-face time picker. Tasks are grouped into
  Overdue, Today and Later, with a checkbox, a short time tag, and a folding
  Done list.
- **Calendar**: a month view where busier days stand out, the next 7 days
  below, and tap a day to see only its tasks.
- **Command bar**: the search bar also calculates, opens addresses, and runs
  actions.
- **Dev servers**: finds apps running on localhost (optional; asks for access
  first).
- **Side panel** for wallpapers, the reading list, and settings.
- **Reading list**: save any page from the right-click menu.
- **Right-click menu**: save to reading list, add to tasks, bookmark a page,
  set an image as the wallpaper.
- **24-hour clock** option.

### Changed

- New look throughout, after Material 3 Expressive: solid tonal surfaces
  coloured from the wallpaper, and smooth motion.
- Clock: two-digit hours, a drawn colon, and a full-size dimmed AM/PM.
- Recent tabs and the reading list share one tabbed section.
- Text stays readable over bright wallpapers.
- Bookmark icons now load from Chrome's own saved icons: instant, and no
  download each time.

### Fixed

- The right panel keeps its width when the window is resized.
- Saved tabs and tasks no longer get lost or corrupted.
- Unsafe link types are blocked.

### Permissions

- New: `favicon` (Chrome only, shows no install warning) — reads site icons
  from the browser's own store.
- Localhost access stays optional and is only requested when you turn on dev
  servers.
