import { describe, expect, test } from "bun:test"
import {
	addDays,
	defaultTime,
	toTimeValue,
	withDate,
	withTime,
} from "./deadline"

const now = new Date(2026, 9, 16, 14, 25)

describe("deadline", () => {
	test("default time is the next full hour, clamped before midnight", () => {
		expect(defaultTime(now)).toEqual({ h: 15, m: 0 })
		expect(defaultTime(new Date(2026, 9, 16, 23, 40))).toEqual({ h: 23, m: 59 })
	})

	test("picking a day keeps the time already chosen", () => {
		const current = new Date(2026, 9, 16, 9, 30)
		expect(withDate(new Date(2026, 9, 20), current, now)).toEqual(
			new Date(2026, 9, 20, 9, 30),
		)
	})

	test("picking a day with no deadline uses the default time", () => {
		expect(withDate(new Date(2026, 9, 20), undefined, now)).toEqual(
			new Date(2026, 9, 20, 15, 0),
		)
	})

	test("setting a time keeps the day, or uses today", () => {
		const current = new Date(2026, 9, 20, 9, 30)
		expect(withTime(current, "18:05", now)).toEqual(
			new Date(2026, 9, 20, 18, 5),
		)
		expect(withTime(undefined, "08:00", now)).toEqual(
			new Date(2026, 9, 16, 8, 0),
		)
		expect(withTime(current, "", now)).toBe(current)
	})

	test("time value round-trips in local time", () => {
		expect(toTimeValue(new Date(2026, 9, 16, 7, 5))).toBe("07:05")
	})

	test("addDays crosses month ends", () => {
		expect(addDays(new Date(2026, 9, 30), 7)).toEqual(new Date(2026, 10, 6))
	})
})
