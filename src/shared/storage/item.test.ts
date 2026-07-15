import { beforeEach, describe, expect, test } from "bun:test"
import { installChromeStorageMock } from "./chrome-mock"
import { defineStorageItem } from "./item"

const mock = installChromeStorageMock()

beforeEach(() => {
	mock.reset()
})

describe("defineStorageItem", () => {
	test("round-trips a value", async () => {
		const item = defineStorageItem<string>("local", "k", "fallback")
		expect(await item.get()).toBe("fallback")
		await item.set("stored")
		expect(await item.get()).toBe("stored")
	})

	test("falls back when unset or removed", async () => {
		const item = defineStorageItem<number>("local", "k", 7)
		expect(await item.get()).toBe(7)
		await item.set(1)
		await item.remove()
		expect(await item.get()).toBe(7)
	})

	test("areas are isolated", async () => {
		// Same key, different areas: a sync write must not leak into local.
		const local = defineStorageItem<string>("local", "same-key", "L")
		const sync = defineStorageItem<string>("sync", "same-key", "S")
		await local.set("local-value")
		expect(await sync.get()).toBe("S")
	})

	test("serialize/deserialize survive the JSON round trip", async () => {
		const item = defineStorageItem<{ at: Date }, { at: string }>(
			"local",
			"dated",
			{ at: new Date(0) },
			{
				serialize: (v) => ({ at: v.at.toISOString() }),
				deserialize: (r) => ({ at: new Date(r.at) }),
			},
		)
		const when = new Date("2026-07-15T10:00:00.000Z")
		await item.set({ at: when })
		const read = await item.get()
		expect(read.at).toBeInstanceOf(Date)
		expect(read.at.getTime()).toBe(when.getTime())
	})

	test("corrupt data yields the fallback instead of throwing", async () => {
		// A deserializer that throws must not take the page down.
		const item = defineStorageItem<string, string>("local", "bad", "safe", {
			deserialize: () => {
				throw new Error("corrupt")
			},
		})
		await item.set("anything")
		expect(await item.get()).toBe("safe")
	})

	describe("watch", () => {
		test("fires on change with the deserialized value", async () => {
			const item = defineStorageItem<number>("local", "n", 0)
			const seen: number[] = []
			const stop = item.watch((v) => seen.push(v))
			await item.set(1)
			await item.set(2)
			stop()
			expect(seen).toEqual([1, 2])
		})

		test("does not fire for a different key", async () => {
			const item = defineStorageItem<number>("local", "mine", 0)
			const other = defineStorageItem<number>("local", "theirs", 0)
			const seen: number[] = []
			const stop = item.watch((v) => seen.push(v))
			await other.set(99)
			stop()
			expect(seen).toEqual([])
		})

		test("does not fire for the same key in a different area", async () => {
			const local = defineStorageItem<string>("local", "shared", "L")
			const sync = defineStorageItem<string>("sync", "shared", "S")
			const seen: string[] = []
			const stop = local.watch((v) => seen.push(v))
			await sync.set("from-sync")
			stop()
			expect(seen).toEqual([])
		})

		test("unsubscribes", async () => {
			const item = defineStorageItem<number>("local", "n", 0)
			const stop = item.watch(() => {})
			expect(mock.listenerCount()).toBe(1)
			stop()
			expect(mock.listenerCount()).toBe(0)
		})

		test("a removal delivers the fallback", async () => {
			const item = defineStorageItem<string>("local", "k", "gone")
			await item.set("here")
			const seen: string[] = []
			const stop = item.watch((v) => seen.push(v))
			await item.remove()
			stop()
			expect(seen).toEqual(["gone"])
		})
	})
})
