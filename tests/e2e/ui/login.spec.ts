import { expect, test } from "../fixtures/test.js";

test.describe("Login page", () => {
	test("signs in with valid credentials", async ({ loginPage, page }) => {
		await loginPage.navigate();

		await loginPage.signIn("test1@example.com", "password123!");

		await expect(page).toHaveURL("/jobs/job-roles");
		await expect(page).toHaveTitle("Open job roles | Kainos");
	});

	test("signs in with invalid email/password", async ({ loginPage, page }) => {
		await loginPage.navigate();

		await loginPage.signIn("invalid@example.com", "wrongpassword");

		await expect(page).toHaveURL("/auth/login");
		await expect(page).toHaveTitle("Login | Kainos");
		await expect(loginPage.errorMessage).toBeVisible();
	});

	test("signs in with invalid password", async ({ loginPage, page }) => {
		await loginPage.navigate();

		await loginPage.signIn("test1@example.com", "wrongpassword");

		await expect(page).toHaveURL("/auth/login");
		await expect(page).toHaveTitle("Login | Kainos");
		await expect(loginPage.errorMessage).toBeVisible();
	});

	test("does not grant protected job-role access after a failed login", async ({
		loginPage,
		page,
	}) => {
		await loginPage.navigate();
		await loginPage.signIn("test1@example.com", "wrongpassword");

		await expect(loginPage.errorMessage).toBeVisible();
		await page.goto("/jobs/job-roles");

		await expect(page).toHaveURL("/auth/login?returnTo=%2Fjobs%2Fjob-roles");
		await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
	});
});
