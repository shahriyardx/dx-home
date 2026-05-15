import { useLiveQuery } from "dexie-react-hooks"
import { db, type ReadingItem } from "@/lib/db"

export function useReadingList() {
	const items =
		useLiveQuery(
			() =>
				db.readinglist.orderBy("savedAt").reverse().toArray() as Promise<
					ReadingItem[]
				>,
		) ?? []

	const addItem = async (title: string, url: string, icon: string) => {
		await db.readinglist.add({
			title,
			url,
			icon,
			read: false,
			savedAt: new Date(),
		})
	}

	const toggleRead = async (id: number) => {
		const item = await db.readinglist.get(id)
		if (item) {
			await db.readinglist.update(id, { read: !item.read })
		}
	}

	const deleteItem = async (id: number) => {
		await db.readinglist.delete(id)
	}

	return { items, addItem, toggleRead, deleteItem }
}
