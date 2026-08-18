import {
	expect,
	test as base,
	type APIRequestContext,
	type Browser,
	type BrowserContext,
	type Page,
	type TestInfo,
} from "@playwright/test";

type AppFixtures = {
	anonymousPage: Page;
	authenticatedPage: Page;
	api: APIRequestContext;
};

// Keep test URLs configurable while ensuring every fixture targets the same app.
function baseURL(testInfo: TestInfo): string {
	const configuredBaseURL = testInfo.project.use.baseURL;
	if (typeof configuredBaseURL !== "string") {
		throw new Error("Playwright baseURL must be configured for application tests.");
	}

	return configuredBaseURL;
}

// A new context prevents cookies, storage, and navigation state leaking between tests.
async function createPage(browser: Browser, testInfo: TestInfo): Promise<{
	context: BrowserContext;
	page: Page;
}> {
	const context = await browser.newContext({ baseURL: baseURL(testInfo) });
	return { context, page: await context.newPage() };
}

export const test = base.extend<AppFixtures>({
	anonymousPage: async ({ browser }, use, testInfo) => {
		const { context, page } = await createPage(browser, testInfo);
		await use(page);
		await context.close();
	},

	authenticatedPage: async ({ browser }, use, testInfo) => {
		const { context, page } = await createPage(browser, testInfo);
		const url = new URL(baseURL(testInfo));

		// The frontend only inspects the token payload role, so no external login is needed.
		await context.addCookies([
			{
				name: "jwt",
				value: "eyJhbGciOiJub25lIn0.eyJyb2xlIjoidXNlciJ9.test-signature",
				domain: url.hostname,
				path: "/",
			},
		]);

		await use(page);
		await context.close();
	},

	api: async ({ playwright }, use, testInfo) => {
		// Dispose the API context after each test to avoid shared request state.
		const api = await playwright.request.newContext({ baseURL: baseURL(testInfo) });
		await use(api);
		await api.dispose();
	},
});

export { expect };