import { describe, expect, test } from "bun:test"
import { probePort, discoverDevServers } from "./probe"
import { DEV_PORTS, EXCLUDED_PORTS, labelFor } from "./ports"

/** Stands in for a server that speaks HTTP. */
const httpServer = (
	body = "<html><head><title>My App</title></head></html>",
	headers: Record<string, string> = { "content-type": "text/html" },
) =>
	(async () =>
		new Response(body, { status: 200, headers })) as unknown as typeof fetch

/** Stands in for Postgres/Mongo/Redis: TCP is open, but it is not HTTP, so
 *  fetch rejects rather than returning a response. */
const notHttp = (async () => {
	throw new TypeError("Failed to fetch")
}) as unknown as typeof fetch

/** Nothing is listening at all. */
const closed = (async () => {
	throw new TypeError("Failed to fetch")
}) as unknown as typeof fetch

describe("probePort", () => {
	test("finds an HTTP server and reads its title", async () => {
		const server = await probePort(3000, { fetchImpl: httpServer() })
		expect(server).toEqual({
			port: 3000,
			url: "http://localhost:3000",
			label: "My App",
		})
	})

	test("a database is never reported", async () => {
		// The whole HTTP-vs-database question: Postgres does not speak HTTP, so
		// the fetch rejects and the port cannot appear. No port list needed.
		expect(await probePort(5432, { fetchImpl: notHttp })).toBeNull()
		expect(await probePort(27017, { fetchImpl: notHttp })).toBeNull()
		expect(await probePort(6379, { fetchImpl: notHttp })).toBeNull()
	})

	test("a closed port is not reported", async () => {
		expect(await probePort(3000, { fetchImpl: closed })).toBeNull()
	})

	test("an error status still counts — a broken dev server is still running", async () => {
		const failing = (async () =>
			new Response("boom", {
				status: 500,
				headers: { "content-type": "text/html" },
			})) as unknown as typeof fetch
		const server = await probePort(5173, { fetchImpl: failing })
		expect(server?.url).toBe("http://localhost:5173")
	})

	test("falls back to the port when there is no title", async () => {
		const json = (async () =>
			new Response("{}", {
				status: 200,
				headers: { "content-type": "application/json" },
			})) as unknown as typeof fetch
		expect((await probePort(8000, { fetchImpl: json }))?.label).toBe(
			"localhost:8000",
		)
	})

	test("does not send credentials", async () => {
		let seen: RequestInit | undefined
		const spy = (async (_url: string, init: RequestInit) => {
			seen = init
			return new Response("", { status: 200 })
		}) as unknown as typeof fetch
		await probePort(3000, { fetchImpl: spy })
		expect(seen?.credentials).toBe("omit")
	})

	test("times out rather than hanging on a port that never answers", async () => {
		// Postgres accepts the connection and then says nothing; without a
		// deadline the sweep would never finish.
		const hangs = ((_url: string, init: RequestInit) =>
			new Promise((_resolve, reject) => {
				init.signal?.addEventListener("abort", () =>
					reject(new DOMException("aborted", "AbortError")),
				)
			})) as unknown as typeof fetch
		const started = performance.now()
		expect(
			await probePort(5432, { fetchImpl: hangs, timeoutMs: 50 }),
		).toBeNull()
		expect(performance.now() - started).toBeLessThan(2000)
	})
})

describe("discoverDevServers", () => {
	test("returns only the ports that answered", async () => {
		const only3000 = (async (url: string) => {
			if (url !== "http://localhost:3000") throw new TypeError("refused")
			return new Response("<title>App</title>", {
				status: 200,
				headers: { "content-type": "text/html" },
			})
		}) as unknown as typeof fetch

		const found = await discoverDevServers({ fetchImpl: only3000 })
		expect(found).toHaveLength(1)
		expect(found[0].port).toBe(3000)
	})

	test("no servers means an empty list, not an error", async () => {
		expect(await discoverDevServers({ fetchImpl: closed })).toEqual([])
	})
})

describe("port lists", () => {
	test("no database port is ever probed", async () => {
		for (const port of EXCLUDED_PORTS) {
			expect(DEV_PORTS).not.toContain(port as never)
		}
	})

	test("excludes HTTP-speaking datastores too", () => {
		// These would pass the probe — answering HTTP is not the same as being a
		// dev server — so they are kept out of the list by hand.
		expect(EXCLUDED_PORTS).toContain(9200) // Elasticsearch
		expect(EXCLUDED_PORTS).toContain(5984) // CouchDB
	})

	test("has no duplicates", () => {
		expect(new Set(DEV_PORTS).size).toBe(DEV_PORTS.length)
	})
})

describe("labelFor", () => {
	test("prefers the page title", () => {
		expect(labelFor(3000, "My Portfolio")).toBe("My Portfolio")
	})

	test("names known tools when the title is missing", () => {
		expect(labelFor(6006)).toBe("Storybook")
		expect(labelFor(11434)).toBe("Ollama")
	})

	test("falls back to the address", () => {
		expect(labelFor(1234)).toBe("localhost:1234")
	})
})
