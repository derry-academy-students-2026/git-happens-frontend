import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAllJobRoles } = vi.hoisted(() => ({ getAllJobRoles: vi.fn() }));

vi.mock("../../src/services/JobRoleService.js", () => ({
	JobRoleService: class {
		getAllJobRoles = getAllJobRoles;
	},
}));

const { default: app } = await import("../../src/app.js");

describe("jobRouter", () => {
	beforeEach(() => {
		getAllJobRoles.mockReset();
	});

	it("renders the index page", async () => {
		const response = await request(app).get("/jobs");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Browse open roles");
	});

	it("renders the roles returned by the service", async () => {
		getAllJobRoles.mockResolvedValue([
			{
				jobRoleId: 1,
				roleName: "Frontend Developer",
				location: "Derry",
				capability: "Engineering",
				band: "Associate",
				closingDate: "2026-09-04",
				status: "Open",
			},
			{
				jobRoleId: 2,
				roleName: "Data Engineer",
				location: "Belfast",
				capability: "Data",
				band: "Consultant",
				closingDate: "2026-07-01",
				status: "Closed",
			},
		]);

		const response = await request(app).get("/jobs/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Frontend Developer");
		expect(response.text).toContain("Derry");
		expect(response.text).toContain("Engineering");
		expect(response.text).toContain("Associate");
		expect(response.text).toContain("2026-09-04");
		expect(response.text).toContain("2 roles");
	});

	it("shows the open or closed status for every role", async () => {
		getAllJobRoles.mockResolvedValue([
			{
				jobRoleId: 1,
				roleName: "Frontend Developer",
				location: "Derry",
				capability: "Engineering",
				band: "Associate",
				closingDate: "2026-09-04",
				status: "Open",
			},
			{
				jobRoleId: 2,
				roleName: "Data Engineer",
				location: "Belfast",
				capability: "Data",
				band: "Consultant",
				closingDate: "2026-07-01",
				status: "Closed",
			},
		]);

		const response = await request(app).get("/jobs/job-roles");

		expect(response.text).toContain("job-status--open");
		expect(response.text).toContain("job-status--closed");
		expect(response.text).toContain("Data Engineer");
		expect(response.text).toContain("2026-07-01");
	});

	it("renders an empty state when there are no open roles", async () => {
		getAllJobRoles.mockResolvedValue([]);

		const response = await request(app).get("/jobs/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"There are no job roles to show right now.",
		);
	});

	it("renders the error page when the service fails", async () => {
		getAllJobRoles.mockRejectedValue(new Error("service unavailable"));

		const response = await request(app).get("/jobs/job-roles");

		expect(response.status).toBe(500);
		expect(response.text).toContain("Something went wrong");
	});
});
