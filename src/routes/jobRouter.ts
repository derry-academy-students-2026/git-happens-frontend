import { Router } from "express";
import { JobRoleController } from "../controllers/JobRoleController.js";
import { JobRoleService } from "../services/JobRoleService.js";

const jobRouter = Router();
const service = new JobRoleService();
const controller = new JobRoleController(service);

/** Renders the jobs landing page. */
jobRouter.get("/", (_req, res) => {
	res.render("pages/index.njk");
});

/** Renders every job role returned by the API. */
jobRouter.get("/job-roles", (req, res) => controller.getAll(req, res));

export default jobRouter;
