import { expect, test } from "../fixtures/test.js";

test.describe("Health API", () => {
	test("reports that the application is available", async ({ healthApi }) => {
		const response = await healthApi.getHealth();

		expect(response.ok()).toBe(true);
	});
});
