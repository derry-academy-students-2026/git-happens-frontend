import type { Request, Response } from "express";
import type { ZodError } from "zod";
import { CreateJobRoleSchema } from "../dtos/jobRoleDto.js";
import { ApiValidationError, AppError } from "../errors/customErrors.js";
import Logger from "../lib/logger.js";
import type { JobRoleService } from "../services/JobRoleService.js";

/** Fields echoed back to the add job role form when validation fails. */
const CREATE_FORM_FIELDS = [
	"roleName",
	"location",
	"capabilityId",
	"bandId",
	"closingDate",
	"description",
	"responsibilities",
	"numberOfOpenPositions",
] as const;

/** Maps a known error message to the dropdown it relates to, so it renders inline instead of as a banner. */
const FIELD_ERROR_BY_MESSAGE: Record<string, string> = {
	"Capability not found": "capabilityId",
	"Band not found": "bandId",
};

/** Handles the HTTP layer for job role pages, delegating data access to the service. */
export class JobRoleController {
	/**
	 * @param service - Source of job role data for every route on this controller.
	 */
	constructor(private service: JobRoleService) {}

	/**
	 * Renders the job role list page.
	 *
	 * @param req - The authenticated `GET /jobs/job-roles` request.
	 * @param res - Renders `pages/job-role-list.njk` with a `jobRoles` array, or
	 * `pages/error.njk` with a 500 on failure.
	 * @returns Resolves once a response has been rendered.
	 * @remarks Never rejects. Service failures are logged and rendered as a 500 error page.
	 */
	async getAll(req: Request, res: Response): Promise<void> {
		try {
			const token = req.authenticatedUser?.token;
			if (!token) {
				Logger.warn(
					"Job role list requested without JWT; redirecting to login",
				);
				res.redirect("/auth/login?returnTo=%2Fjobs%2Fjob-roles");
				return;
			}

			const jobRoles = await this.service.getAllJobRoles(token);
			Logger.debug(`Rendering job role list of ${jobRoles.length} roles`);
			res.render("pages/job-role-list.njk", { jobRoles });
		} catch (error) {
			Logger.error(
				`Failed to render the job role list: ${error instanceof Error ? error.message : String(error)}`,
			);
			if (
				error instanceof Error &&
				error.message === "Authentication required"
			) {
				Logger.warn(
					"Backend rejected job role list token; clearing JWT cookie",
				);
				res.clearCookie("jwt", { path: "/" });
				res.redirect("/auth/login?returnTo=%2Fjobs%2Fjob-roles");
				return;
			}
			res
				.status(500)
				.render("pages/error.njk", { error: "Internal Server Error" });
		}
	}

	/**
	 * Renders the information page for a single job role.
	 *
	 * @param req - The `GET /jobs/job-roles/:id` request, whose `id` param selects the role.
	 * @param res - Renders `pages/job-role-information.njk` with a `jobRole`, or
	 * `pages/error.njk` with a 400, 404 or 500 on failure.
	 * @returns Resolves once a response has been rendered.
	 * @remarks Never rejects. Invalid ids and service failures are rendered as error pages.
	 */
	async getById(req: Request, res: Response): Promise<void> {
		const id = Number(req.params.id);
		if (!Number.isInteger(id) || id < 1) {
			Logger.warn(
				`Rejected job role request with invalid id: ${req.params.id}`,
			);
			res
				.status(400)
				.render("pages/error.njk", { error: "That job role id is not valid" });
			return;
		}

		try {
			const token = req.authenticatedUser?.token;
			if (!token) {
				Logger.warn(
					`Job role ${id} requested without JWT; redirecting to login`,
				);
				res.redirect(
					`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`,
				);
				return;
			}

			const jobRole = await this.service.getJobRoleById(id, token);
			Logger.debug(`Rendering job role information for id ${id}`);
			res.render("pages/job-role-information.njk", { jobRole });
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			Logger.error(`Failed to render job role ${id}: ${message}`);
			if (message === "Authentication required") {
				Logger.warn(
					`Backend rejected token for job role ${id}; clearing JWT cookie`,
				);
				res.clearCookie("jwt", { path: "/" });
				res.redirect(
					`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`,
				);
				return;
			}
			if (message === "Job role not found") {
				res
					.status(404)
					.render("pages/error.njk", { error: "Job role not found" });
				return;
			}
			res
				.status(500)
				.render("pages/error.njk", { error: "Internal Server Error" });
		}
	}

