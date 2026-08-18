import { expect, test } from "../fixtures/test.js";

test.describe("Careers landing page", () => {
	test("sends visitors to login before they browse roles", async ({
		homePage,
		page,
	}) => {
		await homePage.navigate();

		await expect(page).toHaveTitle("Careers | Kainos");
		await expect(
			page.getByRole("heading", { name: "Your Kainos story starts here" }),
		).toBeVisible();

		await homePage.browseRolesLink.click();

		await expect(page).toHaveURL("/auth/login?returnTo=%2Fjobs%2Fjob-roles");
	});
});