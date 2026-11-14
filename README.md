# Earth System Trend Detective

A NASA-inspired React/Vite frontend for exploring Earth system trends through a Python FastAPI backend. The interface is designed for NASA Space Apps Challenge 2026 and is intentionally honest about data provenance: when the backend is unavailable, the app uses clearly labeled **Illustrative demo mode** values only to demonstrate interaction design.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The Vite server listens on `http://localhost:3000`. Set `VITE_API_BASE_URL` to the URL of the FastAPI service. No NASA, OpenRouter, or other private provider key belongs in the frontend.

## Build and validate

```bash
npm run build
npm run preview
```

The managed preview route manifest is available at `/manus-routes.json` and lists all nine application routes.

## Backend contract

The frontend expects JSON responses from these endpoints. Response objects can include additional fields, but the listed fields are the stable integration surface.

### NASA data

`GET /api/nasa/data?variable=T2M&location=Coimbatore&start_date=2010-01-01&end_date=2024-12-31&frequency=yearly`

```json
{
  "source": "NASA POWER",
  "variable": "T2M",
  "unit": "°C",
  "location": { "name": "Coimbatore", "lat": 11.0168, "lng": 76.9558 },
  "period": { "start": "2010-01-01", "end": "2024-12-31" },
  "labels": ["2010", "2011"],
  "values": [25.1, 25.4],
  "observations": [{ "date": "2010-01-01", "value": 25.1 }]
}
```

### Trend analysis

`POST /api/analyze`

```json
{
  "variable": "T2M",
  "location": { "name": "Coimbatore", "lat": 11.0168, "lng": 76.9558 },
  "start_date": "2010-01-01",
  "end_date": "2024-12-31",
  "frequency": "yearly"
}
```

The response should return `labels`, `values`, `unit`, `source`, `trend_direction`, `slope`, `slope_unit`, `percent_change`, `p_value`, `confidence_interval`, `significance`, `mann_kendall`, and `sen_slope`. The frontend does not recalculate statistical results.

### Locations, comparison, map, AI, and reports

- `GET /api/locations`: return `{ "locations": [{ "id", "name", "region", "lat", "lng" }] }`.
- `POST /api/compare`: accept `{ "variable", "locations": [...], "start_date", "end_date", "frequency" }`; return `{ "labels", "series": [{ "location", "values", "slope", "significance" }], "summary" }`.
- `POST /api/ai/chat`: accept `{ "message", "context" }`; return `{ "answer", "insufficient_data": false }`.
- `POST /api/ai/insights`: accept `{ "analysis", "question" }`; return `{ "answer", "insufficient_data": false }`.
- `POST /api/reports/export`: accept `{ "format", "analysis" }`; return either a file URL or `{ "content", "filename", "mime_type" }`.

Use a consistent FastAPI error envelope such as `{ "detail": "Human-readable message" }`. The UI shows backend errors and preserves the demo label instead of presenting fallback values as NASA data.

## Vercel deployment

Import the project into Vercel, keep the framework preset as Vite, set the build command to `npm run build`, output directory to `dist`, and define `VITE_API_BASE_URL` in the project environment variables. Configure the FastAPI service for CORS from the Vercel origin. For history-based routes, add a Vercel rewrite from `/(.*)` to `/index.html` so direct navigation to dashboard routes resolves correctly.

## Project structure

`src/pages` contains route-level workflows. `src/components` contains reusable UI, charts, map, shell, and state components. `src/services` contains Axios wrappers. `src/data/demoData.js` is the only fallback data source and is explicitly labeled illustrative.
