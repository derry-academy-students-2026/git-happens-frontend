import { Router } from "express";
import { JobRoleController } from "../controllers/JobRoleController.js";
import { JobRoleService } from "../services/JobRoleService.js";

const jobRouter = Router();
const service = new JobRoleService();
const controller = new JobRoleController(service);

jobRouter.get("/", (_req, res) => {
	res.render("pages/index.njk");
});

jobRouter.get("/job-roles", (req, res) => controller.getAll(req, res));

export default jobRouter;
