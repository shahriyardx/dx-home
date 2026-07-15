import { expect, test } from "bun:test"
import { indexedDB, IDBKeyRange } from "fake-indexeddb"
// Type-only: erased at runtime, so it does not load Dexie before the shim.
import type { Table } from "dexie"

// Dexie captures the IndexedDB reference on import, so the shim has to be in
// place before it loads — hence the dynamic imports below.
;(globalThis as { indexedDB?: unknown }).indexedDB = indexedDB
;(globalThis as { IDBKeyRange?: unknown }).IDBKeyRange = IDBKeyRange

/**
 * The v4 -> v5 migration drops the `tasks` table, which was never read from.
 * Everything else in that database is real user data with no backup anywhere:
 * bookmarks, reading list and closed tabs live only in this profile's
 * IndexedDB. So the migration is exercised against a populated v4 database
 * rather than trusted to typecheck.
 */
test("v4 -> v5 drops tasks and preserves user data", async () => {
	const Dexie = (await import("dexie")).default

	// Build the database exactly as it exists on an installed machine today.
	// Loosely typed on purpose: this is the *old* schema, which the current
	// types no longer describe.
	const v4 = new Dexie("dx-database") as InstanceType<typeof Dexie> &
		Record<string, Table<Record<string, unknown>, number>>
	v4.version(1).stores({ bookmarks: "++id, label, url" })
	v4.version(2).stores({
		bookmarks: "++id, label, url",
		tasks: "++id, title, done, deadline, createdAt",
	})
	v4.version(3).stores({
		bookmarks: "++id, label, url",
		tasks: "++id, title, done, deadline, createdAt",
		recenttabs: "++id, title, url, icon",
	})
	v4.version(4).stores({
		bookmarks: "++id, label, url",
		tasks: "++id, title, done, deadline, createdAt",
		recenttabs: "++id, title, url, icon",
		readinglist: "++id, url, read, savedAt",
	})
	await v4.open()
	await v4.bookmarks.bulkAdd([
		{ label: "GitHub", url: "https://github.com" },
		{ label: "Local", url: "http://localhost:3000" },
	])
	await v4.readinglist.add({
		title: "Post",
		url: "https://a.tld/p",
		icon: "",
		read: false,
		savedAt: new Date(),
	})
	await v4.recenttabs.add({ title: "Tab", url: "https://b.tld", icon: "" })
	await v4.tasks.add({
		title: "Delete this task",
		done: false,
		createdAt: new Date(),
	})
	v4.close()

	// Reopen under the current schema: this is the upgrade a user experiences.
	const { db } = await import("./db")
	await db.open()

	expect(await db.bookmarks.count()).toBe(2)
	expect(await db.readinglist.count()).toBe(1)
	expect(await db.recenttabs.count()).toBe(1)
	expect((await db.bookmarks.orderBy("id").first())?.label).toBe("GitHub")

	expect(db.tables.map((t) => t.name).sort()).toEqual([
		"bookmarks",
		"readinglist",
		"recenttabs",
	])
	expect(db.verno).toBe(5)

	db.close()
})
