import type { Locator, Page } from "@playwright/test";

// Encapsulates stable, user-facing selectors for the jobs landing page.
export class JobsPage {
	readonly heading: Locator;
	readonly browseOpenRolesLink: Locator;
	readonly jobRolesLink: Locator;

	constructor(private readonly page: Page) {
		this.heading = page.getByRole("heading", {
			name: "Your Kainos story starts here",
		});
		this.browseOpenRolesLink = page.getByRole("link", {
			name: "Browse open roles",
		});
		this.jobRolesLink = page.getByRole("link", { name: "Job roles" });
	}

	async visit(): Promise<void> {
		await this.page.goto("/jobs");
	}

	async browseOpenRoles(): Promise<void> {
		await this.browseOpenRolesLink.click();
	}
}