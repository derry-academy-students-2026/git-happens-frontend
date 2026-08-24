import { expect, test } from "../fixtures/test.js";

test.describe("Job role browsing", () => {
	test("returns a signed-in visitor to their requested job-role list", async ({
		jobRoleListPage,
		loginPage,
		page,
	}) => {
		await jobRoleListPage.navigate();

		await expect(page).toHaveURL("/auth/login?returnTo=%2Fjobs%2Fjob-roles");
		await loginPage.signIn("test1@example.com", "password123!");

		await expect(page).toHaveURL("/jobs/job-roles");
		await expect(jobRoleListPage.heading).toBeVisible();
		await expect(jobRoleListPage.firstRole).toBeVisible();
	});

	test("opens a role, exposes its specification, and returns to the list", async ({
		authenticatedJobRoleListPage,
		jobRoleDetailPage,
		page,
	}) => {
		const roleName = await authenticatedJobRoleListPage.getFirstRoleName();
		await authenticatedJobRoleListPage.firstRole.click();

		await expect(page).toHaveURL(/\/jobs\/job-roles\/\d+$/);
		await expect(page.getByRole("heading", { name: roleName })).toBeVisible();
		await expect(jobRoleDetailPage.roleDetailsHeading).toBeVisible();
		await expect(jobRoleDetailPage.jobSpecLink).toHaveAttribute(
			"target",
			"_blank",
		);

		await jobRoleDetailPage.backToRolesLink.click();

		await expect(page).toHaveURL("/jobs/job-roles");
		await expect(authenticatedJobRoleListPage.heading).toBeVisible();
	});

	test("displays error page when accessing a non-existent job role", async ({
		authenticatedJobRoleListPage,
		errorPage,
		page,
	}) => {
		await authenticatedJobRoleListPage.navigate();
		await page.goto("/jobs/job-roles/99999");

		await expect(page).toHaveURL("/jobs/job-roles/99999");
		await expect(errorPage.heading).toBeVisible();
		await expect(errorPage.errorMessage).toBeVisible();
	});
});
