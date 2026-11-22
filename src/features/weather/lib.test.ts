import { describe, expect, test } from "bun:test"
import { describeWeather, pickCurrent } from "./lib"

describe("describeWeather", () => {
	test("maps WMO codes to labels", () => {
		const label = (code: number) => describeWeather(code, true).label
		expect(label(0)).toBe("Clear")
		expect(label(2)).toBe("Partly cloudy")
		expect(label(3)).toBe("Cloudy")
		expect(label(48)).toBe("Fog")
		expect(label(53)).toBe("Drizzle")
		expect(label(63)).toBe("Rain")
		expect(label(81)).toBe("Rain")
		expect(label(75)).toBe("Snow")
		expect(label(86)).toBe("Snow")
		expect(label(95)).toBe("Storm")
	})

	test("clear sky picks a night icon after dark", () => {
		expect(describeWeather(0, true).icon).not.toBe(
			describeWeather(0, false).icon,
		)
	})
})

describe("pickCurrent", () => {
	const hours = [{ t: 1000 }, { t: 4600 }, { t: 8200 }]

	test("picks the hour that has started", () => {
		expect(pickCurrent(hours, 5000 * 1000)?.t).toBe(4600)
		expect(pickCurrent(hours, 4600 * 1000)?.t).toBe(4600)
	})

	test("null before the first entry", () => {
		expect(pickCurrent(hours, 999 * 1000)).toBeNull()
	})
})
