// db.ts
import Dexie, { type EntityTable } from "dexie"

interface Bookmark {
	id: number
	label: string
	url: string
}

export interface ClosedTab {
	id: number
	title: string
	url: string
	icon: string
}

export interface ReadingItem {
	id: number
	title: string
	url: string
	icon: string
	read: boolean
	savedAt: Date
}

const db = new Dexie("dx-database") as Dexie & {
	bookmarks: EntityTable<Bookmark, "id">
	recenttabs: EntityTable<ClosedTab, "id">
	readinglist: EntityTable<ReadingItem, "id">
}

db.version(1).stores({
	bookmarks: "++id, label, url",
})

db.version(2).stores({
	bookmarks: "++id, label, url",
	tasks: "++id, title, done, deadline, createdAt",
})

db.version(3).stores({
	bookmarks: "++id, label, url",
	tasks: "++id, title, done, deadline, createdAt",
	recenttabs: "++id, title, url, icon",
})

db.version(4).stores({
	bookmarks: "++id, label, url",
	tasks: "++id, title, done, deadline, createdAt",
	recenttabs: "++id, title, url, icon",
	readinglist: "++id, url, read, savedAt",
})

// Tasks live in chrome.storage.sync (see contexts/tasks-context.tsx); this table
// was never read from. Versions 2-4 keep their `tasks` declaration so existing
// installs still migrate through them before it is dropped here.
db.version(5).stores({
	tasks: null,
})

db.on("populate", () => {
	chrome.topSites.get((sites) => {
		const bookmarks = sites.map((site) => ({
			label: site.title,
			url: site.url,
		}))

		db.bookmarks.bulkAdd(bookmarks)
	})
})

export type { Bookmark }
export { db }
