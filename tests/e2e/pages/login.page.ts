import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page.js";

export class LoginPage extends BasePage {
	public readonly emailInput: Locator;
	public readonly passwordInput: Locator;
	public readonly submitButton: Locator;
	public readonly errorMessage: Locator;

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
		this.errorMessage = page.locator("text=Invalid email or password");
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
	 * Enters an email address into the login form.
	 *
	 * @param email - Email address to enter.
	 * @returns A promise that resolves after the email is entered.
	 */
	public async enterEmail(email: string): Promise<void> {
		await this.emailInput.fill(email);
	}

	/**
	 * Enters a password into the login form.
	 *
	 * @param password - Password to enter.
	 * @returns A promise that resolves after the password is entered.
	 */
	public async enterPassword(password: string): Promise<void> {
		await this.passwordInput.fill(password);
	}

	/**
	 * Submits the login form.
	 *
	 * @returns A promise that resolves after the login button is clicked.
	 */
	public async clickLogin(): Promise<void> {
		await this.submitButton.click();
	}

	/**
	 * Submits the login form with supplied credentials.
	 *
	 * @param email - Email address to enter.
	 * @param password - Password to enter.
	 * @returns A promise that resolves after the form is submitted.
	 */
	public async signIn(email: string, password: string): Promise<void> {
		await this.enterEmail(email);
		await this.enterPassword(password);
		await this.clickLogin();
	}
}
