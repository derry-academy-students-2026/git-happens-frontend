# Copilot Instructions

Express + TypeScript frontend rendering Nunjucks templates. It calls a separate
backend API over Axios — it never touches a database directly.

## Commands

| Command | Use |
| --- | --- |
| `npm run dev` | Run locally with watch mode. |
| `npm test` | Run the Vitest suite. |
| `npm run check` | Biome lint + format check. Run before finishing work. |

## Project Layout

```
src/
  app.ts          Express setup, Nunjucks config, middleware, routers
  index.ts        app.listen() only
  config/         Axios client, Morgan middleware
  controllers/    HTTP concerns only
  services/       Backend API calls, error mapping
  models/         DTOs matching the API contract
  routes/         Thin routers that delegate to controllers
  views/          Nunjucks layouts, pages, partials
  public/         Static assets and styles.css
tests/            Vitest unit + Supertest integration tests
```

## Conventions

- Keep the layering: routes → controllers → services → API client. Services must
  not know about `req` or `res`.
- Services return DTOs straight from the API. Don't add mappers or view models
  unless asked.
- Templates render what the controller passes them — no business logic in
  Nunjucks.
- Read config from `process.env` directly. There is no central env module.
- Handle Axios failures with `axios.isAxiosError()` and map status codes to
  domain errors in the service.
- Log through `src/lib/logger.ts`, never `console.log`.
- Add or update tests alongside behaviour changes. Mock `apiClient` rather than
  the service in integration tests.

## UI and Branding

All UI work follows the Kainos Brand Enforcer skill at
`~/.copilot/skills/kainos-brand-enforcer`. Load its `references/brand-rules.md`
and `references/ui-branding.md` before changing designs.

- Use exact Kainos palette values. Secondary colours are accents only.
- Use the bundled logos unaltered — no recolouring, stretching, or redrawing.
- Gradients run diagonally (`45deg`), never `90deg`.
- Reuse the existing layout, header, footer, and button patterns for new pages.
- Keep branding changes in templates, CSS, assets, and display copy. Don't
  change business logic to apply styling.
- Bump the `?v=` query on `styles.css` in `base.njk` when editing CSS, otherwise
  browsers serve the stale file.
- Check contrast, focus states, and responsive layout before finishing.

## Logging and Commenting

- use logging throughout the program for key points where errors may occur or where important information is being processed. Use the logger utility for consistent formatting and log levels.

- ensure that all functions and methods have clear and concise comments explaining their purpose, parameters, and return values. This will help maintain code readability and assist future developers in understanding the codebase. functions require function level comments that describe the purpose of the function, its parameters, and its return value. Use JSDoc style comments for consistency.
