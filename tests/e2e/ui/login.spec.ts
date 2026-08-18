import { expect, test } from "../fixtures/test.js";

test.describe("Login page", () => {
	test("shows the sign-in form", async ({ loginPage, page }) => {
		await loginPage.navigate();

		await expect(page).toHaveTitle("Login | Kainos");
		await expect(
			page.getByRole("heading", { name: "Welcome back" }),
		).toBeVisible();
		await expect(loginPage.emailInput).toBeVisible();
		await expect(loginPage.passwordInput).toBeVisible();
		await expect(loginPage.submitButton).toBeVisible();
	});
});
