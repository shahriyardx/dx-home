// db.ts
import Dexie, { type EntityTable } from "dexie"

interface Bookmark {
	id: number
	label: string
	url: string
}

interface Settings {
	key: "main"
	background: string
}

const db = new Dexie("dx-database") as Dexie & {
	bookmarks: EntityTable<Bookmark, "id">
	settings: EntityTable<Settings, "key">
}

db.version(1).stores({
	bookmarks: "++id, label, url",
	settings: "key",
})

db.on("populate", () => {
	chrome.topSites.get((sites) => {
		const bookmarks = sites.map((site) => ({
			label: site.title,
			url: site.url,
		}))

		db.bookmarks.bulkAdd(bookmarks)
	})

	db.settings.put({
		key: "main",
		background: "linear-gradient(135deg, rgb(0, 0, 0), rgb(67, 67, 67))",
	})
})

export type { Bookmark }
export { db }
