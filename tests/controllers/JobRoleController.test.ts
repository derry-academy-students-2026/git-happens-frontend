import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/JobRoleController.js";
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

	it("renders the error page when the service rejects with a non-Error", async () => {
		const getAllJobRoles = vi.fn().mockRejectedValue("db down");
		const controller = new JobRoleController(createService(getAllJobRoles));
		const res = createResponse();

		await controller.getAll({} as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Internal Server Error",
		});
	});
});

function createRequest(id: string) {
	return { params: { id } } as unknown as Request;
}

describe("JobRoleController.getById", () => {
	it("renders the information page with the role from the service", async () => {
		const getJobRoleById = vi.fn().mockResolvedValue(jobRoles[0]);
		const controller = new JobRoleController({
			getJobRoleById,
		} as unknown as JobRoleService);
		const res = createResponse();

		await controller.getById(createRequest("1"), res);

		expect(getJobRoleById).toHaveBeenCalledWith(1);
		expect(res.render).toHaveBeenCalledWith("pages/job-role-information.njk", {
			jobRole: jobRoles[0],
		});
		expect(res.status).not.toHaveBeenCalled();
	});

	it("renders a 400 without calling the service when the id is not a number", async () => {
		const getJobRoleById = vi.fn();
		const controller = new JobRoleController({
			getJobRoleById,
		} as unknown as JobRoleService);
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
		const controller = new JobRoleController({
			getJobRoleById,
		} as unknown as JobRoleService);
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
		const controller = new JobRoleController({
			getJobRoleById,
		} as unknown as JobRoleService);
		const res = createResponse();

		await controller.getById(createRequest("1"), res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", {
			error: "Internal Server Error",
		});
	});
});
