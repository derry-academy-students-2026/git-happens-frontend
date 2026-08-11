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
	status: "Open",
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

	it("maps the API response to list items", async () => {
		get.mockResolvedValue({ data: [apiJobRole] });

		const result = await new JobRoleService().getAllJobRoles();

		expect(result).toEqual([
			{
				jobRoleId: 1,
				roleName: "Frontend Developer",
				location: "Derry",
				capability: "Engineering",
				band: "Associate",
				closingDate: "2026-09-04",
				status: "Open",
			},
		]);
	});

	it("returns closed roles as well as open ones", async () => {
		get.mockResolvedValue({
			data: [apiJobRole, { ...apiJobRole, jobRoleId: 2, status: "Closed" }],
		});

		const result = await new JobRoleService().getAllJobRoles();

		expect(result.map((role) => role.status)).toEqual(["Open", "Closed"]);
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
