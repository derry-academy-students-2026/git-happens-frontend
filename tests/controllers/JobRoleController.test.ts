import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/JobRoleController.js";
import type { ApplicationApiService } from "../../src/services/applicationApiService.js";
import type { JobRoleService } from "../../src/services/JobRoleService.js";

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
];

function createResponse() {
	const res = {
		clearCookie: vi.fn(),
		render: vi.fn(),
		status: vi.fn(),
		redirect: vi.fn(),
	};
	res.status.mockReturnValue(res);
	return res as unknown as Response & typeof res;
}

function createService(getAllJobRoles: JobRoleService["getAllJobRoles"]) {
	return { getAllJobRoles } as JobRoleService;
}

function createApplicationService(
	applyForRole: ApplicationApiService["applyForRole"] = vi.fn(),
) {
	return { applyForRole } as unknown as ApplicationApiService;
}

function createAuthenticatedRequest(params: Record<string, string> = {}) {
	return {
		authenticatedUser: { token: "jwt-token", role: "user" },
		originalUrl: "/jobs/job-roles",
		params,
	} as unknown as Request;
}

describe("JobRoleController.getAll", () => {
	it("renders the job role list with the roles from the service", async () => {
		const getAllJobRoles = vi.fn().mockResolvedValue(jobRoles);
		const controller = new JobRoleController(
			createService(getAllJobRoles),
			createApplicationService(),
		);
		const res = createResponse();

		await controller.getAll(createAuthenticatedRequest(), res);

		expect(getAllJobRoles).toHaveBeenCalledWith("jwt-token");
		expect(res.render).toHaveBeenCalledWith("pages/job-role-list.njk", {
			jobRoles,
		});
		expect(res.status).not.toHaveBeenCalled();
	});

	it("renders the error page with a 500 when the service rejects", async () => {
		const getAllJobRoles = vi.fn().mockRejectedValue(new Error("db down"));
		const controller = new JobRoleController(
			createService(getAllJobRoles),
			createApplicationService(),
		);
		const res = createResponse();

		await controller.getAll(createAuthenticatedRequest(), res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Internal Server Error",
		});
	});

	it("renders the error page when the service rejects with a non-Error", async () => {
		const getAllJobRoles = vi.fn().mockRejectedValue("db down");
		const controller = new JobRoleController(
			createService(getAllJobRoles),
			createApplicationService(),
		);
		const res = createResponse();

		await controller.getAll(createAuthenticatedRequest(), res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Internal Server Error",
		});
	});

	it("clears the jwt and redirects when the backend requires authentication", async () => {
		const getAllJobRoles = vi
			.fn()
			.mockRejectedValue(new Error("Authentication required"));
		const controller = new JobRoleController(
			createService(getAllJobRoles),
			createApplicationService(),
		);
		const res = createResponse();

		await controller.getAll(createAuthenticatedRequest(), res);

		expect(res.clearCookie).toHaveBeenCalledWith("jwt", { path: "/" });
		expect(res.redirect).toHaveBeenCalledWith(
			"/auth/login?returnTo=%2Fjobs%2Fjob-roles",
		);
	});
});

function createRequest(id: string) {
	return createAuthenticatedRequest({ id });
}

