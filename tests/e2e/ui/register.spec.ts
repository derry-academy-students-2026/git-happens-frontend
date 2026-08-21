import { randomUUID } from "node:crypto";
import { expect, test } from "../fixtures/test.js";

test.describe("Account registration", () => {
	test("creates an account and confirms registration on the login page", async ({
		page,
		registerPage,
	}) => {
		await registerPage.navigate();
		await registerPage.register(
			`playwright-${randomUUID()}@example.com`,
			"Password123!",
			"Password123!",
		);

		await expect(page).toHaveURL("/auth/login?registered=1");
		await expect(page.getByRole("status")).toContainText(
			"Registration successful. Please log in.",
		);
	});

	test("retains the email address when password confirmation fails", async ({
		page,
		registerPage,
	}) => {
		await registerPage.navigate();
		await registerPage.register(
			"candidate@example.com",
			"Password123!",
			"Different123!",
		);

		await expect(page).toHaveURL("/auth/register");
		await expect(registerPage.errorMessage).toContainText("Passwords do not match");
		await expect(registerPage.emailInput).toHaveValue("candidate@example.com");
	});
});