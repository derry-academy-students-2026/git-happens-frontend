import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/apiClient.js");
const { default: apiClient } = await import("../../src/config/apiClient.js");
const post = vi.mocked(apiClient.post);

const { ApplicationServiceImpl } = await import(
	"../../src/services/applicationService.js"
);

const applicationService = new ApplicationServiceImpl();

const testApplicationData = {
	fullName: "John Doe",
	countryCode: "+44",
	phoneNumber: "07123456789",
	email: "john@example.com",
	applicationText: "I am interested",
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

describe("ApplicationServiceImpl.applyForRole", () => {
	beforeEach(() => {
		post.mockReset();
	});

	it("posts application data to the job-roles endpoint with bearer token", async () => {
		post.mockResolvedValue({ data: {} });

		await applicationService.applyForRole(
			1,
			testApplicationData,
			"jwt-token",
		);

		expect(post).toHaveBeenCalledWith("job-roles/1/applications", testApplicationData, {
			headers: { Authorization: "Bearer jwt-token" },
		});
	});

	it("returns the application response from the backend", async () => {
		const response = {
			applicationId: 1,
			jobRoleId: 1,
			userId: 10,
			...testApplicationData,
			applicationStatus: "in progress",
			createdAt: "2026-08-14T10:00:00Z",
		};

		post.mockResolvedValue({ data: response });

		const result = await applicationService.applyForRole(
			1,
			testApplicationData,
			"jwt-token",
		);

		expect(result).toEqual(response);
	});

	it("throws an error with message on 400 response", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(400, {
				message: "Invalid application details",
			}),
		);

		await expect(
			applicationService.applyForRole(
				1,
				testApplicationData,
				"jwt-token",
			),
		).rejects.toThrow("Invalid application details");
	});

	it("throws an error on 404 (job role not found)", async () => {
		post.mockRejectedValue(axiosErrorWithStatus(404));

		await expect(
			applicationService.applyForRole(
				999,
				testApplicationData,
				"jwt-token",
			),
		).rejects.toThrow("Job role not found");
	});

	it("throws an error with message on 409 conflict (duplicate application)", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(409, {
				message: "You have already applied for this role",
			}),
		);

		await expect(
			applicationService.applyForRole(
				1,
				testApplicationData,
				"jwt-token",
			),
		).rejects.toThrow("You have already applied for this role");
	});

	it("throws an error on 500 server error", async () => {
		post.mockRejectedValue(axiosErrorWithStatus(500));

		await expect(
			applicationService.applyForRole(
				1,
				testApplicationData,
				"jwt-token",
			),
		).rejects.toThrow("Backend server error");
	});

	it("converts unexpected errors to a safe network error", async () => {
		post.mockRejectedValue(new Error("Network error"));

		await expect(
			applicationService.applyForRole(
				1,
				testApplicationData,
				"jwt-token",
			),
		).rejects.toThrow("Unable to reach the server. Please try again.");
	});
});

describe("ApplicationServiceImpl.getApplicationsForUser", () => {
	beforeEach(() => {
		post.mockReset();
	});

	it("gets the authenticated user's applications with a bearer token", async () => {
		const get = vi.mocked(apiClient.get);
		get.mockResolvedValue({ data: [] });

		await applicationService.getApplicationsForUser("7", "jwt-token");

		expect(get).toHaveBeenCalledWith("applications/users/7", {
			headers: { Authorization: "Bearer jwt-token" },
		});
	});
});
