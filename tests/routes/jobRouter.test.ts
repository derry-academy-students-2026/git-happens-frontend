import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAllJobRoles, getJobRoleById } = vi.hoisted(() => ({
	getAllJobRoles: vi.fn(),
	getJobRoleById: vi.fn(),
}));

vi.mock("../../src/services/JobRoleService.js", () => ({
	JobRoleService: class {
		getAllJobRoles = getAllJobRoles;
		getJobRoleById = getJobRoleById;
	},
}));

const { default: app } = await import("../../src/app.js");

const jobRoles = [
	{
		jobRoleId: 1,
		roleName: "Frontend Developer",
		location: "Derry",
		capability: { capabilityId: 3, capabilityName: "Engineering" },
		band: { bandId: 2, bandName: "Associate" },
		closingDate: "2026-09-04T00:00:00.000Z",
		status: { statusId: 1, statusName: "Open" },
		description: "Build and maintain our customer-facing web applications.",
		responsibilities: "Write code. Review pull requests. Fix bugs.",
		sharepointUrl: "https://kainos.sharepoint.com/job-specs/1",
		numberOfOpenPositions: 2,
	},
	{
		jobRoleId: 2,
		roleName: "Data Engineer",
		location: "Belfast",
		capability: { capabilityId: 4, capabilityName: "Data" },
		band: { bandId: 5, bandName: "Consultant" },
		closingDate: "2026-07-01T00:00:00.000Z",
		status: { statusId: 2, statusName: "Closed" },
		description: "Build and operate data pipelines for analytics.",
		responsibilities: "Model data. Build pipelines. Monitor quality.",
		sharepointUrl: "https://kainos.sharepoint.com/job-specs/2",
		numberOfOpenPositions: 1,
	},
];

describe("jobRouter", () => {
	beforeEach(() => {
		getAllJobRoles.mockReset();
		getJobRoleById.mockReset();
	});

	it("renders the index page", async () => {
		const response = await request(app).get("/jobs");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Browse open roles");
		expect(response.text).toContain('href="/auth/login"');
		expect(response.text).not.toContain("Log out");
	});

	it("renders the roles returned by the service", async () => {
		getAllJobRoles.mockResolvedValue(jobRoles);

		const response = await request(app)
			.get("/jobs/job-roles")
			.set("Cookie", ["jwt=test-token"]);

		expect(response.status).toBe(200);
		expect(response.text).toContain("Frontend Developer");
		expect(response.text).toContain("Derry");
		expect(response.text).toContain("Engineering");
		expect(response.text).toContain("Associate");
		expect(response.text).toContain("2026-09-04");
		expect(response.text).toContain("2 roles");
		expect(response.text).toContain("Log out");
	});

	it("shows the open or closed status for every role", async () => {
		getAllJobRoles.mockResolvedValue(jobRoles);

		const response = await request(app)
			.get("/jobs/job-roles")
			.set("Cookie", ["jwt=test-token"]);

		expect(response.text).toContain("job-status--open");
		expect(response.text).toContain("job-status--closed");
		expect(response.text).toContain("Data Engineer");
		expect(response.text).toContain("2026-07-01");
	});

	it("renders an empty state when there are no open roles", async () => {
		getAllJobRoles.mockResolvedValue([]);

		const response = await request(app)
			.get("/jobs/job-roles")
			.set("Cookie", ["jwt=test-token"]);

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"There are no job roles to show right now.",
		);
	});

	it("renders the error page when the service fails", async () => {
		getAllJobRoles.mockRejectedValue(new Error("service unavailable"));

		const response = await request(app)
			.get("/jobs/job-roles")
			.set("Cookie", ["jwt=test-token"]);

		expect(response.status).toBe(500);
		expect(response.text).toContain("Something went wrong");
	});

	it("links each listed role to its information page", async () => {
		getAllJobRoles.mockResolvedValue(jobRoles);

		const response = await request(app)
			.get("/jobs/job-roles")
			.set("Cookie", ["jwt=test-token"]);

		expect(response.text).toContain('href="/jobs/job-roles/1"');
		expect(response.text).toContain('href="/jobs/job-roles/2"');
	});

	it("renders the information page for a single role", async () => {
		getJobRoleById.mockResolvedValue(jobRoles[0]);

		const response = await request(app)
			.get("/jobs/job-roles/1")
			.set("Cookie", ["jwt=test-token"]);

		expect(getJobRoleById).toHaveBeenCalledWith(1);
		expect(response.status).toBe(200);
		expect(response.text).toContain("Frontend Developer");
		expect(response.text).toContain("Derry");
		expect(response.text).toContain("Engineering");
		expect(response.text).toContain("Associate");
		expect(response.text).toContain("2026-09-04");
		expect(response.text).toContain("job-status--open");
		expect(response.text).toContain(
			"Build and maintain our customer-facing web applications.",
		);
		expect(response.text).toContain(
			"Write code. Review pull requests. Fix bugs.",
		);
		expect(response.text).toContain(
			'href="https://kainos.sharepoint.com/job-specs/1"',
		);
		expect(response.text).toContain("2");
	});

	it("renders a 400 when the id is not a number", async () => {
		const response = await request(app)
			.get("/jobs/job-roles/not-an-id")
			.set("Cookie", ["jwt=test-token"]);

		expect(getJobRoleById).not.toHaveBeenCalled();
		expect(response.status).toBe(400);
		expect(response.text).toContain("That job role id is not valid");
	});

	it("renders a 404 when the role does not exist", async () => {
		getJobRoleById.mockRejectedValue(new Error("Job role not found"));

		const response = await request(app)
			.get("/jobs/job-roles/99")
			.set("Cookie", ["jwt=test-token"]);

		expect(response.status).toBe(404);
		expect(response.text).toContain("Job role not found");
	});

	it("renders a 500 when fetching a single role fails", async () => {
		getJobRoleById.mockRejectedValue(new Error("service unavailable"));

		const response = await request(app)
			.get("/jobs/job-roles/1")
			.set("Cookie", ["jwt=test-token"]);

		expect(response.status).toBe(500);
		expect(response.text).toContain("Something went wrong");
	});

	it("redirects to login when no jwt is present", async () => {
		const response = await request(app).get("/jobs/job-roles");

		expect(response.status).toBe(302);
		expect(response.headers.location).toContain("/auth/login");
		expect(response.headers.location).toContain("returnTo=%2Fjobs%2Fjob-roles");
		expect(getAllJobRoles).not.toHaveBeenCalled();
	});

	it("renders the login page", async () => {
		const response = await request(app).get("/auth/login");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Login");
		expect(response.text).toContain('name="email"');
		expect(response.text).toContain('name="password"');
	});

	it("logs in and sets a jwt cookie", async () => {
		const response = await request(app).post("/auth/login").type("form").send({
			email: "test@example.com",
			password: "password123",
			returnTo: "/jobs/job-roles",
		});

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/jobs/job-roles");
		expect(response.headers["set-cookie"]?.[0]).toContain("jwt=");
	});

	it("shows an error when login credentials are missing", async () => {
		const response = await request(app).post("/auth/login").type("form").send({
			email: "",
			password: "",
		});

		expect(response.status).toBe(401);
		expect(response.text).toContain("Please enter your email and password.");
	});

	it("logs out by clearing the jwt cookie and redirecting to jobs", async () => {
		const response = await request(app)
			.post("/auth/logout")
			.set("Cookie", ["jwt=test-token"]);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/jobs");
		expect(response.headers["set-cookie"]?.[0]).toContain("jwt=;");
	});
});