describe("JobRoleController.getById", () => {
	it("renders the information page with the role from the service", async () => {
		const getJobRoleById = vi.fn().mockResolvedValue(jobRoles[0]);
		const controller = new JobRoleController(
			{
				getJobRoleById,
			} as unknown as JobRoleService,
			createApplicationService(),
		);
		const res = createResponse();

		await controller.getById(createRequest("1"), res);

		expect(getJobRoleById).toHaveBeenCalledWith(1, "jwt-token");
		expect(res.render).toHaveBeenCalledWith("pages/job-role-information.njk", {
			jobRole: jobRoles[0],
			authenticatedUser: { token: "jwt-token", role: "user" },
		});
		expect(res.status).not.toHaveBeenCalled();
	});

	it("renders a 400 without calling the service when the id is not a number", async () => {
		const getJobRoleById = vi.fn();
		const controller = new JobRoleController(
			{
				getJobRoleById,
			} as unknown as JobRoleService,
			createApplicationService(),
		);
		const res = createResponse();

		await controller.getById(createRequest("abc"), res);

		expect(getJobRoleById).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "That job role id is not valid",
		});
	});

	it("renders a 404 when the service reports the role is missing", async () => {
		const getJobRoleById = vi
			.fn()
			.mockRejectedValue(new Error("Job role not found"));
		const controller = new JobRoleController(
			{
				getJobRoleById,
			} as unknown as JobRoleService,
			createApplicationService(),
		);
		const res = createResponse();

		await controller.getById(createRequest("99"), res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Job role not found",
		});
	});

	it("renders a 500 when the service fails for any other reason", async () => {
		const getJobRoleById = vi
			.fn()
			.mockRejectedValue(new Error("Backend server error"));
		const controller = new JobRoleController(
			{
				getJobRoleById,
			} as unknown as JobRoleService,
			createApplicationService(),
		);
		const res = createResponse();

		await controller.getById(createRequest("1"), res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Internal Server Error",
		});
	});

	it("clears the jwt and redirects when fetching detail requires authentication", async () => {
		const getJobRoleById = vi
			.fn()
			.mockRejectedValue(new Error("Authentication required"));
		const controller = new JobRoleController(
			{
				getJobRoleById,
			} as unknown as JobRoleService,
			createApplicationService(),
		);
		const res = createResponse();

		await controller.getById(createRequest("1"), res);

		expect(res.clearCookie).toHaveBeenCalledWith("jwt", { path: "/" });
		expect(res.redirect).toHaveBeenCalledWith(
			"/auth/login?returnTo=%2Fjobs%2Fjob-roles",
		);
	});
});

describe("JobRoleController.showApplyForm", () => {
	it("renders the application form with the job role details", async () => {
		const getJobRoleById = vi.fn().mockResolvedValue(jobRoles[0]);
		const controller = new JobRoleController(
			{
				getJobRoleById,
			} as unknown as JobRoleService,
			createApplicationService(),
		);
		const res = createResponse();

		await controller.showApplyForm(createRequest("1"), res);

		expect(getJobRoleById).toHaveBeenCalledWith(1, "jwt-token");
		expect(res.render).toHaveBeenCalledWith("pages/job-application.njk", {
			jobRole: jobRoles[0],
			authenticatedUser: { token: "jwt-token", role: "user" },
		});
		expect(res.status).not.toHaveBeenCalled();
	});

	it("renders a 400 for an invalid role id", async () => {
		const getJobRoleById = vi.fn();
		const controller = new JobRoleController(
			{
				getJobRoleById,
			} as unknown as JobRoleService,
			createApplicationService(),
		);
		const res = createResponse();

		await controller.showApplyForm(createRequest("abc"), res);

		expect(getJobRoleById).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "That job role id is not valid",
		});
	});

	it("renders a 403 when the role is closed", async () => {
		const closedRole = {
			...jobRoles[0],
			status: { statusId: 2, statusName: "Closed" },
		};
		const getJobRoleById = vi.fn().mockResolvedValue(closedRole);
		const controller = new JobRoleController(
			{
				getJobRoleById,
			} as unknown as JobRoleService,
			createApplicationService(),
		);
		const res = createResponse();

		await controller.showApplyForm(createRequest("1"), res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "This role is not accepting applications",
		});
	});

	it("renders a 403 when there are no open positions", async () => {
		const noPositionsRole = {
			...jobRoles[0],
			numberOfOpenPositions: 0,
		};
		const getJobRoleById = vi.fn().mockResolvedValue(noPositionsRole);
		const controller = new JobRoleController(
			{
				getJobRoleById,
			} as unknown as JobRoleService,
			createApplicationService(),
		);
		const res = createResponse();

		await controller.showApplyForm(createRequest("1"), res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "This role is not accepting applications",
		});
	});

	it("renders a 404 when the role is not found", async () => {
		const getJobRoleById = vi
			.fn()
			.mockRejectedValue(new Error("Job role not found"));
		const controller = new JobRoleController(
			{
				getJobRoleById,
			} as unknown as JobRoleService,
			createApplicationService(),
		);
		const res = createResponse();

		await controller.showApplyForm(createRequest("99"), res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Job role not found",
		});
	});

	it("clears the jwt and redirects on authentication error", async () => {
		const getJobRoleById = vi
			.fn()
			.mockRejectedValue(new Error("Authentication required"));
		const controller = new JobRoleController(
			{
				getJobRoleById,
			} as unknown as JobRoleService,
			createApplicationService(),
		);
		const res = createResponse();

		await controller.showApplyForm(createRequest("1"), res);

		expect(res.clearCookie).toHaveBeenCalledWith("jwt", { path: "/" });
		expect(res.redirect).toHaveBeenCalled();
	});
});

