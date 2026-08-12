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

function axiosErrorWithStatus(status: number) {
	return new AxiosError("request failed", "ERR_BAD_RESPONSE", undefined, null, {
		status,
		statusText: "",
		data: {},
		headers: {},
		config: { headers: new AxiosHeaders() },
	});
}

describe("JobRoleService.getAllJobRoles", () => {
	beforeEach(() => {
		get.mockReset();
	});

	it("requests the job roles endpoint", async () => {
		get.mockResolvedValue({ data: [] });

		await new JobRoleService().getAllJobRoles();

		expect(get).toHaveBeenCalledWith("job-roles");
	});

	it("returns the API response untouched", async () => {
		get.mockResolvedValue({ data: [apiJobRole] });

		const result = await new JobRoleService().getAllJobRoles();

		expect(result).toEqual([apiJobRole]);
	});

	it("returns closed roles as well as open ones", async () => {
		get.mockResolvedValue({
			data: [
				apiJobRole,
				{
					...apiJobRole,
					jobRoleId: 2,
					status: { statusId: 2, statusName: "Closed" },
				},
			],
		});

		const result = await new JobRoleService().getAllJobRoles();

		expect(result.map((role) => role.status.statusName)).toEqual([
			"Open",
			"Closed",
		]);
	});

	it("throws a not found message on a 404", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(404));

		await expect(new JobRoleService().getAllJobRoles()).rejects.toThrow(
			"No job roles found",
		);
	});

	it("throws a server error message on a 500", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(500));

		await expect(new JobRoleService().getAllJobRoles()).rejects.toThrow(
			"Backend server error",
		);
	});

	it("rethrows errors it does not recognise", async () => {
		get.mockRejectedValue(new Error("socket hang up"));

		await expect(new JobRoleService().getAllJobRoles()).rejects.toThrow(
			"socket hang up",
		);
	});

	it("rethrows an axios error that never got a response", async () => {
		get.mockRejectedValue(
			new AxiosError("connect ECONNREFUSED", "ECONNREFUSED"),
		);

		await expect(new JobRoleService().getAllJobRoles()).rejects.toThrow(
			"connect ECONNREFUSED",
		);
	});

	it("rethrows an axios error whose status it does not handle", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(503));

		await expect(new JobRoleService().getAllJobRoles()).rejects.toThrow(
			"request failed",
		);
	});
});

describe("JobRoleService.getJobRoleById", () => {
	beforeEach(() => {
		get.mockReset();
	});

	it("requests the endpoint for the given id", async () => {
		get.mockResolvedValue({ data: apiJobRole });

		await new JobRoleService().getJobRoleById(1);

		expect(get).toHaveBeenCalledWith("job-roles/1");
	});

	it("returns the API response untouched", async () => {
		get.mockResolvedValue({ data: apiJobRole });

		const result = await new JobRoleService().getJobRoleById(1);

		expect(result).toEqual(apiJobRole);
	});

	it("throws a not found message on a 404", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(404));

		await expect(new JobRoleService().getJobRoleById(99)).rejects.toThrow(
			"Job role not found",
		);
	});

	it("throws a server error message on a 500", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(500));

		await expect(new JobRoleService().getJobRoleById(1)).rejects.toThrow(
			"Backend server error",
		);
	});

	it("rethrows errors it does not recognise", async () => {
		get.mockRejectedValue(new Error("socket hang up"));

		await expect(new JobRoleService().getJobRoleById(1)).rejects.toThrow(
			"socket hang up",
		);
	});

	it("rethrows an axios error whose status it does not handle", async () => {
		get.mockRejectedValue(axiosErrorWithStatus(503));

		await expect(new JobRoleService().getJobRoleById(1)).rejects.toThrow(
			"request failed",
		);
	});
});
