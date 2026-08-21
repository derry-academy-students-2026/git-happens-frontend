import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page.js";

export class ErrorPage extends BasePage {
	public readonly heading: Locator;
	public readonly errorMessage: Locator;
	public readonly backToRolesLink: Locator;

	/**
	 * Creates a page object for error page interactions.
	 *
	 * @param page - Playwright page used to locate and interact with error page elements.
	 */
	public constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { name: "Something went wrong" });
		this.errorMessage = page.locator(".notice p");
		this.backToRolesLink = page.getByRole("link", {
			name: "Back to job roles",
		});
	}
}
