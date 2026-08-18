import { defineConfig, devices } from "@playwright/test";
import { environment } from "./tests/e2e/configuration/environment.js";

export default defineConfig({
	testDir: "./tests/e2e",
	testMatch: /.*\.spec\.ts/,
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
