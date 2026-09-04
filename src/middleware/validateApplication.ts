import type { NextFunction, Request, Response } from "express";
import { JobApplicationRequestDtoSchema } from "../dtos/applicationDto.js";
import type { JobApplicationRequestDto } from "../dtos/applicationDto.js";

declare module "express-serve-static-core" {
	interface Request {
		jobApplicationInput?: JobApplicationRequestDto;
	}
}

/**
 * Validates a job application form body before it reaches the application controller.
 *
 * @param req - Incoming `POST /applications/job-roles/:id/apply` request.
 * @param res - Sends a safe validation error page when the input is invalid.
 * @param next - Continues with the parsed application input when validation succeeds.
 */
export function validateJobApplication(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const result = JobApplicationRequestDtoSchema.safeParse(req.body ?? {});

	if (!result.success) {
		const message =
			result.error.errors[0]?.message ?? "Invalid application details";
		res.status(400).render("pages/error.njk", { error: message });
		return;
	}

	req.jobApplicationInput = result.data;
	next();
}