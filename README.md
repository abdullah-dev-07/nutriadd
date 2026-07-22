# NutriAdd — Life Care

Corporate marketing website for **NutriAdd (Life Care)** — a Lahore-based pharmaceutical, nutraceutical, cosmeceutical and food-supplement company.

> _Caring for Healthy Life_

## Tech stack

| Concern    | Choice                                  |
| ---------- | --------------------------------------- |
| Framework  | React 19 + Vite                         |
| Language   | TypeScript                              |
| Styling    | Tailwind CSS v4                         |
| Components | shadcn/ui                               |
| Icons      | Lucide React                            |
| Animation  | Framer Motion                           |
| Routing    | React Router v7                         |
| Email      | Resend (via Vercel Serverless Function) |
| Deploy     | Vercel                                  |
| Package    | pnpm                                    |

## Repo layout

This is a monorepo with two independently deployed halves:

```
frontend/   React 19 + Vite SPA — deployed to Vercel (see below)
backend/    FastAPI + PostgreSQL API — deployed to Railway (see backend/README.md)
```

They only talk to each other over HTTP (`VITE_API_URL` → the Railway backend URL); neither imports code from the other.

## Getting started (frontend)

```bash
cd frontend
pnpm install
cp .env.example .env   # fill in values (Phase 8+)
pnpm dev
```

For the backend, see [backend/README.md](backend/README.md).

## Scripts (run from `frontend/`)

| Script           | Purpose                       |
| ---------------- | ----------------------------- |
| `pnpm dev`       | Start the dev server          |
| `pnpm build`     | Type-check and build for prod |
| `pnpm preview`   | Preview the production build  |
| `pnpm lint`      | Run ESLint                    |
| `pnpm format`    | Format with Prettier          |
| `pnpm typecheck` | Type-check without emitting   |

## Frontend project structure

```
frontend/
  src/
    assets/        Local images & logo
    components/
      ui/          shadcn/ui primitives (added on demand)
      layout/      Navbar, Footer, Layout shell
      home/        Homepage sections
      shared/      Cross-page reusable pieces
    pages/         Route-level pages
    hooks/         Custom hooks
    lib/           Utilities, constants, site config
    types/         Shared TypeScript types
    styles/        Global CSS & design tokens
  api/             Vercel serverless functions
  public/          Static assets (robots, sitemap, favicons)
```
