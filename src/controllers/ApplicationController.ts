import type { Request, Response } from "express";
import { AppError } from "../errors/customErrors.js";
import Logger from "../lib/logger.js";
import type { ApplicationService } from "../services/applicationService.js";
import type { JobRoleService } from "../services/JobRoleService.js";

/** Handles HTTP concerns for job role applications. */
export class ApplicationController {
	constructor(
		private jobRoleService: JobRoleService,
		private applicationService: ApplicationService,
	) {}

	/**
	 * Renders the current authenticated user's job application list.
	 *
	 * @param req - Authenticated `GET /applications` request with a JWT subject.
	 * @param res - Renders the application list, error page, or redirects to login.
	 * @returns Resolves once the response has been rendered or redirected.
	 */
	async getAll(req: Request, res: Response): Promise<void> {
		const token = req.authenticatedUser?.token;
		const userId = req.authenticatedUser?.userId;
		if (!token || !userId) {
			Logger.warn("Application list requested without a usable JWT subject");
			res.clearCookie("jwt", { path: "/" });
			res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
			return;
		}

		try {
			const applications = await this.applicationService.getApplicationsForUser(
				userId,
				token,
			);
			Logger.debug(`Rendering ${applications.length} applications for user ${userId}`);
			res.render("pages/application-list.njk", { applications });
		} catch (error) {
			this.handleError(error, req, res, `render applications for user ${userId}`);
		}
	}

	/** Renders the application form for an open job role. */
	async showForm(req: Request, res: Response): Promise<void> {
		const jobRoleId = Number(req.params.id);
		if (!Number.isInteger(jobRoleId) || jobRoleId < 1) {
			res.status(400).render("pages/error.njk", { error: "That job role id is not valid" });
			return;
		}

		const token = req.authenticatedUser?.token;
		if (!token) {
			res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
			return;
		}

		try {
			const jobRole = await this.jobRoleService.getJobRoleById(jobRoleId, token);
			if (jobRole.status.statusName !== "Open" || jobRole.numberOfOpenPositions <= 0) {
				res.status(403).render("pages/error.njk", { error: "This role is not accepting applications" });
				return;
			}
			res.render("pages/job-application.njk", { jobRole, authenticatedUser: req.authenticatedUser });
		} catch (error) {
			this.handleError(error, req, res, `render application form for role ${jobRoleId}`);
		}
	}

	/** Submits application input parsed by `validateJobApplication`. */
	async submit(req: Request, res: Response): Promise<void> {
		const jobRoleId = Number(req.params.id);
		if (!Number.isInteger(jobRoleId) || jobRoleId < 1) {
			res.status(400).render("pages/error.njk", { error: "That job role id is not valid" });
			return;
		}

		const token = req.authenticatedUser?.token;
		if (!token) {
			res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
			return;
		}
		if (!req.jobApplicationInput) {
			res.status(400).render("pages/error.njk", { error: "Invalid application details" });
			return;
		}

		try {
			await this.applicationService.applyForRole(jobRoleId, req.jobApplicationInput, token);
			res.redirect(`/applications/job-roles/${jobRoleId}?applied=1`);
		} catch (error) {
			if (error instanceof AppError && error.statusCode === 409) {
				Logger.warn(`Duplicate application rejected for role ${jobRoleId}`);
				res.redirect(`/applications/job-roles/${jobRoleId}?alreadyApplied=1`);
				return;
			}
			this.handleError(error, req, res, `submit application for role ${jobRoleId}`);
		}
	}

	/** Handles expected application errors without exposing unexpected failure details. */
	private handleError(error: unknown, req: Request, res: Response, action: string): void {
		Logger.error(`Failed to ${action}: ${error instanceof Error ? error.message : String(error)}`);
		if (error instanceof AppError && error.statusCode === 401) {
			res.clearCookie("jwt", { path: "/" });
			res.redirect(`/auth/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
			return;
		}
		if (error instanceof AppError && [400, 403, 404, 409].includes(error.statusCode)) {
			res.status(error.statusCode).render("pages/error.njk", { error: error.message });
			return;
		}
		res.status(500).render("pages/error.njk", { error: "Internal Server Error" });
	}
}