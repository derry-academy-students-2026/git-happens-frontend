import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/JobRoleController.js";
import type { JobRoleService } from "../../src/services/JobRoleService.js";

const jobRoles = [
	{
		jobRoleId: 1,
		roleName: "Frontend Developer",
		location: "Derry",
		capability: "Engineering",
		band: "Associate",
		closingDate: "2026-09-04",
		status: "Open",
	},
];

function createResponse() {
	const res = {
		render: vi.fn(),
		status: vi.fn(),
	};
	res.status.mockReturnValue(res);
	return res as unknown as Response & typeof res;
}

function createService(getAllJobRoles: JobRoleService["getAllJobRoles"]) {
	return { getAllJobRoles } as JobRoleService;
}

describe("JobRoleController.getAll", () => {
	it("renders the job role list with the roles from the service", async () => {
		const getAllJobRoles = vi.fn().mockResolvedValue(jobRoles);
		const controller = new JobRoleController(createService(getAllJobRoles));
		const res = createResponse();

		await controller.getAll({} as Request, res);

		expect(getAllJobRoles).toHaveBeenCalledOnce();
		expect(res.render).toHaveBeenCalledWith("pages/job-role-list.njk", {
			jobRoles,
		});
		expect(res.status).not.toHaveBeenCalled();
	});

	it("renders the error page with a 500 when the service rejects", async () => {
		const getAllJobRoles = vi.fn().mockRejectedValue(new Error("db down"));
		const controller = new JobRoleController(createService(getAllJobRoles));
		const res = createResponse();

		await controller.getAll({} as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Internal Server Error",
		});
	});
});
