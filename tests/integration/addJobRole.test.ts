import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Only the axios boundary (apiClient) is mocked so the real router, controller
// and JobRoleService run together for the add-new-role workflow specifically.
const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock("../../src/config/apiClient.js", () => ({
	default: { get, post },
	apiClient: { get, post },
}));

const { default: app } = await import("../../src/app.js");

/** Builds a fake JWT whose payload decodes to the given role, matching decodeAuthenticatedUser. */
function buildJwt(role: "user" | "admin"): string {
	const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
	return `header.${payload}.signature`;
}

const adminToken = buildJwt("admin");
const userToken = buildJwt("user");

const capabilities = [
	{ capabilityId: 3, capabilityName: "Engineering" },
	{ capabilityId: 4, capabilityName: "Data" },
];
const bands = [
	{ bandId: 2, bandName: "Associate" },
	{ bandId: 5, bandName: "Consultant" },
];

const validSubmission = {
	roleName: "Backend Developer",
	location: "Belfast",
	capabilityId: "3",
	bandId: "2",
	closingDate: "2026-10-01",
	description: "Build backend services.",
	responsibilities: "Design APIs. Write tests.",
	numberOfOpenPositions: "1",
};

const createdJobRole = {
	jobRoleId: 9,
	roleName: "Backend Developer",
	location: "Belfast",
	capability: capabilities[0],
	band: bands[0],
	closingDate: "2026-10-01T00:00:00.000Z",
	status: { statusId: 1, statusName: "Open" },
	description: "Build backend services.",
	responsibilities: "Design APIs. Write tests.",
	sharepointUrl: "https://kainos.sharepoint.com/job-specs/9",
	numberOfOpenPositions: 1,
};

