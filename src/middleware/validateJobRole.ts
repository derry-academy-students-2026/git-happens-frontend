import type { NextFunction, Request, Response } from "express";
import type { ZodError } from "zod";
import { CreateJobRoleSchema } from "../dtos/jobRoleDto.js";
import type { CreateJobRoleRequestDTO } from "../models/jobRoleModel.js";

declare module "express-serve-static-core" {
	interface Request {
		jobRoleInput?: CreateJobRoleRequestDTO;
		jobRoleValidationError?: ZodError;
	}
}

/**
 * Validates a job role creation body against `CreateJobRoleSchema`, so the
 * controller only ever deals with already-parsed data or a validation error.
 *
 * @param req - Incoming `POST /jobs/job-roles` request.
 * @param _res - Unused; validation never short-circuits the response here.
 * @param next - Always called; the controller decides how to react to a failed parse.
 */
export function validateCreateJobRole(
	req: Request,
	_res: Response,
	next: NextFunction,
): void {
	const result = CreateJobRoleSchema.safeParse(req.body ?? {});

	if (result.success) {
		req.jobRoleInput = result.data;
	} else {
		req.jobRoleValidationError = result.error;
	}

	next();
}
