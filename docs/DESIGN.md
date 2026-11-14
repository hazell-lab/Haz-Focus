# HazFocus design notes

How the interface was audited and redesigned, and why it looks the way it does.

## 1. Audit of the original design

**Kept**
- the information architecture: Dashboard, All tasks, Today, Upcoming, Completed, Focus, Settings
- the kanban board with drag and drop, the status dropdown on each card, filters, sorting and search
- the task model (title, notes, category, priority, due date, status) and every `localStorage` key
- keyboard shortcuts, toasts, empty states, the confirmation modal

**Improved**
- typography: one sans family with a clear size and weight scale instead of mixed display fonts
- the dashboard: it showed a few counters and a "needs attention" list, which made it look like a stats page instead of a personal workspace
- the phone layout: a bottom tab bar, swipeable board lanes, bottom-sheet dialogs, and a fix for a horizontal overflow caused by the hidden chart table
- dark mode: tuned as its own palette rather than a copy of the light one

**Redesigned**
- the whole colour system and component shapes (see section 2)
- the dashboard became a workspace: agenda, areas, the last 7 days, and a progress summary
- Upcoming and Today became a schedule grouped by day

## 2. Product identity: a calm slate and teal tool

HazFocus should feel like a quiet tool you leave open all day, not a showcase page.

| | Light | Dark |
|---|---|---|
| Background | `#f8fafc` slate | `#0b1220` deep navy |
| Surface | `#ffffff` | `#111a2b` |
| Text | `#0f172a` / `#334155` / `#5b6779` | `#e2e8f0` / `#b4c0d0` / `#94a3b8` |
| Accent (one only) | `#0f766e` teal | `#2dd4bf` teal |
| Break timer | `#2563eb` | `#93c5fd` |
| Status (overdue, high priority) | `#c62828` | `#f87171` |
| Chart bars | `#0d9488` | `#2dd4bf` |

- **Type:** Inter for everything. Hierarchy comes from size and weight, not from a second font.
- **Shape:** soft 10 to 16px corners, pill chips and counts, tinted board lanes, white panel cards.
- **Colour discipline:** teal is the only accent. Red appears only for overdue and high-priority items, so it always means something.
- **Contrast:** every text pair meets WCAG AA in both themes, and the chart bars are above 3:1 against their card.
- **Motion:** short, functional transitions, turned off under `prefers-reduced-motion`.

All tokens are custom properties at the top of `css/style.css`. The dark theme overrides them under `[data-theme="dark"]`.

## 3. Independence from my other projects

All three projects had drifted into one look: warm off-white or brown-black backgrounds, a serif display with italics, mono labels and a red or orange accent. An earlier HazFocus redesign shared that editorial style. They have since been split so each one reads as its own product:

| | Portfolio | HazStore | HazFocus |
|---|---|---|---|
| Role | an editorial page to read | a shop to browse | a tool to use every day |
| Palette | cool paper white `#f6f7f9`, blue-black ink | black and white | cool slate, deep navy in dark mode |
| Accent | ultramarine `#2a3fd9` | signal yellow | teal `#0f766e` / `#2dd4bf` |
| Type | Instrument Serif display, Schibsted Grotesk, JetBrains Mono | bold commercial grotesk | Inter only |
| Shapes | 12-column grid, hairline rules, no cards | product grid | soft cards, tinted lanes, pill chips |

The portfolio column comes from the live portfolio code (`css/style.css` and its `DESIGN.md`, November 2026). The HazStore column comes from the portfolio's design notes; I didn't inspect HazStore itself for this document.

## 4. Workspace features (all from real data)

No numbers are invented. Every view is built only from the user's own tasks and focus sessions.

- **Agenda:** overdue, today and the next dated tasks, grouped by day (up to 8)
- **Areas:** each category's done/total with a progress bar; clicking one opens that category with a summary strip
- **Last 7 days:** tasks completed per day (from each task's `completedAt`) and focus minutes; hover or focus a bar for details; a hidden table backs it for screen readers
- **Schedule:** when sorted by due date, task lists are grouped under day headings
- **Focus timer:** Pomodoro cycle, a "working on" task, today's focus time and a distraction-free mode

Older tasks saved without a completion date aren't counted in the chart, because there's no way to know when they were finished.

## 5. Accessibility

- semantic landmarks, labelled controls, `aria-live` toasts, focus rings on every control
- the chart has a text summary, labelled bars and a table alternative
- the board works without drag and drop (status dropdown), and on touch with a long press
- larger controls in the phone tab bar; reduced-motion respected
