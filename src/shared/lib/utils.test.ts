import { describe, expect, test } from "bun:test"
import { cn, cssUrl, isSafeImageUrl, isSafeWebUrl } from "./utils"

describe("isSafeWebUrl", () => {
	test("accepts http and https", () => {
		expect(isSafeWebUrl("https://example.com")).toBe(true)
		expect(isSafeWebUrl("http://localhost:3000")).toBe(true)
		expect(isSafeWebUrl("https://a.tld/p?q=1#h")).toBe(true)
	})

	test("rejects javascript:", () => {
		// The one that matters: opened from an extension page, a javascript: URL
		// runs with our origin and our tabs/topSites/storage permissions.
		expect(isSafeWebUrl("javascript:alert(1)")).toBe(false)
		expect(isSafeWebUrl("JaVaScRiPt:alert(1)")).toBe(false)
		expect(isSafeWebUrl("  javascript:alert(1)")).toBe(false)
		expect(isSafeWebUrl("java\nscript:alert(1)")).toBe(false)
	})

	test("rejects every other scheme", () => {
		expect(isSafeWebUrl("data:text/html,<script>alert(1)</script>")).toBe(false)
		expect(isSafeWebUrl("file:///etc/passwd")).toBe(false)
		expect(isSafeWebUrl("chrome-extension://abc/page.html")).toBe(false)
		expect(isSafeWebUrl("vbscript:msgbox")).toBe(false)
		expect(isSafeWebUrl("blob:https://a.tld/uuid")).toBe(false)
	})

	test("rejects anything unparseable", () => {
		expect(isSafeWebUrl("example.com")).toBe(false) // no scheme
		expect(isSafeWebUrl("")).toBe(false)
		expect(isSafeWebUrl("not a url")).toBe(false)
	})
})

describe("isSafeImageUrl", () => {
	test("accepts http, https, and inline images", () => {
		expect(isSafeImageUrl("https://e.tld/a.png")).toBe(true)
		expect(isSafeImageUrl("http://e.tld/a.png")).toBe(true)
		expect(isSafeImageUrl("data:image/png;base64,iVBORw0KGgo=")).toBe(true)
		expect(isSafeImageUrl("data:image/svg+xml,<svg/>")).toBe(true)
	})

	test("rejects non-image data URIs", () => {
		expect(isSafeImageUrl("data:text/html,<script>alert(1)</script>")).toBe(
			false,
		)
		expect(isSafeImageUrl("data:application/javascript,alert(1)")).toBe(false)
	})

	test("rejects script schemes", () => {
		expect(isSafeImageUrl("javascript:alert(1)")).toBe(false)
		expect(isSafeImageUrl("file:///etc/passwd")).toBe(false)
	})
})

describe("cssUrl", () => {
	test("wraps and quotes", () => {
		expect(cssUrl("/backgrounds/peaks.png")).toBe(
			'url("/backgrounds/peaks.png")',
		)
	})

	test("neutralises a url() breakout", () => {
		// Chrome leaves ) and , unescaped in a query string, so an unquoted url()
		// could be closed early and a second, attacker-chosen fetch appended.
		const attack = "https://e.tld/a.png?x=),url(https://evil.tld/b.png"
		expect(cssUrl(attack)).toBe(
			'url("https://e.tld/a.png?x=),url(https://evil.tld/b.png")',
		)
	})

	test("escapes quotes and backslashes so the string cannot be closed", () => {
		expect(cssUrl('a.png?x=")')).toBe('url("a.png?x=\\")")')
		expect(cssUrl("a.png?x=\\")).toBe('url("a.png?x=\\\\")')
	})
})

describe("cn", () => {
	test("merges conflicting tailwind classes, last wins", () => {
		expect(cn("p-2", "p-4")).toBe("p-4")
	})

	test("drops falsy values", () => {
		expect(cn("a", false && "b", undefined, "c")).toBe("a c")
	})
})
