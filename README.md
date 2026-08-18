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
| `npm run test:e2e` | Run the Playwright end-to-end suite. |
| `npm run test:e2e:ui` | Open Playwright's interactive test runner. |
| `npm run test:e2e:report` | Open the most recent Playwright HTML report. |
| `npm run test:e2e:staging` | Run against the configured staging environment. |
| `npm run test:e2e:production` | Run against the configured production environment. |

Tests live in `tests/`. Open `coverage/index.html` in a browser to view the
coverage report.

### End-to-end tests

Playwright uses the following structure:

```text
tests/e2e/
	api/             Direct HTTP clients and API specs
	configuration/   Environment selection and URLs
	fixtures/        Shared Playwright fixtures
	pages/           Reusable page objects and accessible locators
	ui/              Browser user-journey specs
	global-setup.ts  Run-wide readiness checks
	global-teardown.ts
```

Playwright starts the local application automatically, so run `npm run test:e2e`
without starting another server first. When a local server is already running on
port 3000, the configuration reuses it.

Write browser tests around observable user behaviour. Prefer accessible locators
such as `getByRole` and `getByLabel`; avoid CSS classes and implementation
details because they make tests brittle. Keep one user outcome per test. Specs
receive reusable dependencies from `fixtures/test.ts`, rather than creating page
objects or API clients directly. Put navigation and repeated page actions in a
page object; keep assertions in the spec unless an assertion is a reusable page
state check.

### Environments

The default target is local. `TEST_ENV` selects `local`, `staging`, or
`production`; each environment reads an optional `.env.e2e.<environment>` file.
Copy the matching committed `.example` file to create your local configuration.
Real environment files remain ignored by Git, and CI can supply
`PLAYWRIGHT_BASE_URL` directly as an environment variable.

```bash
cp .env.e2e.staging.example .env.e2e.staging
npm run test:e2e:staging
```

Global setup verifies `/health` before the suite starts. Add shared data creation
there only when every test needs it, and remove that data in global teardown.
Test-specific setup and cleanup belong in the relevant fixture so tests stay
isolated.

On a failure, Playwright keeps a screenshot and video, and records a trace on a
retry. Open the HTML report with `npm run test:e2e:report` to inspect them.

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
