import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page.js";

export class JobRoleDetailPage extends BasePage {
	public readonly roleDetailsHeading: Locator;
	public readonly jobSpecLink: Locator;
	public readonly backToRolesLink: Locator;
	public readonly metaLabels: Locator;

	public constructor(page: Page) {
		super(page);
		this.roleDetailsHeading = page.getByRole("heading", {
			name: "Role details",
		});
		this.jobSpecLink = page.getByRole("link", { name: "View job spec" });
		this.backToRolesLink = page.getByRole("link", {
			name: "Back to all roles",
		});
		this.metaLabels = page.locator(".job-detail .job-meta dt");
	}

	public async navigateToRole(jobRoleId: string): Promise<void> {
		await this.navigateTo(`/jobs/job-roles/${jobRoleId}`);
	}

	public specificationSection(sectionName: string): Locator {
		return this.page.getByRole("heading", { name: sectionName, exact: true });
	}

	public specificationDetail(label: string): Locator {
		return this.metaLabels.filter({ hasText: label });
	}
}