import { expect, test } from "../fixtures/test.js";

test.describe("Authenticated session", () => {
	test("ends the session on logout and protects job roles", async ({
		authenticatedJobRoleListPage,
		jobRoleListPage,
		page,
	}) => {
		await expect(authenticatedJobRoleListPage.heading).toBeVisible();

		await page.getByRole("button", { name: "Log out" }).click();

		await expect(page).toHaveURL("/auth/login");
		await expect(page.getByRole("link", { name: "Login" })).toBeVisible();

		await jobRoleListPage.navigate();
		await expect(page).toHaveURL("/auth/login?returnTo=%2Fjobs%2Fjob-roles");
	});
});
