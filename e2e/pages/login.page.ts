import type { Locator, Page } from "@playwright/test";

// Keeps login-page selectors out of user-journey specifications.
export class LoginPage {
	readonly heading: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;

	constructor(page: Page) {
		this.heading = page.getByRole("heading", { name: "Login", exact: true });
		this.emailInput = page.getByLabel("Email");
		this.passwordInput = page.getByLabel("Password");
	}
}