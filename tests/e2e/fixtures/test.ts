import { test as base, expect } from "@playwright/test";
import { HealthApiClient } from "../api/health.api-client.js";
import { ErrorPage } from "../pages/error.page.js";
import { HomePage } from "../pages/home.page.js";
import { JobApplicationPage } from "../pages/job-application.page.js";
import { JobRoleDetailPage } from "../pages/job-role-detail.page.js";
import { JobRoleListPage } from "../pages/job-role-list.page.js";
import { LoginPage } from "../pages/login.page.js";
import { RegisterPage } from "../pages/register.page.js";

interface ApplicationFixtures {
	errorPage: ErrorPage;
	homePage: HomePage;
	jobApplicationPage: JobApplicationPage;
	jobRoleDetailPage: JobRoleDetailPage;
	jobRoleListPage: JobRoleListPage;
	authenticatedJobRoleListPage: JobRoleListPage;
	loginPage: LoginPage;
	registerPage: RegisterPage;
	healthApi: HealthApiClient;
}

export const test = base.extend<ApplicationFixtures>({
	errorPage: async ({ page }, use) => {
		await use(new ErrorPage(page));
	},
	homePage: async ({ page }, use) => {
		await use(new HomePage(page));
	},
	jobApplicationPage: async ({ page }, use) => {
		await use(new JobApplicationPage(page));
	},
	jobRoleDetailPage: async ({ page }, use) => {
		await use(new JobRoleDetailPage(page));
	},
	jobRoleListPage: async ({ page }, use) => {
		await use(new JobRoleListPage(page));
	},
	authenticatedJobRoleListPage: async ({ page }, use) => {
		const loginPage = new LoginPage(page);
		const jobRoleListPage = new JobRoleListPage(page);
		await loginPage.navigate();
		await loginPage.signIn("test1@example.com", "password123!");
		await use(jobRoleListPage);
	},
	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},
	registerPage: async ({ page }, use) => {
		await use(new RegisterPage(page));
	},
	healthApi: async ({ request }, use) => {
		await use(new HealthApiClient(request));
	},
});

export { expect };
