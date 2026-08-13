import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("../../src/config/apiClient.js", () => ({
	default: { get },
	apiClient: { get },
}));

const { default: app } = await import("../../src/app.js");

// Mirrors a real GET /job-roles response, nested objects and ISO dates included.
const apiResponse = [
	{
		jobRoleId: 1,
		roleName: "Executive Assistant",
		location: "New York, NY",
		capability: { capabilityId: 9, capabilityName: "Administration" },
		band: { bandId: 8, bandName: "Band 2 - Mid-Level" },
		closingDate: "2024-09-30T00:00:00.000Z",
		status: { statusId: 1, statusName: "Open" },
		description: "Support senior leaders with scheduling and correspondence.",
		responsibilities: "Manage diaries. Coordinate travel. Prepare reports.",
		sharepointUrl: "https://kainos.sharepoint.com/job-specs/1",
		numberOfOpenPositions: 1,
	},
	{
		jobRoleId: 2,
		roleName: "Senior Software Engineer",
		location: "Remote",
		capability: { capabilityId: 6, capabilityName: "Software Engineering" },
		band: { bandId: 10, bandName: "Band 3 - Senior" },
		closingDate: "2024-10-15T00:00:00.000Z",
		status: { statusId: 2, statusName: "Closed" },
		description: "Design and build backend services at scale.",
		responsibilities: "Design APIs. Write tests. Mentor juniors.",
		sharepointUrl: "https://kainos.sharepoint.com/job-specs/2",
		numberOfOpenPositions: 3,
	},
];

describe("job role list page", () => {
	beforeEach(() => {
		get.mockReset();
	});

	it("flattens the nested capability and band onto the page", async () => {
		get.mockResolvedValue({ data: apiResponse });

		const response = await request(app).get("/jobs/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Administration");
		expect(response.text).toContain("Band 2 - Mid-Level");
		expect(response.text).toContain("Software Engineering");
		expect(response.text).toContain("Band 3 - Senior");
	});

	it("renders the closing date without the ISO time portion", async () => {
		get.mockResolvedValue({ data: apiResponse });

		const response = await request(app).get("/jobs/job-roles");

		expect(response.text).toContain("2024-09-30");
		expect(response.text).not.toContain("T00:00:00.000Z");
	});

	it("badges each role using the status casing the API sends", async () => {
		get.mockResolvedValue({ data: apiResponse });

		const response = await request(app).get("/jobs/job-roles");

		expect(response.text).toContain("job-status--open");
		expect(response.text).toContain("job-status--closed");
		expect(response.text).not.toContain("job-status--Open");
	});

	it("lists every role the API returns, open or closed", async () => {
		get.mockResolvedValue({ data: apiResponse });

		const response = await request(app).get("/jobs/job-roles");

		expect(response.text).toContain("Executive Assistant");
		expect(response.text).toContain("Senior Software Engineer");
		expect(response.text).toContain("2 roles");
	});

	it("renders the empty state when the API returns no roles", async () => {
		get.mockResolvedValue({ data: [] });

		const response = await request(app).get("/jobs/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"There are no job roles to show right now.",
		);
	});

	it("renders the error page when the API call fails", async () => {
		get.mockRejectedValue(new Error("connect ECONNREFUSED"));

		const response = await request(app).get("/jobs/job-roles");

		expect(response.status).toBe(500);
		expect(response.text).toContain("Something went wrong");
	});
});
