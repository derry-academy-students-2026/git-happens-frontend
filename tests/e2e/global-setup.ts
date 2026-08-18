import { environment } from "./configuration/environment.js";

/**
 * Verifies that the application is available before browser tests begin.
 *
 * @throws Error when the application's health endpoint is unavailable.
 * @returns A promise that resolves when the test target is healthy.
 */
async function globalSetup(): Promise<void> {
	const response = await fetch(new URL("/health", environment.baseUrl));

	if (!response.ok) {
		throw new Error(`The test target is unhealthy: HTTP ${response.status}.`);
	}
}

export default globalSetup;
