import { randomUUID } from "node:crypto";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures/bdd.js";
import { RegisterPage } from "../pages/register.page.js";

const { Given, When, Then } = createBdd(test);

Given("I am on the register page", async ({ page }) => {
	await new RegisterPage(page).navigate();
});

When(
    "I register with email {string} and password {string} and confirm password {string}",
    async (
        { page, registeredAccount },
        email: string,
        password: string,
        confirmPassword: string,
    ) => {
        const registeredEmail = `${randomUUID()}-${email}`;
        registeredAccount.email = registeredEmail;
        await new RegisterPage(page).register(
            registeredEmail,
            password,
            confirmPassword,
        );
    },
);

Then("I should see an invalid details message", async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await expect(page).toHaveURL("/auth/register");
    await expect(registerPage.errorMessage).toBeVisible();
});

Then("I should see a password confirmation error", async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await expect(page).toHaveURL("/auth/register");
    await expect(registerPage.errorMessage).toContainText("Passwords do not match");
});

Then(
	"I should be returned to the login page after registration",
	async ({ page }) => {
		await expect(page).toHaveURL("/auth/login?registered=1");
		await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
	},
);

