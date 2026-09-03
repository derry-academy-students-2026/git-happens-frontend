import { Router } from "express";
import { ApplicationController } from "../controllers/ApplicationController.js";
import Logger from "../lib/logger.js";
import { requireJwt } from "../middleware/auth.js";
import { validateJobApplication } from "../middleware/validateApplication.js";
import { ApplicationServiceImpl } from "../services/applicationService.js";
import { JobRoleService } from "../services/JobRoleService.js";

const applicationRouter = Router();
const controller = new ApplicationController(
	new JobRoleService(),
	new ApplicationServiceImpl(),
);

applicationRouter.get("/job-roles/:id/apply", requireJwt, (req, res) => {
	Logger.debug(`GET /jobs/job-roles/${req.params.id}/apply`);
	controller.showForm(req, res);
});

applicationRouter.post(
	"/job-roles/:id/apply",
	requireJwt,
	validateJobApplication,
	(req, res) => {
		Logger.debug(`POST /jobs/job-roles/${req.params.id}/apply`);
		controller.submit(req, res);
	},
);

export default applicationRouter;