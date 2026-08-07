import type { Request, Response } from "express";
import type { JobRoleService } from "../services/JobRoleService.js";

export class JobRoleController {
	constructor(private service: JobRoleService) {}

	async getAll(_req: Request, res: Response): Promise<void> {
		try {
			const jobRoles = await this.service.getAllJobRoles();
			res.render("pages/job-role-list.njk", { jobRoles });
		} catch (_error) {
			res
				.status(500)
				.render("pages/error.njk", { error: "Internal Server Error" });
		}
	}
}
