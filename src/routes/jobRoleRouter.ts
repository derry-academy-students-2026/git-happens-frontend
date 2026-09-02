import { Router } from "express";
import { JobRoleController } from "../controllers/JobRoleController.js";
import Logger from "../lib/logger.js";
import { requireAdmin, requireJwt } from "../middleware/auth.js";
import { validateCreateJobRole } from "../middleware/validateJobRole.js";
import { JobRoleService } from "../services/JobRoleService.js";

const jobRoleRouter = Router();
const service = new JobRoleService();
const controller = new JobRoleController(service);

/**
 * Renders the jobs landing page.
 *
 * @param _req - Express request for the jobs home page.
 * @param res - Express response used to render the index template.
 */
jobRoleRouter.get("/", (_req, res) => {
	Logger.debug("GET /jobs");
	res.render("pages/index.njk");
});

/**
 * Renders every job role returned by the API.
 *
 * @param req - Express request for job role listing.
 * @param res - Express response used to render the list page.
 */
jobRoleRouter.get("/job-roles", requireJwt, (req, res) => {
	Logger.debug("GET /jobs/job-roles");
	controller.getAll(req, res);
});

/**
 * Renders the admin form for adding a job role.
 *
 * Registered before `/job-roles/:id` so that `new` is not captured as an id.
 *
 * @param req - Express request from an authenticated admin.
 * @param res - Express response used to render the add role form.
 */
jobRoleRouter.get("/job-roles/new", requireJwt, requireAdmin, (req, res) => {
	Logger.debug("GET /jobs/job-roles/new");
	controller.showCreateForm(req, res);
});

/**
 * Creates a job role from the admin form submission.
 *
 * Schema validation runs in `validateCreateJobRole` first, so the controller
 * only ever sees an already-parsed body or a validation error.
 *
 * @param req - Express request carrying the job role form body.
 * @param res - Express response used to redirect or re-render the form.
 */
jobRoleRouter.post(
	"/job-roles",
	requireJwt,
	requireAdmin,
	validateCreateJobRole,
	(req, res) => {
		Logger.debug("POST /jobs/job-roles");
		controller.create(req, res);
	},
);

/**
 * Renders the information page for a single job role.
 *
 * @param req - Express request that includes a job role id route param.
 * @param res - Express response used to render the detail page.
 */
jobRoleRouter.get("/job-roles/:id", requireJwt, (req, res) => {
	Logger.debug(`GET /jobs/job-roles/${req.params.id}`);
	controller.getById(req, res);
});

export default jobRoleRouter;
