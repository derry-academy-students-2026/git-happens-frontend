import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthApiService } from "../../src/services/authApiService.js";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("../../src/config/apiClient.js", () => ({
	default: { post },
	apiClient: { post },
}));

const { AuthApiServiceImpl } = await import(
	"../../src/services/authApiService.js"
);

function axiosErrorWithStatus(status: number, data?: object) {
	return new AxiosError("request failed", "ERR_BAD_RESPONSE", undefined, null, {
		status,
		statusText: "",
		data: data ?? {},
		headers: {},
		config: { headers: new AxiosHeaders() },
	});
}

describe("AuthApiServiceImpl.register", () => {
	const originalRegisterPath = process.env.AUTH_REGISTER_PATH;
	let authApiService: AuthApiService;

	beforeEach(() => {
		post.mockReset();
		delete process.env.AUTH_REGISTER_PATH;
		authApiService = new AuthApiServiceImpl();
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

		await authApiService.register("user@example.com", "GoodPass!9");

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

		await authApiService.register("user@example.com", "GoodPass!9");

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

		const result = await authApiService.register(
			"user@example.com",
			"GoodPass!9",
		);

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

		await expect(
			authApiService.register("bad-email", "GoodPass!9"),
		).rejects.toThrow("Email must be a valid email format");
	});

	it("throws the backend message for 409 errors", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(409, {
				message: "An account with this email already exists",
			}),
		);

		await expect(
			authApiService.register("user@example.com", "GoodPass!9"),
		).rejects.toThrow("An account with this email already exists");
	});

	it("throws a generic message for unexpected axios statuses", async () => {
		post.mockRejectedValue(axiosErrorWithStatus(500));

		await expect(
			authApiService.register("user@example.com", "GoodPass!9"),
		).rejects.toThrow("Unexpected error while registering");
	});

	it("rethrows non-axios errors", async () => {
		post.mockRejectedValue(new Error("network disconnected"));

		await expect(
			authApiService.register("user@example.com", "GoodPass!9"),
		).rejects.toThrow("network disconnected");
	});
});

describe("AuthApiServiceImpl.login", () => {
	const originalLoginPath = process.env.AUTH_LOGIN_PATH;
	let authApiService: AuthApiService;

	beforeEach(() => {
		post.mockReset();
		delete process.env.AUTH_LOGIN_PATH;
		authApiService = new AuthApiServiceImpl();
	});

	afterEach(() => {
		if (originalLoginPath === undefined) {
			delete process.env.AUTH_LOGIN_PATH;
			return;
		}

		process.env.AUTH_LOGIN_PATH = originalLoginPath;
	});

	it("posts to /auth/login by default", async () => {
		post.mockResolvedValue({
			data: { token: "jwt-token" },
		});

		await authApiService.login("someone@example.com", "password123");

		expect(post).toHaveBeenCalledWith("/auth/login", {
			email: "someone@example.com",
			password: "password123",
		});
	});

	it("posts to the configured login path", async () => {
		process.env.AUTH_LOGIN_PATH = "/v2/auth/login";
		post.mockResolvedValue({
			data: { token: "jwt-token" },
		});

		await authApiService.login("someone@example.com", "password123");

		expect(post).toHaveBeenCalledWith("/v2/auth/login", {
			email: "someone@example.com",
			password: "password123",
		});
	});

	it("returns the backend token", async () => {
		post.mockResolvedValue({
			data: { token: "jwt-token" },
		});

		const result = await authApiService.login(
			"someone@example.com",
			"password123",
		);

		expect(result).toEqual({ token: "jwt-token" });
	});

	it("throws 401 for backend 401 responses", async () => {
		post.mockRejectedValue(
			axiosErrorWithStatus(401, { message: "Invalid credentials" }),
		);

		await expect(
			authApiService.login("someone@example.com", "bad-password"),
		).rejects.toMatchObject({
			message: "Invalid credentials",
			statusCode: 401,
		});
	});

	it("throws 500 when login response has no token", async () => {
		post.mockResolvedValue({ data: {} });

		await expect(
			authApiService.login("someone@example.com", "password123"),
		).rejects.toThrow("Login response did not include a token");
	});

	it("throws generic message for unexpected axios status", async () => {
		post.mockRejectedValue(axiosErrorWithStatus(503));

		await expect(
			authApiService.login("someone@example.com", "password123"),
		).rejects.toThrow("Unexpected error while logging in");
	});
});

describe("AuthApiServiceImpl.logout", () => {
	const originalLogoutPath = process.env.AUTH_LOGOUT_PATH;
	let authApiService: AuthApiService;

	beforeEach(() => {
		post.mockReset();
		delete process.env.AUTH_LOGOUT_PATH;
		authApiService = new AuthApiServiceImpl();
	});

	afterEach(() => {
		if (originalLogoutPath === undefined) {
			delete process.env.AUTH_LOGOUT_PATH;
			return;
		}

		process.env.AUTH_LOGOUT_PATH = originalLogoutPath;
	});

	it("posts to /auth/logout by default", async () => {
		post.mockResolvedValue({ data: {} });

		await expect(authApiService.logout()).resolves.toBeUndefined();
		expect(post).toHaveBeenCalledWith("/auth/logout");
	});

	it("posts to the configured logout path", async () => {
		process.env.AUTH_LOGOUT_PATH = "/v2/auth/logout";
		post.mockResolvedValue({ data: {} });

		await expect(authApiService.logout()).resolves.toBeUndefined();
		expect(post).toHaveBeenCalledWith("/v2/auth/logout");
	});

	it("resolves when logout endpoint is unavailable", async () => {
		post.mockRejectedValue(axiosErrorWithStatus(503));

		await expect(authApiService.logout()).resolves.toBeUndefined();
	});
});
