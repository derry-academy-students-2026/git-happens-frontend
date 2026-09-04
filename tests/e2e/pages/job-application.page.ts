import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page.js";

export interface JobApplicationDetails {
	fullName: string;
	email: string;
	countryCode: string;
	phoneNumber: string;
	applicationText: string;
}

export class JobApplicationPage extends BasePage {
	public readonly fullNameInput: Locator;
	public readonly emailInput: Locator;
	public readonly countryCodeInput: Locator;
	public readonly phoneNumberInput: Locator;
	public readonly applicationTextInput: Locator;
	public readonly submitButton: Locator;
	public readonly cancelLink: Locator;

	public constructor(page: Page) {
		super(page);
		this.fullNameInput = page.getByLabel("Full name");
		this.emailInput = page.getByLabel("Contact email");
		this.countryCodeInput = page.getByLabel("Country code");
		this.phoneNumberInput = page.getByLabel("Phone number");
		this.applicationTextInput = page.getByLabel(
			"Tell us why you're interested in this role",
		);
		this.submitButton = page.getByRole("button", {
			name: "Submit application",
		});
		this.cancelLink = page.getByRole("link", { name: "Cancel" });
	}

	/**
	 * Fills every required field and submits the application form.
	 *
	 * @param details - Valid application details to submit.
	 * @returns A promise that resolves after the submit button is clicked.
	 */
	public async submitApplication(
		details: JobApplicationDetails,
	): Promise<void> {
		await this.fullNameInput.fill(details.fullName);
		await this.emailInput.fill(details.email);
		await this.countryCodeInput.fill(details.countryCode);
		await this.phoneNumberInput.fill(details.phoneNumber);
		await this.applicationTextInput.fill(details.applicationText);
		await this.submitButton.click();
	}
}