describe("add new job role workflow", () => {
	beforeEach(() => {
		get.mockReset();
		post.mockReset();
		get.mockImplementation((url: string) => {
			if (url === "capabilities")
				return Promise.resolve({ data: capabilities });
			if (url === "bands") return Promise.resolve({ data: bands });
			if (url === "job-roles/9")
				return Promise.resolve({ data: createdJobRole });
			throw new Error(`Unexpected GET ${url}`);
		});
	});

	it("loads the create form with capabilities and bands mapped to their names", async () => {
		const response = await request(app)
			.get("/jobs/job-roles/new")
			.set("Cookie", [`jwt=${adminToken}`]);

		expect(response.status).toBe(200);
		expect(response.text).toContain("Engineering");
		expect(response.text).toContain("Data");
		expect(response.text).toContain("Associate");
		expect(response.text).toContain("Consultant");
		expect(get).toHaveBeenCalledWith("capabilities", {
			headers: { Authorization: `Bearer ${adminToken}` },
		});
		expect(get).toHaveBeenCalledWith("bands", {
			headers: { Authorization: `Bearer ${adminToken}` },
		});
	});

	it("creates a role, sending the selected capability and band ids to the API", async () => {
		post.mockResolvedValue({ data: createdJobRole });

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send(validSubmission);

		expect(post).toHaveBeenCalledWith(
			"job-roles",
			expect.objectContaining({ capabilityId: 3, bandId: 2 }),
			{ headers: { Authorization: `Bearer ${adminToken}` } },
		);
		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/jobs/job-roles/9");
	});

	it("retrieves the created role and displays its mapped capability and band names", async () => {
		post.mockResolvedValue({ data: createdJobRole });

		const createResponse = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send(validSubmission);

		const detailResponse = await request(app)
			.get(createResponse.headers.location)
			.set("Cookie", [`jwt=${adminToken}`]);

		expect(detailResponse.status).toBe(200);
		expect(detailResponse.text).toContain("Backend Developer");
		expect(detailResponse.text).toContain("Engineering");
		expect(detailResponse.text).toContain("Associate");
	});

	it("re-renders the form with field errors and does not call the API when required fields are missing", async () => {
		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send({ ...validSubmission, roleName: "" });

		expect(response.status).toBe(400);
		expect(response.text).toContain("Role name is required");
		expect(post).not.toHaveBeenCalled();
	});

	it("rejects a closing date in the past and does not call the API", async () => {
		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send({ ...validSubmission, closingDate: "2020-01-01" });

		expect(response.status).toBe(400);
		expect(response.text).toContain("Closing date must not be in the past");
		expect(post).not.toHaveBeenCalled();
	});

	it("accepts today's date as the closing date", async () => {
		post.mockResolvedValue({ data: createdJobRole });
		const todayIsoDate = new Date().toISOString().slice(0, 10);

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send({ ...validSubmission, closingDate: todayIsoDate });

		expect(response.status).toBe(302);
		expect(post).toHaveBeenCalled();
	});

	it("renders a closing date that carries an end-of-day time component as a date only", async () => {
		get.mockImplementation((url: string) => {
			if (url === "capabilities")
				return Promise.resolve({ data: capabilities });
			if (url === "bands") return Promise.resolve({ data: bands });
			if (url === "job-roles/9") {
				return Promise.resolve({
					data: { ...createdJobRole, closingDate: "2026-10-01T23:59:59.999Z" },
				});
			}
			throw new Error(`Unexpected GET ${url}`);
		});

		const response = await request(app)
			.get("/jobs/job-roles/9")
			.set("Cookie", [`jwt=${adminToken}`]);

		expect(response.status).toBe(200);
		expect(response.text).toContain("2026-10-01");
		expect(response.text).not.toContain("23:59:59");
	});

	it("renders each backend field error against its own input", async () => {
		post.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 400,
				data: {
					message: "Invalid job role details",
					errors: [
						{ field: "roleName", message: "Role name must not be empty" },
					],
				},
			},
		});

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send(validSubmission);

		expect(response.status).toBe(400);
		expect(response.text).toContain("Role name must not be empty");
		expect(response.text).toContain('id="roleName-error"');
	});

	it("renders multiple backend field errors at once, each against its own input", async () => {
		post.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 400,
				data: {
					message: "Invalid job role details",
					errors: [
						{ field: "roleName", message: "Role name must not be empty" },
						{
							field: "closingDate",
							message: "Closing date must be in the future",
						},
					],
				},
			},
		});

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send(validSubmission);

		expect(response.status).toBe(400);
		expect(response.text).toContain("Role name must not be empty");
		expect(response.text).toContain("Closing date must be in the future");
	});

	it("combines multiple backend messages for the same field against one input", async () => {
		post.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 400,
				data: {
					message: "Invalid job role details",
					errors: [
						{ field: "roleName", message: "Role name must not be empty" },
						{
							field: "roleName",
							message: "Role name must be under 100 characters",
						},
					],
				},
			},
		});

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send(validSubmission);

		expect(response.status).toBe(400);
		expect(response.text).toContain(
			"Role name must not be empty Role name must be under 100 characters",
		);
	});

	it("shows a field error for an unrecognised field name in the general error area instead of dropping it", async () => {
		post.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 400,
				data: {
					message: "Invalid job role details",
					errors: [
						{ field: "sharepointUrl", message: "Sharepoint URL is invalid" },
					],
				},
			},
		});

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send(validSubmission);

		expect(response.status).toBe(400);
		expect(response.text).toContain("Sharepoint URL is invalid");
	});

	it("falls back to the top-level message when the backend sends no field errors", async () => {
		post.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 400,
				data: { message: "Invalid job role details" },
			},
		});

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send(validSubmission);

		expect(response.status).toBe(400);
		expect(response.text).toContain("Invalid job role details");
	});

	it("shows the backend's message when the capability id does not map to a real capability", async () => {
		post.mockRejectedValue({
			isAxiosError: true,
			response: { status: 404, data: { message: "Capability not found" } },
		});

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send({ ...validSubmission, capabilityId: "999" });

		expect(response.status).toBe(400);
		expect(response.text).toContain("Capability not found");
	});

	it("shows the backend's message when the band id does not map to a real band", async () => {
		post.mockRejectedValue({
			isAxiosError: true,
			response: { status: 404, data: { message: "Band not found" } },
		});

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send({ ...validSubmission, bandId: "999" });

		expect(response.status).toBe(400);
		expect(response.text).toContain("Band not found");
	});

	it("shows the backend's own message when it rejects the request as forbidden", async () => {
		post.mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 403,
				data: {
					message: "Users can only access list and information endpoints",
				},
			},
		});

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send(validSubmission);

		expect(response.status).toBe(403);
		expect(response.text).toContain(
			"Users can only access list and information endpoints",
		);
	});

	it("shows a forbidden page when the backend rejects the request as forbidden", async () => {
		post.mockRejectedValue({
			isAxiosError: true,
			response: { status: 403, data: {} },
		});

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send(validSubmission);

		expect(response.status).toBe(403);
		expect(response.text).toContain("Forbidden");
	});

	it("shows a generic message instead of the raw backend error for an unmapped failure", async () => {
		post.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:4000"));

		const response = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${adminToken}`])
			.type("form")
			.send(validSubmission);

		expect(response.status).toBe(400);
		expect(response.text).toContain(
			"We couldn&#39;t create this job role right now. Please try again.",
		);
		expect(response.text).not.toContain("ECONNREFUSED");
	});

	it("blocks non-admins from reaching the create form or endpoint without calling the API", async () => {
		const formResponse = await request(app)
			.get("/jobs/job-roles/new")
			.set("Cookie", [`jwt=${userToken}`]);
		expect(formResponse.status).toBe(403);

		const createResponse = await request(app)
			.post("/jobs/job-roles")
			.set("Cookie", [`jwt=${userToken}`])
			.type("form")
			.send(validSubmission);
		expect(createResponse.status).toBe(403);

		expect(get).not.toHaveBeenCalled();
		expect(post).not.toHaveBeenCalled();
	});

	it("redirects unauthenticated requests to login without calling the API", async () => {
		const response = await request(app).get("/jobs/job-roles/new");

		expect(response.status).toBe(302);
		expect(response.headers.location).toContain("/auth/login");
		expect(get).not.toHaveBeenCalled();
	});
});
