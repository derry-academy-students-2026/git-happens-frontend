import type { APIRequestContext, APIResponse } from "@playwright/test";
import { BaseApiClient } from "./base.api-client.js";

export class HealthApiClient extends BaseApiClient {
	/**
	 * Creates a client for the application's health endpoint.
	 *
	 * @param request - Playwright request context configured with the test base URL.
	 */
	public constructor(request: APIRequestContext) {
		super(request);
	}

	/**
	 * Gets the application health response.
	 *
	 * @returns The HTTP response from the health endpoint.
	 */
	public async getHealth(): Promise<APIResponse> {
		return this.request.get("/health");
	}
}
