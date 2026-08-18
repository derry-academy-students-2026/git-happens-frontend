import { environment } from "./configuration/environment.js";

/**
 * Verifies that the selected application is available before browser tests begin.
 *
 * @throws Error when the application's health endpoint cannot return a successful response.
 * @returns A promise that resolves when the test target is healthy.
 */
async function globalSetup(): Promise<void> {
	const response = await fetch(new URL("/health", environment.baseUrl));

	if (!response.ok) {
		throw new Error(
			`The ${environment.name} test target is unhealthy: HTTP ${response.status}.`,
		);
	}
}

export default globalSetup;
