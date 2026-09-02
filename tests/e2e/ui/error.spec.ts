import { expect, test } from "../fixtures/test.js";

test.describe("Error page", () => {
	test("displays error heading and message when navigating to invalid route", async ({
		errorPage,
		page,
	}) => {
		await page.goto("/invalid-route");

		await expect(page).toHaveTitle("Error");
		await expect(errorPage.heading).toBeVisible();
		await expect(errorPage.errorMessage).toBeVisible();
	});

	test("allows navigation back to job roles from error page", async ({
		errorPage,
		loginPage,
		page,
	}) => {
		await loginPage.navigate();

		await loginPage.signIn("test1@example.com", "password123!");
		await page.goto("/jobs/job-roles/999999");

		await expect(errorPage.heading).toBeVisible();
		await errorPage.backToRolesLink.click();

		await expect(page).toHaveURL("/jobs/job-roles");
	});
});
