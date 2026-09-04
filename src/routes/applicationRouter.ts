import { Router } from "express";
import { ApplicationController } from "../controllers/ApplicationController.js";
import { JobRoleController } from "../controllers/JobRoleController.js";
import Logger from "../lib/logger.js";
import { requireJwt } from "../middleware/auth.js";
import { validateJobApplication } from "../middleware/validateApplication.js";
import { ApplicationServiceImpl } from "../services/applicationService.js";
import { JobRoleService } from "../services/JobRoleService.js";

const applicationRouter = Router();
const jobRoleService = new JobRoleService();
const controller = new ApplicationController(
	jobRoleService,
	new ApplicationServiceImpl(),
);
// Reused so Cancel links and the post-submit redirect can stay under /applications.
const jobRoleController = new JobRoleController(jobRoleService);

applicationRouter.get("/job-roles/:id", requireJwt, (req, res) => {
	Logger.debug(`GET /applications/job-roles/${req.params.id}`);
	jobRoleController.getById(req, res);
});

applicationRouter.get("/job-roles/:id/apply", requireJwt, (req, res) => {
	Logger.debug(`GET /applications/job-roles/${req.params.id}/apply`);
	controller.showForm(req, res);
});

applicationRouter.post(
	"/job-roles/:id/apply",
	requireJwt,
	validateJobApplication,
	(req, res) => {
		Logger.debug(`POST /applications/job-roles/${req.params.id}/apply`);
		controller.submit(req, res);
	},
);

export default applicationRouter;