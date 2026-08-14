import { Router } from "express";
import { JobRoleController } from "../controllers/JobRoleController.js";
import Logger from "../lib/logger.js";
import { requireJwt } from "../middleware/auth.js";
import { JobRoleService } from "../services/JobRoleService.js";

const jobRouter = Router();
const service = new JobRoleService();
const controller = new JobRoleController(service);

/**
 * Renders the jobs landing page.
 *
 * @param _req - Express request for the jobs home page.
 * @param res - Express response used to render the index template.
 */
jobRouter.get("/", (_req, res) => {
	Logger.debug("GET /jobs");
	res.render("pages/index.njk");
});

/**
 * Renders every job role returned by the API.
 *
 * @param req - Express request for job role listing.
 * @param res - Express response used to render the list page.
 */
jobRouter.get("/job-roles", requireJwt, (req, res) => {
	Logger.debug("GET /jobs/job-roles");
	controller.getAll(req, res);
});

/**
 * Renders the information page for a single job role.
 *
 * @param req - Express request that includes a job role id route param.
 * @param res - Express response used to render the detail page.
 */
jobRouter.get("/job-roles/:id", requireJwt, (req, res) => {
	Logger.debug(`GET /jobs/job-roles/${req.params.id}`);
	controller.getById(req, res);
});

export default jobRouter;
