import type { Request, Response } from "express";
import Logger from "../lib/logger.js";
import type { JobRoleService } from "../services/JobRoleService.js";

// Handles the HTTP layer for job role pages, delegating data access to the service.
export class JobRoleController {
	constructor(private service: JobRoleService) {}

	// Renders the job role list, or the error page if the service fails.
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
