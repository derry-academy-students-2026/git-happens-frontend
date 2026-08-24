import { describe, expect, it } from "vitest";
import {
	ApiValidationError,
	AppError,
	createApiError,
	createNetworkError,
} from "../../src/errors/customErrors.js";

describe("AppError", () => {
	it("preserves the message and status code", () => {
		const error = new AppError("Something went wrong", 418);

		expect(error.message).toBe("Something went wrong");
		expect(error.statusCode).toBe(418);
	});

	it("sets the subclass name so instanceof and logging both work", () => {
		class NotFoundError extends AppError {
			constructor(message: string) {
				super(message, 404);
			}
		}

		const error = new NotFoundError("Widget not found");

		expect(error.name).toBe("NotFoundError");
		expect(error).toBeInstanceOf(AppError);
		expect(error).toBeInstanceOf(Error);
	});
});

describe("ApiValidationError", () => {
	it("preserves multiple field errors", () => {
		const error = new ApiValidationError("Invalid job role details", 400, [
			{ field: "roleName", message: "Role name must not be empty" },
			{ field: "closingDate", message: "Closing date must be in the future" },
		]);

		expect(error).toBeInstanceOf(AppError);
		expect(error.statusCode).toBe(400);
		expect(error.fieldErrors).toEqual([
			{ field: "roleName", message: "Role name must not be empty" },
			{ field: "closingDate", message: "Closing date must be in the future" },
		]);
	});

	it("defaults to no field errors when none are given", () => {
		const error = new ApiValidationError("Invalid job role details", 400);

		expect(error.fieldErrors).toEqual([]);
	});
});

describe("createApiError", () => {
	it("builds an ApiValidationError for a 400 with message and errors", () => {
		const error = createApiError(400, {
			message: "Invalid job role details",
			errors: [{ field: "roleName", message: "Role name must not be empty" }],
		});

		expect(error).toBeInstanceOf(ApiValidationError);
		expect(error.message).toBe("Invalid job role details");
		expect((error as ApiValidationError).fieldErrors).toEqual([
			{ field: "roleName", message: "Role name must not be empty" },
		]);
	});

	it("builds an ApiValidationError with no field errors for a 400 with just a message", () => {
		const error = createApiError(400, { message: "Invalid job role details" });

		expect(error).toBeInstanceOf(ApiValidationError);
		expect((error as ApiValidationError).fieldErrors).toEqual([]);
	});

	it("drops malformed entries from the errors array instead of throwing", () => {
		const error = createApiError(400, {
			message: "Invalid job role details",
			errors: [
				{ field: "roleName", message: "Role name must not be empty" },
				{ field: "missingMessage" },
				"not an object",
				null,
			],
		});

		expect((error as ApiValidationError).fieldErrors).toEqual([
			{ field: "roleName", message: "Role name must not be empty" },
		]);
	});

	it("tolerates a malformed/non-JSON body", () => {
		const error = createApiError(400, "<html>Bad Request</html>");

		expect(error).toBeInstanceOf(ApiValidationError);
		expect(error.message).toBe("Invalid request details");
	});

	it("tolerates a missing body", () => {
		const error = createApiError(404, undefined, "Job role not found");

		expect(error.message).toBe("Job role not found");
		expect(error.statusCode).toBe(404);
	});

	it("preserves the backend's message for a 403", () => {
		const error = createApiError(403, {
			message: "Users can only access list and information endpoints",
		});

		expect(error.statusCode).toBe(403);
		expect(error.message).toBe(
			"Users can only access list and information endpoints",
		);
	});

	it("falls back to a generic message for a 403 with none supplied", () => {
		const error = createApiError(403, {});

		expect(error.message).toBe("Forbidden");
	});

	it("preserves the backend's message for a 404", () => {
		const error = createApiError(404, { message: "Band not found" });

		expect(error.message).toBe("Band not found");
	});

	it("uses the caller's fallback message for a 404 with none supplied", () => {
		const error = createApiError(404, {}, "Capability or band not found");

		expect(error.message).toBe("Capability or band not found");
	});

	it("never surfaces the backend's own message for a 401", () => {
		const error = createApiError(401, { message: "jwt malformed" });

		expect(error.message).toBe("Authentication required");
		expect(error.statusCode).toBe(401);
	});

	it("never surfaces the backend's own message for a 500", () => {
		const error = createApiError(500, {
			message: "NullPointerException at row 42",
		});

		expect(error.message).toBe("Backend server error");
		expect(error.message).not.toContain("NullPointerException");
	});
});

describe("createNetworkError", () => {
	it("uses a generic retryable message by default", () => {
		const error = createNetworkError();

		expect(error).toBeInstanceOf(AppError);
		expect(error.message).toBe("Unable to reach the server. Please try again.");
		expect(error.statusCode).toBe(0);
	});

	it("accepts a caller-supplied message", () => {
		const error = createNetworkError(
			"We couldn't create this job role right now. Please try again.",
		);

		expect(error.message).toBe(
			"We couldn't create this job role right now. Please try again.",
		);
	});
});
