import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("../../src/config/apiClient.js", () => ({
	default: { post },
	apiClient: { post },
}));

const { register } = await import("../../src/services/authApiService.js");

function axiosErrorWithStatus(status: number, data?: object) {
	return new AxiosError("request failed", "ERR_BAD_RESPONSE", undefined, null, {
		status,
		statusText: "",
		data: data ?? {},
		headers: {},
		config: { headers: new AxiosHeaders() },
	});
}

describe("authApiService.register", () => {
	const originalRegisterPath = process.env.AUTH_REGISTER_PATH;

	beforeEach(() => {
		post.mockReset();
		delete process.env.AUTH_REGISTER_PATH;
	});

	afterEach(() => {
		if (originalRegisterPath === undefined) {
			delete process.env.AUTH_REGISTER_PATH;
			return;
		}

		process.env.AUTH_REGISTER_PATH = originalRegisterPath;
	});

	it("posts to /auth/register by default", async () => {
		post.mockResolvedValue({
			data: {
				email: "user@example.com",
				role: "user",
				createdAt: "2026-08-13T10:00:00.000Z",
			},
		});

		await register("user@example.com", "GoodPass!9");

		expect(post).toHaveBeenCalledWith("/auth/register", {
			email: "user@example.com",
			password: "GoodPass!9",
		});
	});

	it("posts to the configured register path", async () => {
		process.env.AUTH_REGISTER_PATH = "/v2/auth/register";
		post.mockResolvedValue({
			data: {
				email: "user@example.com",
				role: "user",
				createdAt: "2026-08-13T10:00:00.000Z",
			},
		});

		await register("user@example.com", "GoodPass!9");

		expect(post).toHaveBeenCalledWith("/v2/auth/register", {
			email: "user@example.com",
			password: "GoodPass!9",
		});
	});

	it("returns the created user payload", async () => {
		post.mockResolvedValue({
			data: {
				email: "user@example.com",
				role: "user",
				createdAt: "2026-08-13T10:00:00.000Z",
			},
		});

		const result = await register("user@example.com", "GoodPass!9");

		expect(result).toEqual({
			email: "user@example.com",
			role: "user",
			createdAt: "2026-08-13T10:00:00.000Z",
		});
	});

	it("throws the backend message for 400 errors", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(400, {
				message: "Email must be a valid email format",
			}),
		);

		await expect(register("bad-email", "GoodPass!9")).rejects.toThrow(
			"Email must be a valid email format",
		);
	});

	it("throws the backend message for 409 errors", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(409, {
				message: "An account with this email already exists",
			}),
		);

		await expect(register("user@example.com", "GoodPass!9")).rejects.toThrow(
			"An account with this email already exists",
		);
	});

	it("throws a generic message for unexpected axios statuses", async () => {
		post.mockRejectedValue(axiosErrorWithStatus(500));

		await expect(register("user@example.com", "GoodPass!9")).rejects.toThrow(
			"Unexpected error while registering",
		);
	});

	it("rethrows non-axios errors", async () => {
		post.mockRejectedValue(new Error("network disconnected"));

		await expect(register("user@example.com", "GoodPass!9")).rejects.toThrow(
			"network disconnected",
		);
	});
});
