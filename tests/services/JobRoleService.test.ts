import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock("../../src/config/apiClient.js", () => ({
	default: { get, post },
	apiClient: { get, post },
}));

const { JobRoleService } = await import("../../src/services/JobRoleService.js");
const { ApiValidationError, AppError } = await import(
	"../../src/errors/customErrors.js"
);

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

describe("JobRoleService.getAllJobRoles", () => {
	beforeEach(() => {
		get.mockReset();
	});

	it("requests the job roles endpoint", async () => {
		get.mockResolvedValue({ data: [] });

		await new JobRoleService().getAllJobRoles("jwt-token");

		expect(get).toHaveBeenCalledWith("job-roles", {
			headers: { Authorization: "Bearer jwt-token" },
		});
	});

	it("returns the API response untouched", async () => {
		get.mockResolvedValue({ data: [apiJobRole] });

		const result = await new JobRoleService().getAllJobRoles("jwt-token");

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

		const result = await new JobRoleService().getAllJobRoles("jwt-token");

		expect(result.map((role) => role.status.statusName)).toEqual([
			"Open",
			"Closed",
		]);
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

describe("JobRoleService.createJobRole", () => {
	const request = {
		roleName: "Backend Developer",
		location: "Belfast",
		capabilityId: 3,
		bandId: 2,
		closingDate: "2026-10-01",
		description: "Build backend services.",
		responsibilities: "Design APIs. Write tests.",
		numberOfOpenPositions: 1,
	};

	beforeEach(() => {
		post.mockReset();
	});

	it("posts the request to the job-roles endpoint", async () => {
		post.mockResolvedValue({ data: { jobRoleId: 9 } });

		await new JobRoleService().createJobRole(request, "jwt-token");

		expect(post).toHaveBeenCalledWith("job-roles", request, {
			headers: { Authorization: "Bearer jwt-token" },
		});
	});

	it("throws an ApiValidationError with field errors when the backend sends them", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(400, {
				message: "Invalid job role details",
				errors: [
					{ field: "roleName", message: "Role name must not be empty" },
					{
						field: "closingDate",
						message: "Closing date must be in the future",
					},
				],
			}),
		);

		const error = await new JobRoleService()
			.createJobRole(request, "jwt-token")
			.catch((caught) => caught);

		expect(error).toBeInstanceOf(ApiValidationError);
		expect(error.statusCode).toBe(400);
		expect(error.fieldErrors).toEqual([
			{ field: "roleName", message: "Role name must not be empty" },
			{ field: "closingDate", message: "Closing date must be in the future" },
		]);
	});

	it("preserves multiple field errors sent for the same field", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(400, {
				message: "Invalid job role details",
				errors: [
					{ field: "roleName", message: "Role name must not be empty" },
					{
						field: "roleName",
						message: "Role name must be under 100 characters",
					},
				],
			}),
		);

		const error = await new JobRoleService()
			.createJobRole(request, "jwt-token")
			.catch((caught) => caught);

		expect(error.fieldErrors).toEqual([
			{ field: "roleName", message: "Role name must not be empty" },
			{ field: "roleName", message: "Role name must be under 100 characters" },
		]);
	});

	it("falls back to an ApiValidationError with no field errors when none are sent", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(400, { message: "Invalid job role details" }),
		);

		const error = await new JobRoleService()
			.createJobRole(request, "jwt-token")
			.catch((caught) => caught);

		expect(error).toBeInstanceOf(ApiValidationError);
		expect(error.fieldErrors).toEqual([]);
		expect(error.message).toBe("Invalid job role details");
	});

	it("throws an AppError carrying the backend's own message on a 403", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(403, {
				message: "Users can only access list and information endpoints",
			}),
		);

		const error = await new JobRoleService()
			.createJobRole(request, "jwt-token")
			.catch((caught) => caught);

		expect(error).toBeInstanceOf(AppError);
		expect(error.statusCode).toBe(403);
		expect(error.message).toBe(
			"Users can only access list and information endpoints",
		);
	});

	it("throws an AppError with a default message when the backend sends none on a 403", async () => {
		post.mockRejectedValue(axiosErrorWithStatus(403));

		const error = await new JobRoleService()
			.createJobRole(request, "jwt-token")
			.catch((caught) => caught);

		expect(error).toBeInstanceOf(AppError);
		expect(error.statusCode).toBe(403);
		expect(error.message).toBe("Forbidden");
	});

	it("throws the backend's message when a referenced capability or band is missing", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(404, { message: "Band not found" }),
		);

		await expect(
			new JobRoleService().createJobRole(request, "jwt-token"),
		).rejects.toThrow("Band not found");
	});

	it("throws a server error message on a 500, never the backend's own message", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(500, { message: "NullPointerException at row 42" }),
		);

		const error = await new JobRoleService()
			.createJobRole(request, "jwt-token")
			.catch((caught) => caught);

		expect(error.message).toBe("Backend server error");
		expect(error.message).not.toContain("NullPointerException");
	});

	it("throws a generic retryable message on a network failure, not the raw error", async () => {
		post.mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1:4000"));

		const error = await new JobRoleService()
			.createJobRole(request, "jwt-token")
			.catch((caught) => caught);

		expect(error).toBeInstanceOf(AppError);
		expect(error.message).toBe(
			"We couldn't create this job role right now. Please try again.",
		);
		expect(error.message).not.toContain("ECONNREFUSED");
	});
});
