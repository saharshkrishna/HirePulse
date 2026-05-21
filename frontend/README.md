# HirePulse React Web Project

This project is a React web implementation of the HirePulse hiring-notification dashboard. The interface is designed as a recruiter-style and candidate-focused workspace that aggregates IT job opportunities from multiple sources into one searchable, filterable view.

## What the project includes

- React + Vite project setup.
- Tailwind CSS configuration.
- Reusable UI primitives for badges, chips, panels, logo marks, and match bars.
- Mock data for jobs, companies, and source-health monitoring.
- Dashboard layout with sidebar navigation, top search bar, KPI cards, job feed, company watchlist, alert center, and source-health table.
- Theme toggle for light and dark mode.
- Filter logic for role, location mode, experience, sorting, and text search.

## Folder structure

```text
hirepulse-react/
├── public/
├── src/
│   ├── components/
│   │   └── ui.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## How it works

### 1. App entry

`src/main.jsx` mounts the React app into the root DOM node and loads the global stylesheet.

### 2. Main dashboard logic

`src/App.jsx` contains:

- Theme state.
- Search and filter state.
- Computed filtered job list using `useMemo`.
- Layout composition for each dashboard section.
- Command palette open/close state.

### 3. Mock data layer

`src/data/mockData.js` stores static demo data for:

- companies
- jobs
- source health metrics

This file is the easiest place to swap in live API data later.

### 4. Reusable components

`src/components/ui.jsx` contains small presentation components:

- `Panel`
- `Badge`
- `Chip`
- `LogoMark`
- `MatchBar`

These keep the UI more maintainable and reduce repeated markup.

### 5. Styling system

`src/styles/index.css` contains:

- Theme tokens using CSS variables.
- Shared dashboard layout classes.
- Button, badge, chip, table, and panel styles.
- Responsive rules for tablet and mobile.

Tailwind is used for spacing, responsive utilities, and layout support, while CSS variables provide a stable design-token foundation.

## How to set up the project

### Requirements

- Node.js 18 or later
- npm 9 or later

### Install

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

This starts the Vite development server, usually at:

```text
http://localhost:5173
```

### Build for production

```bash
npm run build
```

The output will be generated in the `dist/` folder.

### Preview the production build

```bash
npm run preview
```

## How to connect a real backend later

Replace the mock-data imports with API calls.

Suggested progression:

1. Create a backend service using Node.js + Express or NestJS.
2. Add endpoints like:
   - `GET /jobs`
   - `GET /companies`
   - `GET /sources/health`
   - `POST /alerts/preferences`
3. Replace the mock imports with `fetch()` calls or React Query.
4. Move filter state into URL parameters or centralized state when the app grows.
5. Add authentication and user-specific watchlists.

## Suggested next upgrades

- Add React Router for multi-page navigation.
- Add React Query for API caching and server state.
- Add a backend auth provider.
- Add saved jobs and alert preferences persistence.
- Add charts for source trends and job trends.
- Add a live AI scan pipeline powered by a scraping or source-ingestion backend.

## Notes

This version is intentionally optimized as a clean front-end project structure for a hiring-aggregator MVP. It is ready to be used as:

- a college project prototype,
- a React dashboard starter,
- or the frontend base for a full-stack hiring-notification product.