	/**
	 * Clears the session and redirects to login when the backend rejects the token.
	 *
	 * @param message - Message from the failed service call.
	 * @param req - Request used to build the post-login return target.
	 * @param res - Response used to clear the cookie and redirect.
	 * @returns `true` when the failure was handled as an auth redirect.
	 */
	private handleAuthFailure(
		message: string,
		req: Request,
		res: Response,
	): boolean {
		if (message !== "Authentication required") {
			return false;
		}

		Logger.warn("Backend rejected job role token; clearing JWT cookie");
		res.clearCookie("jwt", { path: "/" });
		res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
		return true;
	}

	/**
	 * Reduces a Zod error to one message per field for inline form display.
	 *
	 * @param error - Validation error raised by the create job role schema.
	 * @returns Field name to first error message.
	 */
	private toFieldErrors(error: ZodError): Record<string, string> {
		const { fieldErrors } = error.flatten();
		const messagesByField: Record<string, string> = {};

		for (const [field, messages] of Object.entries(fieldErrors)) {
			const firstMessage = messages?.[0];
			if (firstMessage) {
				messagesByField[field] = firstMessage;
			}
		}

		return messagesByField;
	}

	/**
	 * Maps a backend `ApiValidationError` onto the form's known fields.
	 *
	 * Field errors for names the form doesn't recognise are surfaced in the general
	 * error area instead of being silently dropped.
	 *
	 * @param error - Validation error thrown by `JobRoleService.createJobRole`.
	 * @returns Field name to combined error message, plus the summary banner text.
	 */
	private mapApiValidationError(error: ApiValidationError): {
		errors: Record<string, string>;
		errorMessage: string;
	} {
		const knownFields = new Set<string>(CREATE_FORM_FIELDS);
		const errors: Record<string, string> = {};
		const unmatchedMessages: string[] = [];

		for (const { field, message } of error.fieldErrors) {
			if (knownFields.has(field)) {
				errors[field] = errors[field] ? `${errors[field]} ${message}` : message;
			} else {
				unmatchedMessages.push(message);
			}
		}

		if (unmatchedMessages.length > 0) {
			return { errors, errorMessage: unmatchedMessages.join(" ") };
		}
		if (Object.keys(errors).length > 0) {
			return {
				errors,
				errorMessage: "Please correct the highlighted fields and try again.",
			};
		}
		return { errors, errorMessage: error.message };
	}

	/**
	 * Echoes submitted values back so a rejected form does not have to be retyped.
	 *
	 * @param body - Raw request body from the form post.
	 * @returns Submitted values as strings, keyed by field name.
	 */
	private toFormValues(body: Record<string, unknown>): Record<string, string> {
		return Object.fromEntries(
			CREATE_FORM_FIELDS.map((field) => [
				field,
				typeof body[field] === "string" ? (body[field] as string) : "",
			]),
		);
	}

	/**
	 * Renders the add job role form with the capability and band dropdown options.
	 *
	 * @param res - Response used to render `pages/job-role-form.njk`.
	 * @param token - Bearer token used to load the dropdown options.
	 * @param options - Optional status, submitted values, field errors and summary message.
	 * @returns Resolves once the form has been rendered.
	 */
	private async renderCreateForm(
		res: Response,
		token: string,
		options: {
			status?: number;
			formValues?: Record<string, string>;
			errors?: Record<string, string>;
			errorMessage?: string | null;
		} = {},
	): Promise<void> {
		const [capabilities, bands] = await Promise.all([
			this.service.getCapabilities(token),
			this.service.getBands(token),
		]);

		res.status(options.status ?? 200).render("pages/job-role-form.njk", {
			capabilities,
			bands,
			todayIsoDate: new Date().toISOString().slice(0, 10),
			formValues: options.formValues ?? {},
			errors: options.errors ?? {},
			errorMessage: options.errorMessage ?? null,
		});
	}

