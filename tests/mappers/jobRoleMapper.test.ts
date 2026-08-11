import { describe, expect, it } from "vitest";
import { toJobRoleListItem } from "../../src/mappers/jobRoleMapper.js";
import type { JobRoleDTO } from "../../src/models/jobRoleDTO.js";

const jobRole: JobRoleDTO = {
	jobRoleId: 1,
	roleName: "Frontend Developer",
	location: "Derry",
	capability: {
		capabilityId: 1,
		capabilityName: "Engineering",
	},
	band: {
		bandId: 2,
		bandName: "Associate",
	},
	closingDate: "2026-09-04T00:00:00.000Z",
	status: "Open",
};

describe("toJobRoleListItem", () => {
	it("maps the API fields onto the names the template uses", () => {
		expect(toJobRoleListItem(jobRole)).toEqual({
			jobRoleId: 1,
			roleName: "Frontend Developer",
			location: "Derry",
			capability: "Engineering",
			band: "Associate",
			closingDate: "2026-09-04",
			status: "Open",
		});
	});

	it("drops the time portion of the closing date", () => {
		const listItem = toJobRoleListItem({
			...jobRole,
			closingDate: "2026-08-11T08:20:53.754Z",
		});

		expect(listItem.closingDate).toBe("2026-08-11");
	});

	it("passes the API status through untouched", () => {
		expect(toJobRoleListItem(jobRole).status).toBe("Open");
		expect(toJobRoleListItem({ ...jobRole, status: "Closed" }).status).toBe(
			"Closed",
		);
	});

	it("flattens the nested capability and band objects", () => {
		const listItem = toJobRoleListItem(jobRole);

		expect(listItem.capability).toBe("Engineering");
		expect(listItem.band).toBe("Associate");
		expect(listItem).not.toHaveProperty("capabilityId");
		expect(listItem).not.toHaveProperty("bandId");
	});
});
