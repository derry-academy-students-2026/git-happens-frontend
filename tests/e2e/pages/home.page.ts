import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page.js";

export class HomePage extends BasePage {
	public readonly browseRolesLink: Locator;

	public constructor(page: Page) {
		super(page);
		this.browseRolesLink = page.getByRole("link", {
			name: "Browse open roles",
		});
	}

	public async navigate(): Promise<void> {
		await this.navigateTo("/jobs");
	}
}