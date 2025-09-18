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

interface Task {
	id: number
	title: string
	done: boolean
	deadline: Date
	createdAt: Date
}

interface RecentlyClosedTabs {
	id: number
	title: string
	url: string
	icon: string
}

const db = new Dexie("dx-database") as Dexie & {
	bookmarks: EntityTable<Bookmark, "id">
	settings: EntityTable<Settings, "key">
	tasks: EntityTable<Task, "id">
	recenttabs: EntityTable<RecentlyClosedTabs, "id">
}

db.version(1).stores({
	bookmarks: "++id, label, url",
	settings: "key",
})

db.version(2).stores({
	bookmarks: "++id, label, url",
	settings: "key",
	tasks: "++id, title, done, deadline, createdAt",
})

db.version(3).stores({
	bookmarks: "++id, label, url",
	settings: "key",
	tasks: "++id, title, done, deadline, createdAt",
	recenttabs: "++id, title, url, icon",
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

	db.tasks.add({
		title: "Delete this task",
		done: false,
		deadline: (() => {
			const current = new Date()
			current.setHours(current.getHours() + 1)
			return current
		})(),
		createdAt: new Date(),
	})
})

export type { Bookmark, Task }
export { db }
