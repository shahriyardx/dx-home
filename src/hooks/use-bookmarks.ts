import type { BookmarkType } from "@/components/bookmark"
import { type Bookmark, db } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"

export const useBookmarks = () => {
	const bookmarks =
		useLiveQuery(() => db.bookmarks.orderBy("id").toArray()) ||
		([] as Bookmark[])

	const addBookmark = async (values: BookmarkType) => {
		await db.bookmarks.add(values)
	}

	const updateBookmark = async (id: number, values: BookmarkType) => {
		await db.bookmarks.update(id, values)
	}

	const deleteBookmark = async (id: number) => {
		await db.bookmarks.delete(id)
	}

	return {
		bookmarks,
		addBookmark,
		updateBookmark,
		deleteBookmark,
	}
}
