import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/JobRoleController.js";
import type { JobRoleService } from "../../src/services/JobRoleService.js";

const jobRoles = [{ jobRoleId: 1, roleName: "Frontend Developer" }];

const pagination = {
	jobRoles,
	page: 1,
	pageSize: 10,
	totalCount: 1,
	totalPages: 1,
};

function createResponse() {
	const res = { clearCookie: vi.fn(), render: vi.fn(), status: vi.fn(), redirect: vi.fn() };
	res.status.mockReturnValue(res);
	return res as unknown as Response & typeof res;
}

function createRequest(
	params: Record<string, string> = {},
	query: Record<string, string> = {},
) {
	const originalUrl = params.id
		? `/jobs/job-roles/${params.id}`
		: "/jobs/job-roles";
	return {
		authenticatedUser: { token: "jwt-token", role: "user" },
		originalUrl,
		params,
		query,
	} as unknown as Request;
}

function createService(getAllJobRoles: ReturnType<typeof vi.fn>) {
	return { getAllJobRoles } as unknown as JobRoleService;
}

describe("JobRoleController.getAll", () => {
	it("renders the job role list with the roles from the service", async () => {
		const getAllJobRoles = vi.fn().mockResolvedValue(pagination);
		const controller = new JobRoleController(createService(getAllJobRoles));
		const res = createResponse();

		await controller.getAll(createRequest(), res);

		expect(getAllJobRoles).toHaveBeenCalledWith("jwt-token", 1);
		expect(res.render).toHaveBeenCalledWith("pages/job-role-list.njk", {
			jobRoles,
			pagination,
		});
		expect(res.status).not.toHaveBeenCalled();
	});

	it("passes the requested page to the service", async () => {
		const getAllJobRoles = vi
			.fn()
			.mockResolvedValue({ ...pagination, page: 2 });
		const controller = new JobRoleController(createService(getAllJobRoles));
		const res = createResponse();

		await controller.getAll(
			createRequest({}, { page: "2" }),
			res,
		);

		expect(getAllJobRoles).toHaveBeenCalledWith("jwt-token", 2);
	});

	it("renders the error page with a 500 when the service rejects", async () => {
		const getAllJobRoles = vi.fn().mockRejectedValue(new Error("db down"));
		const controller = new JobRoleController(createService(getAllJobRoles));
		const res = createResponse();

		await controller.getAll(createRequest(), res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Internal Server Error",
		});
	});

	it("renders the error page when the service rejects with a non-Error", async () => {
		const getAllJobRoles = vi.fn().mockRejectedValue("db down");
		const controller = new JobRoleController(createService(getAllJobRoles));
		const res = createResponse();

		await controller.getAll(createRequest(), res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Internal Server Error",
		});
	});

	it("clears the jwt and redirects when the backend requires authentication", async () => {
		const getAllJobRoles = vi
			.fn()
			.mockRejectedValue(new Error("Authentication required"));
		const controller = new JobRoleController(createService(getAllJobRoles));
		const res = createResponse();

		await controller.getAll(createRequest(), res);

		expect(res.clearCookie).toHaveBeenCalledWith("jwt", { path: "/" });
		expect(res.redirect).toHaveBeenCalledWith(
			"/auth/login?returnTo=%2Fjobs%2Fjob-roles",
		);
	});
});

describe("JobRoleController.getById", () => {
	it("renders a job role's information", async () => {
		const jobRole = { ...jobRoles[0], status: { statusName: "Open" } };
		const getJobRoleById = vi.fn().mockResolvedValue(jobRole);
		const controller = new JobRoleController({ getJobRoleById } as unknown as JobRoleService);
		const res = createResponse();

		await controller.getById(createRequest({ id: "1" }), res);

		expect(getJobRoleById).toHaveBeenCalledWith(1, "jwt-token");
		expect(res.render).toHaveBeenCalledWith("pages/job-role-information.njk", {
			jobRole,
			authenticatedUser: { token: "jwt-token", role: "user" },
			query: {},
			backHref: "/jobs/job-roles",
		});
	});

	it("builds a back link to the list page the role was viewed from", async () => {
		const getJobRoleById = vi.fn().mockResolvedValue(jobRoles[0]);
		const controller = new JobRoleController({
			getJobRoleById,
		} as unknown as JobRoleService);
		const res = createResponse();

		await controller.getById(
			createRequest({ id: "1" }, { page: "3" }),
			res,
		);

		expect(res.render).toHaveBeenCalledWith("pages/job-role-information.njk", {
			jobRole: jobRoles[0],
			authenticatedUser: { token: "jwt-token", role: "user" },
			query: { page: "3" },
			backHref: "/jobs/job-roles?page=3",
		});
	});

	it("ignores an invalid page query when building the back link", async () => {
		const getJobRoleById = vi.fn().mockResolvedValue(jobRoles[0]);
		const controller = new JobRoleController({
			getJobRoleById,
		} as unknown as JobRoleService);
		const res = createResponse();

		await controller.getById(
			createRequest({ id: "1" }, { page: "nope" }),
			res,
		);

		expect(res.render).toHaveBeenCalledWith("pages/job-role-information.njk", {
			jobRole: jobRoles[0],
			authenticatedUser: { token: "jwt-token", role: "user" },
			query: { page: "nope" },
			backHref: "/jobs/job-roles",
		});
	});

	it("renders a 400 without calling the service when the id is not a number", async () => {
		const getJobRoleById = vi.fn();
		const controller = new JobRoleController({ getJobRoleById } as unknown as JobRoleService);
		const res = createResponse();

		await controller.getById(createRequest({ id: "invalid" }), res);

		expect(getJobRoleById).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "That job role id is not valid",
		});
	});

	it("renders a not-found error when the requested role does not exist", async () => {
		const controller = new JobRoleController({
			getJobRoleById: vi.fn().mockRejectedValue(new Error("Job role not found")),
		} as unknown as JobRoleService);
		const res = createResponse();

		await controller.getById(createRequest({ id: "99" }), res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Job role not found",
		});
	});

	it("renders a generic error page when retrieving a role fails", async () => {
		const controller = new JobRoleController({
			getJobRoleById: vi.fn().mockRejectedValue(new Error("Service unavailable")),
		} as unknown as JobRoleService);
		const res = createResponse();

		await controller.getById(createRequest({ id: "1" }), res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Internal Server Error",
		});
	});

	it("clears the session when retrieving a role rejects the token", async () => {
		const controller = new JobRoleController({
			getJobRoleById: vi.fn().mockRejectedValue(new Error("Authentication required")),
		} as unknown as JobRoleService);
		const res = createResponse();

		await controller.getById(createRequest({ id: "1" }), res);

		expect(res.clearCookie).toHaveBeenCalledWith("jwt", { path: "/" });
		expect(res.redirect).toHaveBeenCalledWith("/auth/login?returnTo=%2Fjobs%2Fjob-roles%2F1");
	});
});