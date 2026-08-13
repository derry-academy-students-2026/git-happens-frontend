import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRegister = vi.fn();
const mockLogin = vi.fn();

vi.mock("../../src/services/authApiService.js", () => ({
	AuthApiServiceImpl: class {
		register = mockRegister;
		login = mockLogin;
		logout = vi.fn();
	},
}));

const { default: app } = await import("../../src/app.js");

describe("authRouter", () => {
	beforeEach(() => {
		mockRegister.mockReset();
		mockLogin.mockReset();
		mockLogin.mockResolvedValue({
			token: "mock-jwt-token-for-user@example.com",
		});
	});

	it("renders the registration page", async () => {
		const response = await request(app).get("/auth/register");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Create your account");
		expect(response.text).toContain('href="/jobs/login"');
	});

	it("renders the login page with a create account link", async () => {
		const response = await request(app).get("/jobs/login");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Login");
		expect(response.text).toContain('href="/auth/register"');
		expect(response.text).toContain("Create an account");
	});

	it("shows registration success message on login page when redirected", async () => {
		const response = await request(app).get("/jobs/login?registered=1");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Registration successful. Please log in.");
	});

	it("returns validation errors for invalid email", async () => {
		const response = await request(app)
			.post("/auth/register")
			.type("form")
			.send({
				email: "bad-email",
				password: "GoodPass!9",
				confirmPassword: "GoodPass!9",
			});

		expect(response.status).toBe(400);
		expect(response.text).toContain("Email must be a valid email format");
		expect(mockRegister).not.toHaveBeenCalled();
	});

	it("returns validation errors for weak password", async () => {
		const response = await request(app)
			.post("/auth/register")
			.type("form")
			.send({
				email: "user@example.com",
				password: "short",
				confirmPassword: "short",
			});

		expect(response.status).toBe(400);
		expect(response.text).toContain(
			"Password must be more than 8 characters long",
		);
		expect(mockRegister).not.toHaveBeenCalled();
	});

	it("redirects to login after a successful registration", async () => {
		mockRegister.mockResolvedValue({
			email: "user@example.com",
			role: "user",
			createdAt: "2026-08-13T10:00:00.000Z",
		});

		const response = await request(app)
			.post("/auth/register")
			.type("form")
			.send({
				email: "user@example.com",
				password: "GoodPass!9",
				confirmPassword: "GoodPass!9",
			});

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/jobs/login?registered=1");
		expect(response.headers["set-cookie"]).toBeUndefined();
	});

	it("shows backend duplicate email errors", async () => {
		const duplicateError = new Error(
			"An account with this email already exists",
		) as Error & {
			statusCode?: number;
		};
		duplicateError.statusCode = 409;
		mockRegister.mockRejectedValue(duplicateError);

		const response = await request(app)
			.post("/auth/register")
			.type("form")
			.send({
				email: "user@example.com",
				password: "GoodPass!9",
				confirmPassword: "GoodPass!9",
			});

		expect(response.status).toBe(409);
		expect(response.text).toContain(
			"An account with this email already exists.",
		);
	});

	it("returns 500 when registration fails unexpectedly", async () => {
		const unexpectedError = new Error(
			"Unexpected error while registering",
		) as Error & {
			statusCode?: number;
		};
		unexpectedError.statusCode = 500;
		mockRegister.mockRejectedValue(unexpectedError);

		const response = await request(app)
			.post("/auth/register")
			.type("form")
			.send({
				email: "user@example.com",
				password: "GoodPass!9",
				confirmPassword: "GoodPass!9",
			});

		expect(response.status).toBe(500);
		expect(response.text).toContain(
			"We couldn&#39;t create your account right now. Please try again.",
		);
	});

	it("returns validation error when password confirmation does not match", async () => {
		const response = await request(app)
			.post("/auth/register")
			.type("form")
			.send({
				email: "user@example.com",
				password: "GoodPass!9",
				confirmPassword: "WrongPass!9",
			});

		expect(response.status).toBe(400);
		expect(response.text).toContain("Passwords do not match");
		expect(mockRegister).not.toHaveBeenCalled();
	});
});
