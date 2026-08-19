import { expect } from "@playwright/test";
import { createBdd, type DataTable } from "playwright-bdd";
import { test } from "../fixtures/bdd.js";
import { ErrorPage } from "../pages/error.page.js";
import { JobRoleDetailPage } from "../pages/job-role-detail.page.js";
import { JobRoleListPage } from "../pages/job-role-list.page.js";
import { LoginPage } from "../pages/login.page.js";

const { Given, When, Then } = createBdd(test);

// Seeded account used by the existing login journeys, reused here to reach the protected pages.
const APPLICANT_EMAIL = "test1@example.com";
const APPLICANT_PASSWORD = "password123!";

Given("I am signed in and viewing the job role list", async ({ page }) => {
	console.info("[job-specification] Signing in as %s", APPLICANT_EMAIL);
	const loginPage = new LoginPage(page);
	await loginPage.navigate();
	await loginPage.signIn(APPLICANT_EMAIL, APPLICANT_PASSWORD);

	const jobRoleListPage = new JobRoleListPage(page);
	await expect(
		page,
		"Signing in should land the applicant on the job role list.",
	).toHaveURL("/jobs/job-roles");
	await expect(
		jobRoleListPage.heading,
		"The job role list heading should be visible before browsing specifications.",
	).toBeVisible();
	console.info("[job-specification] Job role list is ready");
});

Given("I am signed out", async ({ context }) => {
	// Dropping cookies removes the session so access control can be exercised.
	console.info("[job-specification] Clearing the session cookies");
	await context.clearCookies();
});

When(
	"I click on the first job role name",
	async ({ page, selectedJobRole }) => {
		const jobRoleListPage = new JobRoleListPage(page);
		selectedJobRole.name = (await jobRoleListPage.getFirstRoleName()).trim();
		console.info(
			"[job-specification] Opening job role %s",
			selectedJobRole.name,
		);
		await jobRoleListPage.firstRole.click();
	},
);

When(
	"I open the job role specification page for id {string}",
	async ({ page }, jobRoleId: string) => {
		console.info(
			"[job-specification] Navigating directly to job role id %s",
			jobRoleId,
		);
		await new JobRoleDetailPage(page).navigateToRole(jobRoleId);
	},
);

When("I choose to go back to all roles", async ({ page }) => {
	console.info("[job-specification] Following the back to all roles link");
	await new JobRoleDetailPage(page).backToRolesLink.click();
});

Then(
	"I should be taken to that job role's specification page",
	async ({ page, selectedJobRole }) => {
		const roleName = selectedJobRole.name;
		if (!roleName) {
			throw new Error("No job role was selected in this scenario.");
		}

		await expect(
			page,
			"Clicking a job role name should open its specification page.",
		).toHaveURL(/\/jobs\/job-roles\/\d+$/);
		await expect(
			page.getByRole("heading", { name: roleName }),
			`The specification page should be headed with the selected role: ${roleName}`,
		).toBeVisible();
		console.info(
			"[job-specification] Specification page shown at %s",
			page.url(),
		);
	},
);

Then("I should see the role details section", async ({ page }) => {
	await expect(
		new JobRoleDetailPage(page).roleDetailsHeading,
		"The specification page should show the role details section.",
	).toBeVisible();
});

Then(
	"I should see the following specification details",
	async ({ page }, dataTable: DataTable) => {
		const jobRoleDetailPage = new JobRoleDetailPage(page);
		// Each data table row holds a single specification label expected on the page.
		for (const [label] of dataTable.raw()) {
			console.info("[job-specification] Checking detail label %s", label);
			await expect(
				jobRoleDetailPage.specificationDetail(label),
				`The specification should include the "${label}" detail.`,
			).toBeVisible();
		}
	},
);

Then(
	"I should see the {string} specification section",
	async ({ page }, sectionName: string) => {
		console.info("[job-specification] Checking section %s", sectionName);
		await expect(
			new JobRoleDetailPage(page).specificationSection(sectionName),
			`The specification should include a "${sectionName}" section.`,
		).toBeVisible();
	},
);

Then("the job spec link should open in a new tab", async ({ page }) => {
	const jobSpecLink = new JobRoleDetailPage(page).jobSpecLink;
	await expect(
		jobSpecLink,
		"The full job spec link should be available on the specification page.",
	).toBeVisible();
	await expect(
		jobSpecLink,
		"The full job spec should open in a new tab so the role page is not lost.",
	).toHaveAttribute("target", "_blank");
	await expect(
		jobSpecLink,
		"An externally opened link should be protected with noopener.",
	).toHaveAttribute("rel", /noopener/);
});

Then("I should be back on the job role list", async ({ page }) => {
	await expect(
		page,
		"Going back should return the applicant to the job role list.",
	).toHaveURL("/jobs/job-roles");
	await expect(
		new JobRoleListPage(page).heading,
		"The job role list heading should be visible again.",
	).toBeVisible();
});

Then("I should see the job role error page", async ({ page }) => {
	const errorPage = new ErrorPage(page);
	await expect(
		errorPage.heading,
		"An unknown job role should show the error page heading.",
	).toBeVisible();
	await expect(
		errorPage.errorMessage,
		"An unknown job role should explain what went wrong.",
	).toBeVisible();
});

Then(
	"I should be asked to sign in before seeing the specification",
	async ({ page }) => {
		await expect(
			page,
			"Signed out access should redirect to login with the requested return path.",
		).toHaveURL(/\/auth\/login\?returnTo=/);
		await expect(
			page.getByRole("heading", { name: "Login" }),
			"The login page heading should be visible after an access-control redirect.",
		).toBeVisible();
	},
);
