import type { Page } from "@playwright/test";

export abstract class BasePage {
	protected constructor(protected readonly page: Page) {}

	/**
	 * Navigates to an application-relative path using Playwright's configured base URL.
	 *
	 * @param path - Application-relative URL path to open.
	 * @returns A promise that resolves when the page load completes.
	 */
	protected async navigateTo(path: string): Promise<void> {
		await this.page.goto(path);
	}
}
