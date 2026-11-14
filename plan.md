# Earth System Trend Detective — Implementation Plan

## Scope

Build a responsive React/Vite frontend for the NASA Space Apps Challenge 2026 project. The app will provide a polished scientific analytics workflow across nine routes: landing, dashboard, data explorer, trend analysis, interactive map, region comparison, Earth AI assistant, reports, and about.

The frontend remains independent of the Python FastAPI backend. All NASA observations, statistical calculations, AI answers, map trend markers, and exports that depend on backend results are represented through service functions and normalized response contracts. Until a backend is available, the interface uses an unmistakable **Illustrative demo data** mode so it never presents sample observations as real NASA observations.

## Implementation approach

- Use React Router for the nine pages and a shared responsive application shell.
- Use reusable components for sidebar/topbar navigation, page headers, stat cards, charts, badges, loading/error states, map panels, and export controls.
- Use Chart.js for trend, comparison, and dashboard charts. The chart component supports an optional backend-provided trend series and exposes image export.
- Use React Leaflet with CircleMarker overlays for the map experience. Demo markers are labeled illustrative; real trend markers will be accepted only from backend responses.
- Keep Axios calls in `src/services/` with a shared request helper, normalized errors, and documented API shapes in the README.
- Keep all calculations in the backend contract. The demo dataset is static, clearly marked, and used only to demonstrate interactions when the backend is unavailable.
- Use CSS custom properties and a small component class system for the NASA-inspired visual language; Tailwind is included in the project dependencies for future extension without making the UI dependent on generated utility output.
- Create `public/manus-routes.json` so the managed preview can discover every page route.

## Design direction

### Alternative styles considered

- **Orbital Mission Control** — crisp white canvas, navy information bands, cyan telemetry accents, and compact data panels. Probability: 0.07.
- **Field Research Notebook** — warm paper surfaces, forest-green annotations, and tactile cards. Probability: 0.04.
- **Deep Space Observatory** — dark graphite canvas, luminous data strokes, and high-contrast scientific overlays. Probability: 0.06.

### Chosen style: Orbital Mission Control

- **Design movement:** Editorial scientific dashboard meets NASA mission operations interface.
- **Core principles:** evidence first, calm hierarchy, instrument-like precision, and approachable interpretation.
- **Color philosophy:** white and mist surfaces keep dense science readable; navy anchors trust; cyan marks live data and interaction; green is reserved for environmental direction and significance; amber flags demo mode or uncertainty.
- **Layout paradigm:** a persistent left mission rail with wide, asymmetric content stages; primary insight panels are visually heavier than supporting metadata.
- **Signature elements:** orbit-ring logo mark, slim telemetry strip, and dot-grid / map-like background texture.
- **Interaction philosophy:** every control explains what it changes; destructive or unavailable actions are not presented as working; backend absence is visible rather than silently masked.
- **Animation:** short, low-amplitude fades and lift-on-hover only; no looping distraction except the AI loading dots and the hero orbit pulse.
- **Typography system:** Inter for interface density and Source Serif 4 for scientific editorial accents; large headings are restrained and paired with uppercase eyebrow labels.
- **Brand essence:** an evidence-led cockpit for understanding Earth system change; precise, calm, interpretive.
- **Brand voice:** concise and scientific without being cold. Example lines: “Find the signal in the seasonality.” “A trend is only useful when you can explain its confidence.”
- **Wordmark & logo:** an orbit-ring “ETD” monogram paired with a two-line wordmark.
- **Signature brand color:** electric cyan `#09B7D7`, used as a telemetry accent rather than a decorative gradient.

## Project structure

- `src/App.jsx`: route map and shared application state for the active analysis context.
- `src/components/`: reusable shell, chart, map, status, and data-display components.
- `src/pages/`: one page per route, each focused on a single user workflow.
- `src/services/api.js`: Axios instance, timeout, error normalization, and request helper.
- `src/services/nasaApi.js`: NASA data and location endpoint wrappers.
- `src/services/aiApi.js`: Earth AI chat and insight endpoint wrappers.
- `src/data/demoData.js`: clearly labeled illustrative demo records used only when backend calls are unavailable.
- `src/index.css`: design tokens, responsive layout, component styling, and Leaflet/map presentation.
- `public/manus-routes.json`: route manifest for managed preview.
- `README.md`: setup, run, testing, deployment, and backend contracts.

## Build workflow

1. Install dependencies with `npm install`.
2. Run the Vite server with `npm run dev` on port 3000.
3. Validate `npm run build` and inspect the route manifest over HTTP.
4. Run the app with the backend absent to verify the demo mode and empty/error states.
5. Connect the FastAPI backend by setting `VITE_API_BASE_URL` and matching the documented JSON contracts.
