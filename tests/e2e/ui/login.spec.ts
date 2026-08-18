import { expect, test } from "../fixtures/test.js";

test.describe("Login page", () => {
	test("signs in with valid credentials", async ({ loginPage, page }) => {
		await loginPage.navigate();

		await loginPage.signIn("test1@example.com", "password123!");

		await expect(page).toHaveURL("/jobs/job-roles");
		await expect(page).toHaveTitle("Open job roles | Kainos");
	});
});
