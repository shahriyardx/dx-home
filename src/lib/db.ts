// db.ts
import Dexie, { type EntityTable } from "dexie"

interface Bookmark {
	id: number
	label: string
	url: string
}

interface Settings {
	key: "main"
	background: string,
}

const db = new Dexie("dx-database") as Dexie & {
	bookmarks: EntityTable<Bookmark, "id">
	settings: EntityTable<Settings, "key">
}

db.version(1).stores({
	bookmarks: "++id, label, url",
})

db.version(2).stores({
	bookmarks: "++id, label, url",
	settings: "key"
})
export type { Bookmark }
export { db }
