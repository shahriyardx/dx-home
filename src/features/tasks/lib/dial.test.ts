import { describe, expect, test } from "bun:test"
import {
	DIAL_SIZE,
	hourAt,
	hourHand,
	INNER_R,
	minuteAt,
	OUTER_R,
	onRing,
	polar,
} from "./dial"

const c = DIAL_SIZE / 2
const outer = OUTER_R
const inner = INNER_R

describe("polar", () => {
	test("top is 0°, right is 90°, clockwise", () => {
		expect(polar(c, c - 50).deg).toBeCloseTo(0)
		expect(polar(c + 50, c).deg).toBeCloseTo(90)
		expect(polar(c, c + 50).deg).toBeCloseTo(180)
		expect(polar(c - 50, c).deg).toBeCloseTo(270)
	})

	test("round-trips with onRing", () => {
		const p = onRing(120, 80)
		const back = polar(p.x, p.y)
		expect(back.deg).toBeCloseTo(120)
		expect(back.dist).toBeCloseTo(80)
	})
})

describe("12-hour", () => {
	const am = { use24h: false, pm: false }
	const pm = { use24h: false, pm: true }

	test("top is 12, AM/PM picks the half", () => {
		expect(hourAt(0, outer, am)).toBe(0) // 12 AM
		expect(hourAt(0, outer, pm)).toBe(12) // 12 PM
		expect(hourAt(90, outer, am)).toBe(3)
		expect(hourAt(270, outer, pm)).toBe(21)
	})

	test("snaps to the nearest hour", () => {
		expect(hourAt(100, outer, am)).toBe(3)
		expect(hourAt(350, outer, am)).toBe(0)
	})
})

describe("24-hour", () => {
	const opts = { use24h: true, pm: false }

	test("outer ring is 12, 1–11", () => {
		expect(hourAt(0, outer, opts)).toBe(12)
		expect(hourAt(90, outer, opts)).toBe(3)
	})

	test("inner ring is 00, 13–23", () => {
		expect(hourAt(0, inner, opts)).toBe(0)
		expect(hourAt(90, inner, opts)).toBe(15)
		expect(hourAt(330, inner, opts)).toBe(23)
	})

	test("hand goes to the right ring", () => {
		expect(hourHand(15, true)).toEqual({ deg: 90, r: INNER_R })
		expect(hourHand(0, true)).toEqual({ deg: 0, r: INNER_R })
		expect(hourHand(12, true)).toEqual({ deg: 0, r: OUTER_R })
		expect(hourHand(15, false)).toEqual({ deg: 90, r: OUTER_R })
	})
})

test("minutes snap to the nearest one, 60 wraps to 0", () => {
	expect(minuteAt(0)).toBe(0)
	expect(minuteAt(90)).toBe(15)
	expect(minuteAt(359)).toBe(0)
	expect(minuteAt(183)).toBe(31)
})
