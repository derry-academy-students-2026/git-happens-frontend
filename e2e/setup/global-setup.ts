import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FullConfig } from "@playwright/test";

const runMarker = path.join("test-results", ".framework-run.json");

// Create a run marker once; per-test reset is handled by the Playwright fixtures.
export default async function globalSetup(config: FullConfig): Promise<void> {
	await mkdir(path.dirname(runMarker), { recursive: true });
	await writeFile(
		runMarker,
		JSON.stringify({ startedAt: new Date().toISOString(), projects: config.projects.map((project) => project.name) }),
	);
}