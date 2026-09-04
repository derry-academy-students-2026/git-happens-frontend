import { randomUUID } from "node:crypto";
import { expect, test } from "../fixtures/test.js";

const password = "Password123!";

test.describe("Job applications", () => {
	test("lets a signed-in user submit an application, then blocks a second attempt for the same role", async ({
		registerPage,
		loginPage,
		jobRoleListPage,
		jobRoleDetailPage,
		jobApplicationPage,
		page,
	}) => {
		const email = `${randomUUID()}-applicant@example.com`;

		await registerPage.navigate();
		await registerPage.register(email, password, password);
		await expect(page).toHaveURL("/auth/login?registered=1");
		await loginPage.signIn(email, password);

		await jobRoleListPage.navigate();
		await jobRoleListPage.firstRole.click();

		await expect(jobRoleDetailPage.applyNowLink).toBeVisible();
		await jobRoleDetailPage.applyNowLink.click();

		await expect(page).toHaveURL(/\/applications\/job-roles\/\d+\/apply$/);
		const applyUrl = page.url();

		await jobApplicationPage.submitApplication({
			fullName: "Test Applicant",
			email,
			countryCode: "+44",
			phoneNumber: "07123456789",
			applicationText: "I am excited to apply for this role.",
		});

		await expect(page).toHaveURL(/\/applications\/job-roles\/\d+\?applied=1$/);
		await expect(jobRoleDetailPage.successBanner).toBeVisible();
		await expect(jobRoleDetailPage.successBanner).toContainText(
			"Application submitted!",
		);

		// Re-submitting the same role must be rejected rather than silently accepted.
		await page.goto(applyUrl);
		await jobApplicationPage.submitApplication({
			fullName: "Test Applicant",
			email,
			countryCode: "+44",
			phoneNumber: "07123456789",
			applicationText: "Trying to apply a second time.",
		});

		await expect(page).toHaveURL(
			/\/applications\/job-roles\/\d+\?alreadyApplied=1$/,
		);
		await expect(jobRoleDetailPage.alreadyAppliedNotice).toBeVisible();
		await expect(jobRoleDetailPage.alreadyAppliedNotice).toContainText(
			"You've already applied",
		);
	});

	test("redirects an unauthenticated visitor to login when requesting the apply page", async ({
		page,
	}) => {
		await page.goto("/applications/job-roles/1/apply");

		await expect(page).toHaveURL(
			"/auth/login?returnTo=%2Fapplications%2Fjob-roles%2F1%2Fapply",
		);
	});
});
