import { test as base } from "playwright-bdd";

export type RegisteredAccount = {
	email?: string;
};

export const test = base.extend<{ registeredAccount: RegisteredAccount }>({
	registeredAccount: async ({}, use) => {
		await use({});
	},
});