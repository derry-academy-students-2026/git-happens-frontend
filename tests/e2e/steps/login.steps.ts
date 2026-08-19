import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures/bdd.js";
import { LoginPage } from "../pages/login.page.js";

const { Given, When, Then } = createBdd(test);

Given("I am on the login page", async ({ page }) => {
	await new LoginPage(page).navigate();
});

Given(
	"I have attempted to sign in with invalid credentials",
	async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.navigate();
		await loginPage.signIn("test1@example.com", "wrongpassword");
		await expect(loginPage.errorMessage).toBeVisible();
	},
);

When(
	"I sign in with email {string} and password {string}",
	async ({ page }, email: string, password: string) => {
		await new LoginPage(page).signIn(email, password);
	},
);

When(
	"I sign in with the registered email and password {string}",
	async ({ page, registeredAccount }, password: string) => {
		if (!registeredAccount.email) {
			throw new Error("No registered email is available for this scenario.");
		}
		await new LoginPage(page).signIn(registeredAccount.email, password);
	},
);

When("I visit the protected job role list", async ({ page }) => {
	await page.goto("/jobs/job-roles");
});

Then("I should be taken to the job role list", async ({ page }) => {
	await expect(page).toHaveURL("/jobs/job-roles");
	await expect(page).toHaveTitle("Open job roles | Kainos");
});

Then("I should see an invalid credentials message", async ({ page }) => {
	const loginPage = new LoginPage(page);
	await expect(page).toHaveURL("/auth/login");
	await expect(page).toHaveTitle("Login | Kainos");
	await expect(loginPage.errorMessage).toBeVisible();
});

Then(
	"I should be returned to the login page for the job role list",
	async ({ page }) => {
		await expect(page).toHaveURL("/auth/login?returnTo=%2Fjobs%2Fjob-roles");
		await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
	},
);
