import type { Request, Response } from "express";
import { ApplyForRoleSchema } from "../dtos/applicationDto.js";
import Logger from "../lib/logger.js";
import type { ApplicationApiService } from "../services/applicationApiService.js";
import type { JobRoleService } from "../services/JobRoleService.js";

/** Handles the HTTP layer for job role pages, delegating data access to the service. */
export class JobRoleController {
	/**
	 * @param service - Source of job role data for every route on this controller.
	 * @param applicationService - Service for submitting job applications.
	 */
	constructor(
		private service: JobRoleService,
		private applicationService: ApplicationApiService,
	) {}

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
				Logger.warn("Job role list requested without JWT; redirecting to login");
				res.redirect("/auth/login?returnTo=%2Fjobs%2Fjob-roles");
				return;
			}

			const jobRoles = await this.service.getAllJobRoles(token);
			Logger.debug(`Rendering job role list with ${jobRoles.length} roles`);
			res.render("pages/job-role-list.njk", { jobRoles });
		} catch (error) {
			Logger.error(
				`Failed to render the job role list: ${error instanceof Error ? error.message : String(error)}`,
			);
			if (error instanceof Error && error.message === "Authentication required") {
				Logger.warn("Backend rejected job role list token; clearing JWT cookie");
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
				Logger.warn(`Job role ${id} requested without JWT; redirecting to login`);
				res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
				return;
			}

			const jobRole = await this.service.getJobRoleById(id, token);
			Logger.debug(`Rendering job role information for id ${id}`);
			res.render("pages/job-role-information.njk", {
				jobRole,
				authenticatedUser: req.authenticatedUser,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			Logger.error(`Failed to render job role ${id}: ${message}`);
			if (message === "Authentication required") {
				Logger.warn(`Backend rejected token for job role ${id}; clearing JWT cookie`);
				res.clearCookie("jwt", { path: "/" });
				res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
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
	 * Renders the job application form for a specific job role.
	 *
	 * @param req - The authenticated `GET /jobs/job-roles/:id/apply` request.
	 * @param res - Renders `pages/job-application.njk` with the `jobRole`, or
	 * `pages/error.njk` with a 400, 404 or 500 on failure.
	 * @returns Resolves once a response has been rendered.
	 * @remarks Never rejects. Invalid ids and service failures are rendered as error pages.
	 */
	async showApplyForm(req: Request, res: Response): Promise<void> {
		const id = Number(req.params.id);
		if (!Number.isInteger(id) || id < 1) {
			Logger.warn(
				`Rejected apply form request with invalid id: ${req.params.id}`,
			);
			res
				.status(400)
				.render("pages/error.njk", { error: "That job role id is not valid" });
			return;
		}

		try {
			const token = req.authenticatedUser?.token;
			if (!token) {
				Logger.warn(`Apply form for role ${id} requested without JWT; redirecting to login`);
				res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
				return;
			}

			const jobRole = await this.service.getJobRoleById(id, token);

			// Check if role is open and has positions available
			if (
				jobRole.status.statusName !== "Open" ||
				jobRole.numberOfOpenPositions <= 0
			) {
				Logger.warn(
					`Application attempt for closed role ${id} or no positions available`,
				);
				res
					.status(403)
					.render("pages/error.njk", { error: "This role is not accepting applications" });
				return;
			}

			Logger.debug(`Rendering job application form for role ${id}`);
			res.render("pages/job-application.njk", {
				jobRole,
				authenticatedUser: req.authenticatedUser,
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			Logger.error(`Failed to render apply form for role ${id}: ${message}`);
			if (message === "Authentication required") {
				Logger.warn(`Backend rejected token for apply form role ${id}; clearing JWT cookie`);
				res.clearCookie("jwt", { path: "/" });
				res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
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
	 * Submits a job application for a specific role.
	 *
	 * @param req - The authenticated `POST /jobs/job-roles/:id/apply` request with form data.
	 * @param res - Redirects to job role detail on success, or renders error page on failure.
	 * @returns Resolves once a response has been sent.
	 * @remarks Never rejects. Validation and submission errors are rendered as error pages.
	 */
	async submitApplication(req: Request, res: Response): Promise<void> {
		const id = Number(req.params.id);
		if (!Number.isInteger(id) || id < 1) {
			Logger.warn(
				`Rejected application submission with invalid id: ${req.params.id}`,
			);
			res
				.status(400)
				.render("pages/error.njk", { error: "That job role id is not valid" });
			return;
		}

		// Validate form data
		const validationResult = ApplyForRoleSchema.safeParse(req.body);
		if (!validationResult.success) {
			const firstError = validationResult.error.errors[0];
			Logger.warn(`Application validation failed: ${firstError.message}`);
			res.status(400).render("pages/error.njk", { error: firstError.message });
			return;
		}

		try {
			const token = req.authenticatedUser?.token;
			if (!token) {
				Logger.warn(
					`Application submission for role ${id} requested without JWT; redirecting to login`,
				);
				res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
				return;
			}

			Logger.debug(`Submitting application for role ${id}`);
			await this.applicationService.applyForRole(id, validationResult.data, token);

			Logger.info(`Application submitted successfully for role ${id}`);
			res.redirect(`/jobs/job-roles/${id}?applied=1`);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			Logger.error(`Failed to submit application for role ${id}: ${message}`);

			if (message === "Authentication required") {
				Logger.warn(`Backend rejected token for application role ${id}; clearing JWT cookie`);
				res.clearCookie("jwt", { path: "/" });
				res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
				return;
			}

			if (
				message === "Job role not found" ||
				message === "This role is not accepting applications" ||
				message === "You have already applied for this role"
			) {
				res.status(409).render("pages/error.njk", { error: message });
				return;
			}

			res
				.status(500)
				.render("pages/error.njk", { error: "Internal Server Error" });
		}
	}
}
