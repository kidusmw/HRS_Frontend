# StayFinder (HRS) Frontend

React + TypeScript + Vite frontend for the **Hotel Reservation System (StayFinder)**.

## Requirements

- Node.js **20+**
- npm **9+** (or compatible)

## Setup

Install dependencies:

```bash
npm install
```

Create an env file (recommended):

```bash
cp .env.example .env.local
```

## Environment variables

- `VITE_API_BASE_URL`: Backend API base URL.
  - Default (if unset): `http://localhost:8000/api`

Example `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

## Run (development)

```bash
npm run dev
```

## Build (production)

```bash
npm run build
```

## Notes

- The app can apply **system branding** (title + favicon) by calling `GET /system/settings` on startup (see `src/main.tsx`).

## Vite / React plugins

Vite supports multiple React plugins:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) (Babel)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) (SWC)

### React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.
