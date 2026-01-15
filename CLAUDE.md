# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**COFIRA** is a fitness and nutrition tracking Angular 20 application with JWT authentication, standalone components, and an ITCSS/BEM styling architecture. All code, variables, and comments are in **Spanish**.

## Essential Commands

```bash
# Development
npm start                    # Dev server on port 4200
npm run dev                  # Frontend + API concurrently

# Testing
npm test                     # Interactive Jasmine/Karma tests
npm run test:coverage        # Headless tests with coverage report
npm run test:watch           # Watch mode with live coverage

# Build & Lint
npm run build                # Production build
npm run lint                 # ESLint (TS + HTML)

# Backend API
npm run api                  # Node.js server with JWT (port 3000)
npm run api:simple           # JSON-server mock API
```

## Architecture

### Application Structure
```
src/app/
├── core/           # Singleton services, guards, interceptors
├── features/       # Lazy-loaded feature modules (10 modules)
└── shared/         # Reusable components, validators, models
```

### Core Services & Patterns
- **AuthService**: JWT auth with `signal<User | null>` for reactive state
- **ThemeService**: Light/dark mode persisted to localStorage
- **4 Functional Interceptors**: auth, loading, error, logging
- **7 Guards**: authGuard, onboardingGuard, signupGuard, canDeactivateGuard, etc.

### Routing
- Lazy loading via `loadComponent()` and `loadChildren()`
- Route resolvers prefetch data (trainingResolver, nutritionResolver)
- PreloadAllModules strategy enabled

### SCSS Architecture (ITCSS)
```
src/styles/
├── 00-settings/    # CSS variables (colors, fonts, spacing)
├── 01-tools/       # Mixins (50+)
├── 02-generic/     # Reset
├── 03-elements/    # Base HTML styles
├── 04-layout/      # Grid, containers
├── 05-components/  # BEM components
└── 06-utilities/   # Helper classes
```

## Key Conventions

### Naming (Spanish BEM)
- Components: `.tarjeta`, `.boton`, `.formulario`
- Elements: `.tarjeta__titulo`, `.boton__icono`
- Modifiers: `.boton--primario`, `.tarjeta--destacada`
- Up to 4 levels: `.cabecera__zona__menu__enlace`

### Component Patterns
- All components are **standalone** (no NgModule)
- Use `signal()` for reactive state in services
- Functional interceptors (not class-based)

### CSS Rules
- **Never nest selectors** (flat structure only)
- **Never use `!important`**
- **Never use `<div>`** - use semantic HTML
- **Flexbox over Grid** (98% of layouts)
- Variables: `--spacing-size-m`, `--font-size-lg`, `--color-primario`

### Code Style
- Always create **intermediate variables** (never chain >2 operations)
- Descriptive variable names (15-25 chars typical)
- Comments explain "why", not "what"

## Testing

- Framework: Jasmine + Karma with Chrome headless
- Coverage reports: `coverage/` directory
- Current coverage: ~45% statements
- Test files: 61 `.spec.ts` files

Run a single test file:
```bash
npx karma start --grep="NombreDelSpec"
```

## Environment Configuration

- Dev proxy: `proxy.conf.json` routes `/api` and `/uploads` to localhost:3000
- Environments: `src/environments/environment.ts` and `environment.prod.ts`

## Feature Modules

| Module | Path | Purpose |
|--------|------|---------|
| auth | `/login`, `/register` | Authentication flows |
| training | `/entrenamiento` | Workout tracking |
| nutrition | `/alimentacion` | Meal planning |
| progress | `/seguimiento` | Fitness metrics |
| preferences | `/preferencias/*` | User settings |
| onboarding | `/onboarding` | Initial setup wizard |
| checkout | `/checkout/*` | Payment processing |
