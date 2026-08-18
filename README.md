# team2-frontend

Team2 Frontend — an Express + TypeScript application.

## Prerequisites

- Node.js 22 or later
- npm

## Install

```bash
npm install
```

## Run

| Command | Description |
| --- | --- |
| `npm run dev` | Start the server with `tsx watch` — reloads on file changes. |
| `npm start` | Start the server once via `tsx` (no watch). |

The server listens on <http://localhost:3000>, with a health check at
<http://localhost:3000/health>.

To run the compiled output instead:

```bash
npm run build
node dist/index.js
```

## Build

```bash
npm run build
```

Compiles `src/` to `dist/` using `tsc -p tsconfig.json`.

## Test

| Command | Description |
| --- | --- |
| `npm test` | Run the Vitest suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:coverage` | Run the suite and write a coverage report to `coverage/`. |

Tests live in `tests/`. Open `coverage/index.html` in a browser to view the
coverage report.

## End-to-End Tests

Playwright tests live in `e2e/` and start the frontend automatically on the
test-only port from `.env.test`.

| Command | Description |
| --- | --- |
| `npm run test:e2e` | Run the Chromium end-to-end and frontend API smoke tests. |
| `npm run test:e2e:ui` | Open Playwright's interactive test runner. |
| `npm run test:e2e:report` | Open the latest HTML report. |

Install the browser once before the first run:

```bash
npx playwright install chromium
```

The framework is structured by responsibility:

- `e2e/pages/` contains page objects and accessible selectors.
- `e2e/fixtures/` creates and disposes isolated browser contexts and API clients
	for each test. `authenticatedPage` uses a local test cookie, so a test can
	exercise signed-in UI without submitting real credentials.
- `e2e/setup/` contains global setup and teardown, which run once for the whole
	suite. Per-test reset belongs in fixtures, not global hooks.
- `e2e/specs/` contains user journeys and HTTP checks.

The frontend does not own a database connection. Browser tests cover user
behaviour, while frontend API/service tests use mocked API responses. Real
database retrieval should be tested in the backend repository against its test
environment.

## Lint & Format

Linting and formatting are handled by [Biome](https://biomejs.dev/).

| Command | Description |
| --- | --- |
| `npm run lint` | Report lint issues. |
| `npm run lint:fix` | Apply safe lint fixes. |
| `npm run format` | Format all files in place. |
| `npm run check` | Run lint + format checks together. |
| `npm run ci:check` | Non-writing check intended for CI. |

## Development Notes

When adding new pages, templates, components, or CSS, use the Kainos Brand Enforcer
skill to keep the UI aligned with Kainos branding. The skill includes the brand
rules, approved colours, logo usage, typography guidance, UI patterns, and
cross-framework implementation notes.

For UI work, load the skill's `references/brand-rules.md` and
`references/ui-branding.md` before making design changes. Use the bundled Kainos
logos from `references/assets/logos/`, copy the appropriate logo into this
project's static assets, and keep branding changes in Nunjucks templates, CSS,
assets, and display copy unless behaviour genuinely needs to change.

New pages should reuse the existing layout, header, footer, spacing, and button
patterns where possible. Use the exact Kainos palette values from the skill, keep
secondary colours as accents only, and verify responsive layout, contrast, and
focus states before merging.
