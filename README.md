# Solo Scrum

<p align="center">
  <img src="resources/logo.png" alt="Solo Scrum" width="160" />
</p>

A local Scrum board for one developer. No accounts, no cloud, no sprint theater — just projects, stories, and a board that stays on your machine.

Solo Scrum is a desktop app for people who like the shape of Scrum (stories, points, a board) but work alone. Create projects, write stories with acceptance notes, drag them across four columns, and export a PDF when you want a snapshot.

## Features

- **Four-column board** — New, On Progress, Tested, Done
- **Projects** — group stories under named workstreams (`PRJ-1`, `PRJ-2`, …)
- **User stories** — sequential IDs (`US-1`, `US-2`, …), title, description, priority, and Fibonacci points
- **Drag and drop** — move and reorder cards between columns
- **Local persistence** — the board is saved as JSON in the app’s user-data folder
- **PDF export** — landscape board report with column overview, project list, and story details
- **Private by default** — no network, no sign-in, no telemetry

### Story fields

| Field | Options |
| --- | --- |
| Priority | Low, medium, high |
| Points | 1, 2, 3, 5, 8, 13, or none |
| Column | New · On Progress · Tested · Done |
| Project | Required — create one first, or add it while writing the story |

Deleting a project unassigns its stories. The cards stay on the board.

## Getting started

Requires Node.js 22+ and npm.

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Electron app with hot reload |
| `npm run build` | Compile into `out/` (JS bundles, not an installer) |
| `npm run preview` | Run the compiled `out/` build locally |
| `npm run dist` | Package a desktop app into `dist/` for this machine |
| `npm run dist:mac` | macOS `.app` + `.dmg` |
| `npm run dist:win` | Windows installer |
| `npm run dist:linux` | Linux AppImage |

On first launch the board is empty. Create a project, then add a story.

## Packaged app

`npm run build` only compiles source. To get a double-clickable app:

```bash
npm run dist
```

Find it in `dist/`:

- **macOS** — `dist/mac-arm64/Solo Scrum.app` (or `dist/mac/`) and `dist/Solo Scrum-1.0.0-<arch>.dmg`
- **Windows** — `dist/Solo Scrum-1.0.0-setup.exe`
- **Linux** — `dist/Solo Scrum-1.0.0-<arch>.AppImage`

The first macOS open of an unsigned build may need **Right-click → Open** in Finder.

## How the board works

1. **New project** — name a workstream (Website, Notes, PersonalDevOps…).
2. **New story** — title is required; description can hold acceptance criteria or nothing at all.
3. **Move work** — drag a card, or use the card menu to jump to a column.
4. **Export PDF** — saves a dated report (`Solo-Scrum-Board-YYYY-MM-DD.pdf`) and reveals it in Finder / Explorer.

Columns are meant for a solo flow, not a team ceremony:

| Column | Hint |
| --- | --- |
| New | Backlog |
| On Progress | Active work |
| Tested | Verified |
| Done | Shipped |

## Where data lives

The board is written to `solo-scrum.json` inside Electron’s user-data directory. Typical locations:

- **macOS** — `~/Library/Application Support/Solo Scrum/solo-scrum.json` (dev: `solo-scrum`)
- **Windows** — `%APPDATA%\Solo Scrum\solo-scrum.json`
- **Linux** — `~/.config/Solo Scrum/solo-scrum.json`

That file is the whole workspace. Back it up if the board matters.

## Stack

Electron, React 19, TypeScript, Vite (`electron-vite`), Zustand, and `@dnd-kit`. The main process is sandboxed; the renderer talks to disk only through a preload bridge.

## License

MIT
