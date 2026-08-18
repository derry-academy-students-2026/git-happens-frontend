import { expect, test } from "../fixtures/test.js";

test.describe("Account registration", () => {
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