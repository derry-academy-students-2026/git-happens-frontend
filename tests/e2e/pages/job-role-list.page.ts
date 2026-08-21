import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page.js";

export class JobRoleListPage extends BasePage {
	public readonly heading: Locator;
	public readonly firstRole: Locator;

	public constructor(page: Page) {
		super(page);
		this.heading = page.getByRole("heading", { name: "All roles" });
		this.firstRole = page.locator(".job-item").first();
	}

	public async navigate(): Promise<void> {
		await this.navigateTo("/jobs/job-roles");
	}

	public async getFirstRoleName(): Promise<string> {
		return (
			(await this.firstRole.locator(".job-item__title").textContent()) ?? ""
		);
	}
}