	/**
	 * Renders the empty add job role form for an admin.
	 *
	 * @param req - The authenticated `GET /jobs/job-roles/new` request.
	 * @param res - Renders `pages/job-role-form.njk`, or `pages/error.njk` with a 500 on failure.
	 * @returns Resolves once a response has been rendered.
	 * @remarks Never rejects. Service failures are logged and rendered as a 500 error page.
	 */
	async showCreateForm(req: Request, res: Response): Promise<void> {
		try {
			const token = req.authenticatedUser?.token;
			if (!token) {
				Logger.warn(
					"Add job role form requested without JWT; redirecting to login",
				);
				res.redirect("/auth/login?returnTo=%2Fjobs%2Fjob-roles%2Fnew");
				return;
			}

			Logger.debug("Rendering the add job role form");
			await this.renderCreateForm(res, token);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			Logger.error(`Failed to render the add job role form: ${message}`);
			if (this.handleAuthFailure(message, req, res)) {
				return;
			}
			res
				.status(500)
				.render("pages/error.njk", { error: "Internal Server Error" });
		}
	}

	/**
	 * Validates and submits a new job role, then redirects to the created role.
	 *
	 * @param req - The authenticated `POST /jobs/job-roles` request carrying the form body.
	 * @param res - Redirects to the new role, or re-renders the form with errors.
	 * @returns Resolves once a response has been rendered or redirected.
	 * @remarks Never rejects. Validation and service failures are rendered back onto the form.
	 */
	async create(req: Request, res: Response): Promise<void> {
		const token = req.authenticatedUser?.token;
		if (!token) {
			Logger.warn(
				"Job role creation attempted without JWT; redirecting to login",
			);
			res.redirect("/auth/login?returnTo=%2Fjobs%2Fjob-roles%2Fnew");
			return;
		}

		const body = (req.body ?? {}) as Record<string, unknown>;
		const validation = CreateJobRoleSchema.safeParse(body);

		try {
			if (!validation.success) {
				Logger.warn("Rejected job role creation with invalid form details");
				await this.renderCreateForm(res, token, {
					status: 400,
					formValues: this.toFormValues(body),
					errors: this.toFieldErrors(validation.error),
					errorMessage: "Please correct the highlighted fields and try again.",
				});
				return;
			}

			const jobRole = await this.service.createJobRole(validation.data, token);
			Logger.info(`Created job role ${jobRole.jobRoleId}`);
			res.redirect(`/jobs/job-roles/${jobRole.jobRoleId}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			Logger.error(`Failed to create job role: ${message}`);

			if (this.handleAuthFailure(message, req, res)) {
				return;
			}

			if (!(error instanceof AppError)) {
				res
					.status(500)
					.render("pages/error.njk", { error: "Internal Server Error" });
				return;
			}

			if (error.statusCode === 403) {
				res.status(403).render("pages/error.njk", { error: error.message });
				return;
			}

			try {
				if (error instanceof ApiValidationError) {
					const { errors, errorMessage } = this.mapApiValidationError(error);
					await this.renderCreateForm(res, token, {
						status: 400,
						formValues: this.toFormValues(body),
						errors,
						errorMessage,
					});
					return;
				}

				// createJobRole only ever throws safe, user-facing messages via AppError/createApiError.
				const fieldForMessage = FIELD_ERROR_BY_MESSAGE[error.message];
				await this.renderCreateForm(res, token, {
					status: 400,
					formValues: this.toFormValues(body),
					errors: fieldForMessage ? { [fieldForMessage]: error.message } : {},
					errorMessage: fieldForMessage ? null : error.message,
				});
			} catch (renderError) {
				Logger.error(
					`Failed to re-render the add job role form: ${renderError instanceof Error ? renderError.message : String(renderError)}`,
				);
				res
					.status(500)
					.render("pages/error.njk", { error: "Internal Server Error" });
			}
		}
	}
}
