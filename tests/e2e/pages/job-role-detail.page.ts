import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page.js";

export class JobRoleDetailPage extends BasePage {
	public readonly roleDetailsHeading: Locator;
	public readonly jobSpecLink: Locator;
	public readonly backToRolesLink: Locator;
	public readonly applyNowLink: Locator;
	public readonly successBanner: Locator;
	public readonly alreadyAppliedNotice: Locator;

	public constructor(page: Page) {
		super(page);
		this.roleDetailsHeading = page.getByRole("heading", {
			name: "Role details",
		});
		this.jobSpecLink = page.getByRole("link", { name: "View job spec" });
		this.backToRolesLink = page.getByRole("link", {
			name: "Back to all roles",
		});
		this.applyNowLink = page.getByRole("link", { name: "Apply now" });
		this.successBanner = page.locator(".auth-form__success");
		this.alreadyAppliedNotice = page.locator(".auth-form__notice");
	}
}
