import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/JobRoleController.js";
import type { JobRoleService } from "../../src/services/JobRoleService.js";

const jobRoles = [{ jobRoleId: 1, roleName: "Frontend Developer" }];

function createResponse() {
	const res = { clearCookie: vi.fn(), render: vi.fn(), status: vi.fn(), redirect: vi.fn() };
	res.status.mockReturnValue(res);
	return res as unknown as Response & typeof res;
}

function createRequest(params: Record<string, string> = {}, query: Record<string, string> = {}) {
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

describe("JobRoleController", () => {
	it("renders job roles returned by the service", async () => {
		const getAllJobRoles = vi.fn().mockResolvedValue(jobRoles);
		const controller = new JobRoleController({ getAllJobRoles } as unknown as JobRoleService);
		const res = createResponse();

		await controller.getAll(createRequest(), res);

		expect(getAllJobRoles).toHaveBeenCalledWith("jwt-token");
		expect(res.render).toHaveBeenCalledWith("pages/job-role-list.njk", { jobRoles });
	});

	it("renders a generic error page when listing roles fails", async () => {
		const controller = new JobRoleController({
			getAllJobRoles: vi.fn().mockRejectedValue(new Error("Service unavailable")),
		} as unknown as JobRoleService);
		const res = createResponse();

		await controller.getAll(createRequest(), res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Internal Server Error",
		});
	});

	it("clears the session when listing roles rejects the token", async () => {
		const controller = new JobRoleController({
			getAllJobRoles: vi.fn().mockRejectedValue(new Error("Authentication required")),
		} as unknown as JobRoleService);
		const res = createResponse();

		await controller.getAll(createRequest(), res);

		expect(res.clearCookie).toHaveBeenCalledWith("jwt", { path: "/" });
		expect(res.redirect).toHaveBeenCalledWith("/auth/login?returnTo=%2Fjobs%2Fjob-roles");
	});

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
		});
	});

	it("rejects an invalid job role id before calling the service", async () => {
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