import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("../../src/config/apiClient.js", () => ({
	default: { get },
	apiClient: { get },
}));

const { JobRoleService } = await import("../../src/services/JobRoleService.js");

const apiJobRole = {
	jobRoleId: 1,
	roleName: "Frontend Developer",
	location: "Derry",
	capability: {
		capabilityId: 3,
		capabilityName: "Engineering",
	},
	band: {
		bandId: 2,
		bandName: "Associate",
	},
	closingDate: "2026-09-04",
	status: {
		statusId: 1,
		statusName: "Open",
	},
	description: "Build and maintain our customer-facing web applications.",
	responsibilities: "Write code. Review pull requests. Fix bugs.",
	sharepointUrl: "https://kainos.sharepoint.com/job-specs/1",
	numberOfOpenPositions: 2,
};

function axiosErrorWithStatus(status: number, data: object = {}) {
	return new AxiosError("request failed", "ERR_BAD_RESPONSE", undefined, null, {
		status,
		statusText: "",
		data,
		headers: {},
		config: { headers: new AxiosHeaders() },
	});
}

const paginatedResponse = {
	jobRoles: [apiJobRole],
	page: 1,
	pageSize: 10,
	totalCount: 1,
	totalPages: 1,
};

describe("JobRoleService.getAllJobRoles", () => {
	beforeEach(() => {
		get.mockReset();
	});

	it("requests the job roles endpoint", async () => {
		get.mockResolvedValue({ data: paginatedResponse });

		await new JobRoleService().getAllJobRoles("jwt-token");

		expect(get).toHaveBeenCalledWith("job-roles", {
			headers: { Authorization: "Bearer jwt-token" },
		});
	});

	it("returns the API response untouched", async () => {
		get.mockResolvedValue({ data: paginatedResponse });

		const result = await new JobRoleService().getAllJobRoles("jwt-token");

		expect(result).toEqual(paginatedResponse);
	});

	it("returns closed roles as well as open ones", async () => {
		get.mockResolvedValue({
			data: {
				...paginatedResponse,
				jobRoles: [
					apiJobRole,
					{
						...apiJobRole,
						jobRoleId: 2,
						status: { statusId: 2, statusName: "Closed" },
					},
				],
				totalCount: 2,
			},
		});

		const result = await new JobRoleService().getAllJobRoles("jwt-token");

		expect(result.jobRoles.map((role) => role.status.statusName)).toEqual([
			"Open",
			"Closed",
		]);
	});

	it("requests later pages with a page query parameter", async () => {
		get.mockResolvedValue({
			data: { ...paginatedResponse, page: 2, totalCount: 11, totalPages: 2 },
		});

		await new JobRoleService().getAllJobRoles("jwt-token", 2);

		expect(get).toHaveBeenCalledWith("job-roles", {
			headers: { Authorization: "Bearer jwt-token" },
			params: { page: 2 },
		});
	});

	it("throws a not found message on a 404", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(404));

		await expect(
			new JobRoleService().getAllJobRoles("jwt-token"),
		).rejects.toThrow("No job roles found");
	});

	it("throws a server error message on a 500", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(500));

		await expect(
			new JobRoleService().getAllJobRoles("jwt-token"),
		).rejects.toThrow("Backend server error");
	});

	it("rethrows errors it does not recognise", async () => {
		get.mockRejectedValue(new Error("socket hang up"));

		await expect(
			new JobRoleService().getAllJobRoles("jwt-token"),
		).rejects.toThrow("socket hang up");
	});

	it("rethrows an axios error that never got a response", async () => {
		get.mockRejectedValue(
			new AxiosError("connect ECONNREFUSED", "ECONNREFUSED"),
		);

		await expect(
			new JobRoleService().getAllJobRoles("jwt-token"),
		).rejects.toThrow("connect ECONNREFUSED");
	});

	it("rethrows an axios error whose status it does not handle", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(503));

		await expect(
			new JobRoleService().getAllJobRoles("jwt-token"),
		).rejects.toThrow("request failed");
	});

	it("throws authentication required when the API returns a login redirect hint", async () => {
		get.mockRejectedValue(
			axiosErrorWithStatus(401, {
				message: "Authentication required",
				redirectTo: "/login",
			}),
		);

		await expect(
			new JobRoleService().getAllJobRoles("jwt-token"),
		).rejects.toThrow("Authentication required");
	});
});

describe("JobRoleService.getJobRoleById", () => {
	beforeEach(() => {
		get.mockReset();
	});

	it("requests the endpoint for the given id", async () => {
		get.mockResolvedValue({ data: apiJobRole });

		await new JobRoleService().getJobRoleById(1, "jwt-token");

		expect(get).toHaveBeenCalledWith("job-roles/1", {
			headers: { Authorization: "Bearer jwt-token" },
		});
	});

	it("returns the API response untouched", async () => {
		get.mockResolvedValue({ data: apiJobRole });

		const result = await new JobRoleService().getJobRoleById(1, "jwt-token");

		expect(result).toEqual(apiJobRole);
	});

	it("throws a not found message on a 404", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(404));

		await expect(
			new JobRoleService().getJobRoleById(99, "jwt-token"),
		).rejects.toThrow("Job role not found");
	});

	it("throws a server error message on a 500", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(500));

		await expect(
			new JobRoleService().getJobRoleById(1, "jwt-token"),
		).rejects.toThrow("Backend server error");
	});

	it("rethrows errors it does not recognise", async () => {
		get.mockRejectedValue(new Error("socket hang up"));

		await expect(
			new JobRoleService().getJobRoleById(1, "jwt-token"),
		).rejects.toThrow("socket hang up");
	});

	it("rethrows an axios error whose status it does not handle", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(503));

		await expect(
			new JobRoleService().getJobRoleById(1, "jwt-token"),
		).rejects.toThrow("request failed");
	});

	it("throws authentication required when detail API returns 401", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(401));

		await expect(
			new JobRoleService().getJobRoleById(1, "jwt-token"),
		).rejects.toThrow("Authentication required");
	});
});
