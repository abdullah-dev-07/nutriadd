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

## Getting started

```bash
pnpm install
cp .env.example .env   # fill in values (Phase 8+)
pnpm dev
```

## Scripts

| Script           | Purpose                       |
| ---------------- | ----------------------------- |
| `pnpm dev`       | Start the dev server          |
| `pnpm build`     | Type-check and build for prod |
| `pnpm preview`   | Preview the production build  |
| `pnpm lint`      | Run ESLint                    |
| `pnpm format`    | Format with Prettier          |
| `pnpm typecheck` | Type-check without emitting   |

## Project structure

```
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
