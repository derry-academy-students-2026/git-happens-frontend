import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../../src/controllers/ApplicationController.js";
import { AppError } from "../../src/errors/customErrors.js";
import type { ApplicationService } from "../../src/services/applicationService.js";
import type { JobRoleService } from "../../src/services/JobRoleService.js";

const applicationInput = { fullName: "Jane Doe", countryCode: "+44", phoneNumber: "07123456789", email: "jane@example.com", applicationText: "I am interested" };
const openRole = { jobRoleId: 1, roleName: "Frontend Developer", status: { statusName: "Open" }, numberOfOpenPositions: 1 };

function createResponse() {
	const res = { clearCookie: vi.fn(), render: vi.fn(), status: vi.fn(), redirect: vi.fn() };
	res.status.mockReturnValue(res);
	return res as unknown as Response & typeof res;
}

function createRequest(id = "1", input = applicationInput) {
	return { authenticatedUser: { token: "jwt-token", role: "user" }, originalUrl: `/jobs/job-roles/${id}/apply`, params: { id }, jobApplicationInput: input } as unknown as Request;
}

function createController(getJobRoleById = vi.fn(), applyForRole = vi.fn()) {
	return new ApplicationController(
		{ getJobRoleById } as unknown as JobRoleService,
		{ applyForRole } as unknown as ApplicationService,
	);
}

describe("ApplicationController", () => {
	it("renders an application form for an open role", async () => {
		const getJobRoleById = vi.fn().mockResolvedValue(openRole);
		const controller = createController(getJobRoleById);
		const res = createResponse();

		await controller.showForm(createRequest(), res);

		expect(getJobRoleById).toHaveBeenCalledWith(1, "jwt-token");
		expect(res.render).toHaveBeenCalledWith("pages/job-application.njk", expect.objectContaining({ jobRole: openRole }));
	});

	it("rejects a form for a closed role", async () => {
		const controller = createController(vi.fn().mockResolvedValue({ ...openRole, status: { statusName: "Closed" } }));
		const res = createResponse();

		await controller.showForm(createRequest(), res);

		expect(res.status).toHaveBeenCalledWith(403);
	});

	it("submits middleware-validated input and redirects", async () => {
		const applyForRole = vi.fn().mockResolvedValue({ applicationId: 1 });
		const controller = createController(vi.fn(), applyForRole);
		const res = createResponse();

		await controller.submit(createRequest(), res);

		expect(applyForRole).toHaveBeenCalledWith(1, applicationInput, "jwt-token");
		expect(res.redirect).toHaveBeenCalledWith("/jobs/job-roles/1?applied=1");
	});

	it("renders the shared conflict error returned by the service", async () => {
		const controller = createController(vi.fn(), vi.fn().mockRejectedValue(new AppError("You have already applied for this role", 409)));
		const res = createResponse();

		await controller.submit(createRequest(), res);

		expect(res.status).toHaveBeenCalledWith(409);
		expect(res.render).toHaveBeenCalledWith("pages/error.njk", { error: "You have already applied for this role" });
	});
});