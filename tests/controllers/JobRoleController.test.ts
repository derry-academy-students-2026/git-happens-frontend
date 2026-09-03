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

function createRequest(params: Record<string, string> = {}) {
	return { authenticatedUser: { token: "jwt-token", role: "user" }, originalUrl: "/jobs/job-roles", params } as unknown as Request;
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
		});
	});

	it("rejects an invalid job role id before calling the service", async () => {
		const getJobRoleById = vi.fn();
		const controller = new JobRoleController({ getJobRoleById } as unknown as JobRoleService);
		const res = createResponse();

		await controller.getById(createRequest({ id: "invalid" }), res);

		expect(getJobRoleById).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
	});
});