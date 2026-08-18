import { test as base, expect } from "@playwright/test";
import { HealthApiClient } from "../api/health.api-client.js";
import { LoginPage } from "../pages/login.page.js";

interface ApplicationFixtures {
	loginPage: LoginPage;
	healthApi: HealthApiClient;
}

export const test = base.extend<ApplicationFixtures>({
	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},
	healthApi: async ({ request }, use) => {
		await use(new HealthApiClient(request));
	},
});

export { expect };
