import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page.js";

export class RegisterPage extends BasePage {
	public readonly emailInput: Locator;
	public readonly passwordInput: Locator;
	public readonly confirmPasswordInput: Locator;
	public readonly submitButton: Locator;
	public readonly errorMessage: Locator;

	public constructor(page: Page) {
		super(page);
		this.emailInput = page.getByLabel("Email address");
		this.passwordInput = page.getByLabel("Password", { exact: true });
		this.confirmPasswordInput = page.getByLabel("Confirm password");
		this.submitButton = page.getByRole("button", { name: "Create account" });
		this.errorMessage = page.getByRole("alert");
	}

	public async navigate(): Promise<void> {
		await this.navigateTo("/auth/register");
	}

	public async register(
		email: string,
		password: string,
		confirmPassword: string,
	): Promise<void> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.confirmPasswordInput.fill(confirmPassword);
		await this.submitButton.click();
	}
}