describe("JobRoleController.submitApplication", () => {
	const testApplicationData = {
		fullName: "John Doe",
		countryCode: "+44",
		phoneNumber: "7123456789",
		email: "john@example.com",
		applicationText: "I am interested",
	};

	it("submits an application and redirects to the role detail page", async () => {
		const applyForRole = vi.fn().mockResolvedValue({
			applicationId: 1,
			jobRoleId: 1,
			userId: 10,
			...testApplicationData,
			applicationStatus: "in progress",
			createdAt: "2026-08-14T10:00:00Z",
		});
		const controller = new JobRoleController(
			{} as unknown as JobRoleService,
			createApplicationService(applyForRole),
		);
		const res = createResponse();
		const req = {
			...createRequest("1"),
			body: testApplicationData,
		} as unknown as Request;

		await controller.submitApplication(req, res);

		expect(applyForRole).toHaveBeenCalledWith(1, testApplicationData, "jwt-token");
		expect(res.redirect).toHaveBeenCalledWith("/jobs/job-roles/1?applied=1");
	});

	it("renders a 400 for an invalid role id", async () => {
		const applyForRole = vi.fn();
		const controller = new JobRoleController(
			{} as unknown as JobRoleService,
			createApplicationService(applyForRole),
		);
		const res = createResponse();
		const req = {
			...createRequest("abc"),
			body: testApplicationData,
		} as unknown as Request;

		await controller.submitApplication(req, res);

		expect(applyForRole).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("renders a 400 when full name is missing", async () => {
		const applyForRole = vi.fn();
		const controller = new JobRoleController(
			{} as unknown as JobRoleService,
			createApplicationService(applyForRole),
		);
		const res = createResponse();
		const req = {
			...createRequest("1"),
			body: {
				...testApplicationData,
				fullName: "",
			},
		} as unknown as Request;

		await controller.submitApplication(req, res);

		expect(applyForRole).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalled();
	});

	it("renders a 409 when the application submission fails with a conflict", async () => {
		const applyForRole = vi
			.fn()
			.mockRejectedValue(new Error("You have already applied for this role"));
		const controller = new JobRoleController(
			{} as unknown as JobRoleService,
			createApplicationService(applyForRole),
		);
		const res = createResponse();
		const req = {
			...createRequest("1"),
			body: testApplicationData,
		} as unknown as Request;

		await controller.submitApplication(req, res);

		expect(res.status).toHaveBeenCalledWith(409);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "You have already applied for this role",
		});
	});

	it("clears the jwt and redirects on authentication error", async () => {
		const applyForRole = vi
			.fn()
			.mockRejectedValue(new Error("Authentication required"));
		const controller = new JobRoleController(
			{} as unknown as JobRoleService,
			createApplicationService(applyForRole),
		);
		const res = createResponse();
		const req = {
			...createRequest("1"),
			body: testApplicationData,
		} as unknown as Request;

		await controller.submitApplication(req, res);

		expect(res.clearCookie).toHaveBeenCalledWith("jwt", { path: "/" });
		expect(res.redirect).toHaveBeenCalled();
	});
});
