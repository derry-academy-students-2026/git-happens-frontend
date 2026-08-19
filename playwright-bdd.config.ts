import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import { environment } from "./tests/e2e/configuration/environment.js";

const testDir = defineBddConfig({
	features: "tests/e2e/features/**/*.feature",
	steps: ["tests/e2e/steps/**/*.ts", "tests/e2e/fixtures/bdd.ts"],
	outputDir: "tests/e2e/.features-gen",
});

export default defineConfig({
	testDir,
	globalSetup: "./tests/e2e/global-setup.ts",
	globalTeardown: "./tests/e2e/global-teardown.ts",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? [["html"], ["github"]] : "html",
	use: {
		baseURL: environment.baseUrl,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
	],
	webServer: {
		command: "npm run start",
		url: environment.baseUrl,
		reuseExistingServer: !process.env.CI,
	},
});
