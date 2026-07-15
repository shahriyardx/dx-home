import { describe, expect, test } from "bun:test"
import { resolveAction } from "./actions"

const open = (input: string) => {
	const action = resolveAction(input)
	return action?.kind === "open" ? action.url : null
}

describe("resolveAction", () => {
	test("empty input resolves to nothing", () => {
		expect(resolveAction("")).toBeNull()
		expect(resolveAction("   ")).toBeNull()
	})

	describe("bangs", () => {
		test("dispatches to the engine with the query", () => {
			expect(open("!gh react")).toBe("https://github.com/search?q=react")
			expect(open("!npm zod")).toBe("https://www.npmjs.com/search?q=zod")
		})

		test("a bare bang opens the site itself", () => {
			expect(open("!gh")).toBe("https://github.com")
		})

		test("query is encoded", () => {
			expect(open("!gh a b&c")).toBe("https://github.com/search?q=a%20b%26c")
		})

		test("bare ! lists the shortcuts", () => {
			const action = resolveAction("!")
			expect(action?.kind).toBe("bang-list")
			if (action?.kind === "bang-list")
				expect(action.matches.length).toBeGreaterThan(0)
		})

		test("an unknown bang lists rather than searching for it", () => {
			expect(resolveAction("!zz")?.kind).toBe("bang-list")
		})

		test("an exact key wins over listing: !g opens Google", () => {
			// "g" is itself a bang, so it dispatches rather than filtering to [g, gh].
			expect(open("!g")).toBe("https://www.google.com")
		})

		test("a prefix that is not a key filters the list", () => {
			const action = resolveAction("!n")
			expect(action?.kind).toBe("bang-list")
			if (action?.kind === "bang-list") {
				expect(action.matches.map((b) => b.key)).toEqual(["npm"])
			}
		})

		test("bangs cannot shadow a real search", () => {
			// The reason bangs are !-prefixed: these are searches, not shortcuts.
			expect(resolveAction("so what is this")?.kind).toBe("search")
			expect(resolveAction("g force")?.kind).toBe("search")
			expect(resolveAction("w hat")?.kind).toBe("search")
			expect(resolveAction("r/programming")?.kind).toBe("search")
		})
	})

	describe("local addresses", () => {
		test(":port opens the dev server", () => {
			expect(open(":3000")).toBe("http://localhost:3000")
			expect(open(":8080/api")).toBe("http://localhost:8080/api")
		})

		test("localhost and IPv4 resolve over http", () => {
			// Neither contains a dot+TLD, so the old code sent both to a web search.
			expect(open("localhost:5173")).toBe("http://localhost:5173")
			expect(open("localhost")).toBe("http://localhost")
			expect(open("192.168.1.5")).toBe("http://192.168.1.5")
			expect(open("127.0.0.1:8000")).toBe("http://127.0.0.1:8000")
		})
	})

	describe("urls", () => {
		test("bare hostname gets https", () => {
			expect(open("example.com")).toBe("https://example.com")
			expect(open("sub.domain.co.uk/path")).toBe(
				"https://sub.domain.co.uk/path",
			)
		})

		test("an explicit scheme is preserved", () => {
			expect(open("http://a.tld")).toBe("http://a.tld")
			expect(open("https://a.tld/p?q=1")).toBe("https://a.tld/p?q=1")
		})

		test("a host beginning with http is not treated as scheme-prefixed", () => {
			// The original bug: startsWith("http") matched a substring, so these
			// opened chrome-extension://<id>/httpbin.org.
			expect(open("httpbin.org")).toBe("https://httpbin.org")
			expect(open("https.dev")).toBe("https://https.dev")
		})

		test("requires a real TLD, so arithmetic is not a hostname", () => {
			expect(resolveAction("1.5+2")?.kind).toBe("calc")
			expect(resolveAction("5")?.kind).toBe("search")
		})
	})

	describe("calc", () => {
		test("arithmetic resolves to a copyable result", () => {
			const action = resolveAction("2+3*4")
			expect(action?.kind).toBe("calc")
			if (action?.kind === "calc") expect(action.result).toBe("14")
		})
	})

	describe("search fallback", () => {
		test("plain text searches", () => {
			const action = resolveAction("how to center a div")
			expect(action?.kind).toBe("search")
			if (action?.kind === "search")
				expect(action.text).toBe("how to center a div")
		})

		test("dangerous schemes are never opened", () => {
			// They fall through to search, where chrome.search.query treats them as
			// a query string rather than a navigation.
			expect(resolveAction("javascript:alert(1)")?.kind).toBe("search")
			expect(
				resolveAction("data:text/html,<script>alert(1)</script>")?.kind,
			).toBe("search")
			expect(resolveAction("file:///etc/passwd")?.kind).toBe("search")
		})
	})

	test("every action carries a hint describing what Enter does", () => {
		for (const input of ["2+2", "example.com", "!gh react", ":3000", "hello"]) {
			expect(resolveAction(input)?.hint).toBeTruthy()
		}
	})
})
