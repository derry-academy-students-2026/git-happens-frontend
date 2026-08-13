import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRegister = vi.fn();

vi.mock("../../src/services/authApiService.js", () => ({
	AuthApiServiceImpl: class {
		register = mockRegister;
	},
}));

const { default: app } = await import("../../src/app.js");

describe("authRouter", () => {
	beforeEach(() => {
		mockRegister.mockReset();
	});

	it("renders the registration page", async () => {
		const response = await request(app).get("/auth/register");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Create an Account");
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

	it("renders success details after a successful registration", async () => {
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

		expect(response.status).toBe(201);
		expect(response.text).toContain("Registration successful");
		expect(response.text).toContain("user@example.com");
		expect(response.text).toContain("user");
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
			"An account with this email already exists",
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
		expect(response.text).toContain("Unexpected error while registering");
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
