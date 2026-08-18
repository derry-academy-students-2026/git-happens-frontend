import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page.js";

export class LoginPage extends BasePage {
	public readonly emailInput: Locator;
	public readonly passwordInput: Locator;
	public readonly submitButton: Locator;

	/**
	 * Creates a page object for login interactions.
	 *
	 * @param page - Playwright page used to locate and interact with login controls.
	 */
	public constructor(page: Page) {
		super(page);
		this.emailInput = page.getByLabel("Email");
		this.passwordInput = page.getByLabel("Password");
		this.submitButton = page.getByRole("button", { name: "Login" });
	}

	/**
	 * Opens the login route.
	 *
	 * @returns A promise that resolves when the login page finishes loading.
	 */
	public async navigate(): Promise<void> {
		await this.navigateTo("/auth/login");
	}

	/**
	 * Submits the login form with supplied credentials.
	 *
	 * @param email - Email address to enter.
	 * @param password - Password to enter.
	 * @returns A promise that resolves after the form is submitted.
	 */
	public async signIn(email: string, password: string): Promise<void> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.submitButton.click();
	}
}
