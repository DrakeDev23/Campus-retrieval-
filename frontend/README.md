# Frontend Application — Campus Lost-and-Found System

## Overview

This directory contains the ReactJS frontend single-page application (SPA) for the Campus Lost-and-Found Retrieval System.

## Technology Stack

- **Framework:** React 18
- **Build Tool:** Vite 6
- **Routing:** React Router DOM v7
- **Server State & Data Fetching:** TanStack Query v5
- **Styling:** Tailwind CSS v3 & PostCSS

## Application Structure

```text
frontend/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json         # SPA rewrite rule for Vercel deployments
├── vite.config.js
├── public/
│   └── _redirects      # SPA fallback rule for Netlify-style static hosts
└── src/
    ├── App.jsx            # Application root component with route definitions
    ├── index.css          # Tailwind CSS directives
    ├── main.jsx           # Entry point with QueryClient and BrowserRouter
    ├── components/
    │   ├── common/        # Shared UI (Breadcrumb, ItemCard)
    │   ├── layout/         # Persistent app shell (Layout, ScrollToTop)
    │   └── landingPage/   # Home page sections (Navbar, Hero, Footer, ...)
    └── pages/              # Route-level pages (Browse Found Items, How It Works, 404)
```

## Routing

Client-side routing is handled by React Router. The navbar and footer render
inside a shared `Layout` so they stay sticky and persistent across every
route, and the active nav item is highlighted automatically based on the
current URL via `NavLink`.

| Path | Page |
|---|---|
| `/` | Home |
| `/browse-found-items` | Browse Found Items |
| `/how-it-works` | How It Works |
| `*` | 404 Not Found |

Because this is a single-page app, direct URL access and page refreshes on
routes other than `/` need a server-side fallback that always serves
`index.html`. `npm run dev` and `npm run preview` already handle this via
Vite's SPA fallback. For production static hosting:

- **Netlify:** `public/_redirects` rewrites all paths to `index.html`.
- **Vercel:** `vercel.json` defines an equivalent rewrite rule.
- **Other static hosts/Nginx:** configure a fallback rule such as
  `try_files $uri /index.html;`.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
The application runs locally on `http://localhost:3000` with API proxy forwarding `/api` requests to `http://localhost:8000`.

### 3. Production Build
```bash
npm run build
```
Build output is generated in `dist/`.
