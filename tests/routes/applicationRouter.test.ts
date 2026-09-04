import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getApplicationsForUser } = vi.hoisted(() => ({
	getApplicationsForUser: vi.fn(),
}));

vi.mock("../../src/services/applicationService.js", () => ({
	ApplicationServiceImpl: class {
		getApplicationsForUser = getApplicationsForUser;
	},
}));

vi.mock("../../src/services/JobRoleService.js", () => ({
	JobRoleService: class {},
}));

const { default: app } = await import("../../src/app.js");

/** Builds an unsigned test JWT payload accepted by the frontend decoder. */
function createJwt(subject: string, role: "admin" | "user" = "user"): string {
	const payload = Buffer.from(
		JSON.stringify({ sub: subject, email: "applicant@example.com", role }),
	).toString("base64url");
	return `header.${payload}.signature`;
}

describe("applicationRouter", () => {
	beforeEach(() => {
		getApplicationsForUser.mockReset();
	});

	it("lists applications using the user id from the JWT subject", async () => {
		getApplicationsForUser.mockResolvedValue([
			{
				applicationId: 10,
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Remote",
				applicationStatus: "IN_PROGRESS",
				createdAt: "2026-08-14T00:00:00.000Z",
			},
		]);

		const response = await request(app)
			.get("/applications")
			.set("Cookie", [`jwt=${createJwt("7")}`]);

		expect(getApplicationsForUser).toHaveBeenCalledWith("7", expect.any(String));
		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Remote");
		expect(response.text).toContain("IN PROGRESS");
	});

	it("renders an empty state when the user has no applications", async () => {
		getApplicationsForUser.mockResolvedValue([]);

		const response = await request(app)
			.get("/applications")
			.set("Cookie", [`jwt=${createJwt("7")}`]);

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"You have not submitted any job applications yet.",
		);
	});

	it("redirects an unauthenticated visitor to login", async () => {
		const response = await request(app).get("/applications");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe(
			"/auth/login?returnTo=%2Fapplications",
		);
	});

	it("forbids administrators from viewing applicant applications", async () => {
		const response = await request(app)
			.get("/applications")
			.set("Cookie", [`jwt=${createJwt("7", "admin")}`]);

		expect(response.status).toBe(403);
		expect(response.text).toContain("Forbidden");
		expect(response.text).not.toContain('href="/applications"');
		expect(getApplicationsForUser).not.toHaveBeenCalled();
	});
});