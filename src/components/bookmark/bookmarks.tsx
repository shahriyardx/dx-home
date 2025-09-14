import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Bookmark, db } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"
import { BookmarkDialog } from "@/components/bookmark/bookmark-dialog"
import SingleBookmark from "./single-bookmark"

const Bookmarks = () => {
	const bookmarks =
		useLiveQuery(() => db.bookmarks.toArray()) || ([] as Bookmark[])

	return (
		<div className="flex flex-wrap items-center gap-4">
			{bookmarks.map((bookmark) => (
				<SingleBookmark key={bookmark.id} bookmark={bookmark} />
			))}
			<BookmarkDialog>
				<div className="flex flex-col gap-1 items-center">
					<Button
						size="icon"
						className="rounded-full w-10 h-10 p-3 cursor-pointer"
						asChild
					>
						<PlusIcon className="w-5 h-5" />
					</Button>

					<p>Add</p>
				</div>
			</BookmarkDialog>
		</div>
	)
}

export default Bookmarks
