import { describe, expect, test } from "bun:test"
import { calculate } from "./calc"

describe("calculate", () => {
	test("basic arithmetic", () => {
		expect(calculate("2+2")).toBe("4")
		expect(calculate("10-4")).toBe("6")
		expect(calculate("6*7")).toBe("42")
		expect(calculate("9/3")).toBe("3")
		expect(calculate("10%3")).toBe("1")
	})

	test("precedence and grouping", () => {
		expect(calculate("2+3*4")).toBe("14")
		expect(calculate("(2+3)*4")).toBe("20")
		expect(calculate("2*3+4*5")).toBe("26")
	})

	test("^ is right associative and binds tighter than unary minus", () => {
		expect(calculate("2^3^2")).toBe("512") // not 64
		expect(calculate("-2^2")).toBe("-4") // not 4
		expect(calculate("2^-1")).toBe("0.5")
	})

	test("trims binary float noise", () => {
		expect(calculate("0.1+0.2")).toBe("0.3")
		expect(calculate(".5+.5")).toBe("1")
	})

	test("functions and constants", () => {
		expect(calculate("sqrt(16)")).toBe("4")
		expect(calculate("max(1,5,3)")).toBe("5")
		expect(calculate("round(2.6)")).toBe("3")
		expect(calculate("pi*2")).toBe("6.2831853072")
	})

	test("returns null for input that is not arithmetic", () => {
		expect(calculate("hello world")).toBeNull()
		expect(calculate("")).toBeNull()
		expect(calculate("example.com")).toBeNull()
	})

	test("a bare number is a search, not a calculation", () => {
		expect(calculate("5")).toBeNull()
		expect(calculate("42")).toBeNull()
	})

	test("ISO dates are not subtraction", () => {
		// Would otherwise evaluate to 2008.
		expect(calculate("2024-01-15")).toBeNull()
	})

	test("rejects malformed expressions rather than guessing", () => {
		expect(calculate("2+")).toBeNull()
		expect(calculate("(2+3")).toBeNull()
		expect(calculate("2 3")).toBeNull()
		expect(calculate("*5")).toBeNull()
	})

	test("non-finite results are not shown", () => {
		expect(calculate("1/0")).toBeNull()
		expect(calculate("0/0")).toBeNull()
	})

	test("does not execute code", () => {
		expect(calculate("alert(1)")).toBeNull()
		expect(calculate("[].map(x=>x)")).toBeNull()
		expect(calculate("globalThis")).toBeNull()
	})

	test("name lookup does not reach Object.prototype", () => {
		// `in` / plain indexing would resolve these off the prototype chain —
		// "constructor" would hand back the Object constructor itself.
		expect(calculate("constructor(1)")).toBeNull()
		expect(calculate("constructor+1")).toBeNull()
		expect(calculate("__proto__")).toBeNull()
		expect(calculate("toString(1)")).toBeNull()
		expect(calculate("valueOf(1)")).toBeNull()
	})
})
