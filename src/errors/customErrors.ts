/** Base class for expected application errors that carry an HTTP status code. */
export class AppError extends Error {
	readonly statusCode: number;

	/**
	 * @param message - User-safe error message.
	 * @param statusCode - HTTP status code the error represents.
	 */
	constructor(message: string, statusCode: number) {
		super(message);
		this.name = new.target.name;
		this.statusCode = statusCode;
		// Restores the prototype chain that `super(message)` breaks when targeting ES2015+ for subclasses of Error.
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/** A single backend field-level validation failure. */
export interface FieldError {
	field: string;
	message: string;
}

/** Raised when the backend rejects a request with field-level validation errors. */
export class ApiValidationError extends AppError {
	readonly fieldErrors: FieldError[];

	/**
	 * @param message - The backend's top-level message.
	 * @param statusCode - HTTP status code, normally 400.
	 * @param fieldErrors - Field-level errors from the backend, if any were sent.
	 */
	constructor(
		message: string,
		statusCode: number,
		fieldErrors: FieldError[] = [],
	) {
		super(message, statusCode);
		this.fieldErrors = fieldErrors;
	}
}

/** Shape of a backend error body; every field is optional since malformed or non-JSON bodies must not crash the parser. */
interface ApiErrorBody {
	message?: unknown;
	errors?: unknown;
}

/** Backend-safe fallback messages, used whenever the response has no usable `message`. */
const DEFAULT_MESSAGES: Partial<Record<number, string>> = {
	400: "Invalid request details",
	401: "Authentication required",
	403: "Forbidden",
	404: "Not found",
	500: "Backend server error",
};

/**
 * Narrows an unknown value down to the `FieldError[]` the backend may have sent.
 *
 * @param value - The `errors` property of a parsed error body, if present.
 * @returns Well-formed field errors only; malformed entries are dropped rather than thrown.
 */
function toFieldErrors(value: unknown): FieldError[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter(
		(entry): entry is FieldError =>
			typeof entry === "object" &&
			entry !== null &&
			typeof (entry as FieldError).field === "string" &&
			typeof (entry as FieldError).message === "string",
	);
}

/**
 * Picks a safe display message, never trusting a non-string or empty value.
 *
 * @param value - The `message` property of a parsed error body, if present.
 * @param fallback - Message to use when `value` is not a usable string.
 */
function toSafeMessage(value: unknown, fallback: string): string {
	return typeof value === "string" && value.trim() ? value : fallback;
}

/**
 * Converts a backend HTTP error response into the appropriate `AppError`.
 *
 * Mirrors the backend's own error contract (a status code plus a safe message), while
 * tolerating a missing body, a non-object body, or a missing/malformed `errors` array -
 * the response may not even be JSON, e.g. an upstream proxy's HTML error page.
 *
 * @param statusCode - HTTP status code of the response.
 * @param body - Parsed response body, whatever shape it turned out to be.
 * @param fallbackMessage - Message to use in place of the generic default for this status,
 * when the backend did not supply one. Ignored for 401 and 500, whose messages are always
 * generic so nothing sensitive is ever surfaced for those statuses.
 * @returns An `ApiValidationError` for 400 responses, otherwise a plain `AppError`.
 */
export function createApiError(
	statusCode: number,
	body: unknown,
	fallbackMessage?: string,
): AppError {
	const errorBody = (
		typeof body === "object" && body !== null ? body : {}
	) as ApiErrorBody;
	const defaultMessage =
		DEFAULT_MESSAGES[statusCode] ?? `Request failed with status ${statusCode}`;

	if (statusCode === 401 || statusCode === 500) {
		// Never forward backend internals for authentication or unexpected server failures.
		return new AppError(defaultMessage, statusCode);
	}

	const message = toSafeMessage(
		errorBody.message,
		fallbackMessage ?? defaultMessage,
	);

	if (statusCode === 400) {
		return new ApiValidationError(
			message,
			statusCode,
			toFieldErrors(errorBody.errors),
		);
	}

	return new AppError(message, statusCode);
}

/**
 * Builds a safe error for failures that never reached the backend, e.g. a dropped
 * connection, a timeout, or any other unexpected failure the caller cannot classify.
 *
 * @param message - User-safe, retryable message specific to the calling flow.
 */
export function createNetworkError(
	message = "Unable to reach the server. Please try again.",
): AppError {
	return new AppError(message, 0);
}
