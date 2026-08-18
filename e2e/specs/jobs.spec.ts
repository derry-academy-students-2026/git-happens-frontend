import { test, expect } from "../fixtures/app.fixture";
import { JobsPage } from "../pages/jobs.page";
import { LoginPage } from "../pages/login.page";

// These journeys use isolated fixtures and never require real account credentials.
test.describe("Jobs landing page", () => {
	test("shows the careers message to an anonymous visitor", async ({ anonymousPage }) => {
		const jobsPage = new JobsPage(anonymousPage);

		await jobsPage.visit();

		await expect(jobsPage.heading).toBeVisible();
		await expect(jobsPage.browseOpenRolesLink).toBeVisible();
	});

	test("sends an anonymous visitor to login before viewing roles", async ({ anonymousPage }) => {
		const jobsPage = new JobsPage(anonymousPage);

		await jobsPage.visit();
		await jobsPage.browseOpenRoles();

		await expect(anonymousPage).toHaveURL(/\/auth\/login\?returnTo=%2Fjobs%2Fjob-roles/);
		await expect(new LoginPage(anonymousPage).heading).toBeVisible();
	});

	test("shows signed-in navigation without a real user login", async ({ authenticatedPage }) => {
		const jobsPage = new JobsPage(authenticatedPage);

		await jobsPage.visit();

		await expect(authenticatedPage.getByRole("button", { name: "Log out" })).toBeVisible();
	});
});