import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { RegisterPage } from "../pages/register.page.js";
import { randomUUID } from "node:crypto";

const { Given, When, Then } = createBdd();

Given("I am on the register page", async ({ page }) => {
    await new RegisterPage(page).navigate();
});

When(
    "I register with email {string} and password {string} and confirm password {string}",
    async ({ page }, email: string, password: string, confirmPassword: string) => {
        await new RegisterPage(page).register(randomUUID()+ email, password, confirmPassword);
    },
);

Then ("I should see an invalid details message", async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await expect(page).toHaveURL("/auth/register");
    await expect(registerPage.errorMessage).toBeVisible();
});

Then(
	"I should be returned to the login page after registration",
	async ({ page }) => {
		await expect(page).toHaveURL("/auth/login?registered=1");
		await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
	},
);

