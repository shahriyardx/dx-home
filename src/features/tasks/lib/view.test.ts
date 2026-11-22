import { describe, expect, test } from "bun:test"
import type { Task } from "@/features/tasks/tasks-context"
import { deadlineBadge, groupTasks, monthGrid, startOfWeek } from "./view"

// Sunday, Nov 22 2026, 1:48 PM local.
const now = new Date(2026, 10, 22, 13, 48)
const at = (d: number, h: number, m = 0) => new Date(2026, 10, d, h, m)

const task = (id: string, deadline?: Date, done = false): Task => ({
	id,
	title: id,
	done,
	deadline,
	createdAt: now,
})

describe("groupTasks", () => {
	test("sorts into overdue, today, later and done", () => {
		const g = groupTasks(
			[
				task("past", at(22, 11)),
				task("tonight", at(22, 18, 30)),
				task("tue", at(24, 9)),
				task("undated"),
				task("finished", at(22, 11), true),
			],
			now,
		)
		expect(g.overdue.map((t) => t.id)).toEqual(["past"])
		expect(g.today.map((t) => t.id)).toEqual(["tonight"])
		expect(g.later.map((t) => t.id)).toEqual(["tue", "undated"])
		expect(g.done.map((t) => t.id)).toEqual(["finished"])
	})
})

describe("deadlineBadge", () => {
	const text = (d: Date) => deadlineBadge(d, now)?.text

	test("past deadlines read as time ago", () => {
		expect(deadlineBadge(at(22, 13, 30), now)).toEqual({
			text: "18m ago",
			tone: "overdue",
		})
		expect(text(at(22, 11))).toBe("2h ago")
		expect(text(at(19, 9))).toBe("3d ago")
	})

	test("within the hour counts down", () => {
		expect(deadlineBadge(at(22, 14, 30), now)).toEqual({
			text: "in 42m",
			tone: "soon",
		})
	})

	test("later today, this week, further out", () => {
		expect(text(at(22, 18, 30))).toBe("6:30 PM")
		expect(text(at(24, 9))).toBe("Tue")
		expect(text(new Date(2026, 11, 2, 9))).toBe("Dec 2")
	})

	test("no deadline, no badge", () => {
		expect(deadlineBadge(undefined, now)).toBeNull()
	})
})

describe("calendar grid", () => {
	test("weeks start on Sunday", () => {
		expect(startOfWeek(now)).toEqual(new Date(2026, 10, 22))
		expect(startOfWeek(new Date(2026, 10, 25, 9))).toEqual(
			new Date(2026, 10, 22),
		)
	})

	test("month grid is 42 days from the Sunday on or before the 1st", () => {
		const days = monthGrid(now)
		expect(days).toHaveLength(42)
		expect(days[0]).toEqual(new Date(2026, 10, 1))
		// December 2026 starts on a Tuesday.
		expect(monthGrid(new Date(2026, 11, 1))[0]).toEqual(new Date(2026, 10, 29))
	})
})
