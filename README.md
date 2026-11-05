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
├── vite.config.js
└── src/
    ├── App.jsx            # Application root component with routing shell
    ├── index.css          # Tailwind CSS directives
    └── main.jsx           # Entry point with QueryClient and BrowserRouter
```

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
