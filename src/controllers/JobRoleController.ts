import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import type { JobRoleService } from "../services/JobRoleService.js";

/** Handles the HTTP layer for job role pages, delegating data access to the service. */
export class JobRoleController {
	/**
	 * @param service - Source of job role data for every route on this controller.
	 */
	constructor(private service: JobRoleService) {}

	/**
	 * Renders the job role list page.
	 *
	 * @param _req - The `GET /jobs/job-roles` request. Unused, as the route reads no
	 * params, query or body.
	 * @param res - Renders `pages/job-role-list.njk` with a `jobRoles` array, or
	 * `pages/error.njk` with a 500 on failure.
	 * @returns Resolves once a response has been rendered.
	 * @remarks Never rejects. Service failures are logged and rendered as a 500 error page.
	 */
	async getAll(_req: Request, res: Response): Promise<void> {
		try {
			const jobRoles = await this.service.getAllJobRoles();
			Logger.debug(`Rendering job role list with ${jobRoles.length} roles`);
			res.render("pages/job-role-list.njk", { jobRoles });
		} catch (error) {
			Logger.error(
				`Failed to render the job role list: ${error instanceof Error ? error.message : String(error)}`,
			);
			res
				.status(500)
				.render("pages/error.njk", { error: "Internal Server Error" });
		}
	}
}
