// db.ts
import Dexie, { type EntityTable } from "dexie"

interface Bookmark {
	id: number
	label: string
	url: string
}

const db = new Dexie("dx-database") as Dexie & {
	bookmarks: EntityTable<Bookmark, "id">
}

db.version(1).stores({
	bookmarks: "++id, label, url",
})

export type { Bookmark }
export { db }
