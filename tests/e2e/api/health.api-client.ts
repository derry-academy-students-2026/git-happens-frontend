import type { APIResponse } from "@playwright/test";
import { BaseApiClient } from "./base.api-client.js";

export class HealthApiClient extends BaseApiClient {
	/**
	 * Gets the application health response.
	 *
	 * @returns The HTTP response from the health endpoint.
	 */
	public async getHealth(): Promise<APIResponse> {
		return this.request.get("/health");
	}
}
