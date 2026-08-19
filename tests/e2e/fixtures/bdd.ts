import { test as base } from "playwright-bdd";

export type RegisteredAccount = {
	email?: string;
};

// Carries the job role picked in a When step through to the Then assertions.
export type SelectedJobRole = {
	name?: string;
};

export const test = base.extend<{
	registeredAccount: RegisteredAccount;
	selectedJobRole: SelectedJobRole;
}>({
	registeredAccount: async ({ page: _page }, use) => {
		await use({});
	},
	selectedJobRole: async ({ page: _page }, use) => {
		await use({});
	},
});