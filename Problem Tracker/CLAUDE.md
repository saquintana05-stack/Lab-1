# Problem Tracker

## Project Overview

Problem Tracker is a simple, single-page app for logging problems noticed throughout the day. Each problem has a title, an optional description, a frequency rating (daily, weekly, monthly or rarely), a status (open, in progress or solved), and the timestamp it was captured. Problems are shown in a list, newest first, and can be filtered by title and status. All data stays in the user's browser.

`index.full-backup.html` is an older, feature-rich version kept for reference. It is not the active app. It shares the same storage key and data shape, so data saved by either version can be read by the other.

## Tech Stack

- **HTML5 + CSS3**: markup and styles live inline in `index.html`
- **Vanilla JavaScript (ES2015+)**: no libraries, all logic in one inline `<script>`
- **Browser `localStorage`**: persistence, under the key `problemTracker.data.v1`
- **Runtime**: any modern browser. Open `index.html` directly; no server needed

## Development Notes

- No frameworks and no build step: everything stays in index.html.
- Never store data on a server; localStorage only.
- Saved data uses the shape `{ version, savedAt, problems }`. Timestamps (`createdAt`, `savedAt`) are millisecond numbers, not ISO strings.
- Records pass through `normalize()` on load. Update it whenever you add a field to a problem, and keep the `...p` spread so fields used only by the backup version (status, tags, etc.) are not stripped on save.
- State changes go through `commit()`, which saves and then re-renders. Display-only refreshes (like the once-a-minute "x min ago" update) may call `render()` directly.
- Keep `localStorage` reads and writes in `try/catch`. Storage can be full, disabled, or unavailable in private browsing.
- Build list content with `textContent` / `createElement`, never `innerHTML` with user input.
- Colors are CSS custom properties on `:root`, with dark-mode overrides under `@media (prefers-color-scheme: dark)`. Add new colors to both.
- Frequency options are defined once in the `FREQUENCIES` object; the form `<select>`, validation, and badge labels all depend on it.
- Status labels are defined once in `STATUSES`. Its stored keys (`open`, `in-progress`, `resolved`) match the backup version's; `resolved` is labeled "Solved". Backup-only values (`blocked`, `closed`) are kept in storage and grouped for display via `STATUS_GROUP` / `statusGroup()`. Don't rename the keys, or the backup will reset them to `open`.
- Search text and the status filter are view state: they call `render()`, are never saved, and combine with AND.
