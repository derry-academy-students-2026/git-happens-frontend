import { resolve } from "node:path";
import { config } from "dotenv";

export type EnvironmentName = "local" | "staging" | "production";

export interface EnvironmentConfig {
	name: EnvironmentName;
	baseUrl: string;
	isLocal: boolean;
}

/**
 * Resolves the target application from TEST_ENV and PLAYWRIGHT_BASE_URL.
 *
 * @throws Error when TEST_ENV is unsupported or a remote environment has no URL.
 * @returns Configuration for the selected test environment.
 */
function resolveEnvironment(): EnvironmentConfig {
	const environmentName = process.env.TEST_ENV ?? "local";

	if (
		environmentName !== "local" &&
		environmentName !== "staging" &&
		environmentName !== "production"
	) {
		throw new Error(
			`Unsupported TEST_ENV "${environmentName}". Use local, staging, or production.`,
		);
	}

	config({
		path: resolve(process.cwd(), `.env.e2e.${environmentName}`),
		override: false,
	});

	const isLocal = environmentName === "local";
	const baseUrl =
		process.env.PLAYWRIGHT_BASE_URL ??
		(isLocal ? "http://localhost:3000" : undefined);

	if (!baseUrl) {
		throw new Error(
			"PLAYWRIGHT_BASE_URL is required when running against staging or production.",
		);
	}

	return { name: environmentName, baseUrl, isLocal };
}

export const environment = resolveEnvironment();
