import type { NextFunction, Request, Response } from "express";
import type { ZodError } from "zod";
import {
	JobRoleSchema,
	type CreateJobRoleRequestDTO,
} from "../dtos/jobRoleDto.js";

declare module "express-serve-static-core" {
	interface Request {
		jobRoleInput?: CreateJobRoleRequestDTO;
		jobRoleValidationError?: ZodError;
	}
}

/**
 * Validates a job role creation body against `JobRoleSchema`, so the
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
	const result = JobRoleSchema.safeParse(req.body ?? {});

	if (result.success) {
		req.jobRoleInput = result.data;
	} else {
		req.jobRoleValidationError = result.error;
	}

	next();
}
