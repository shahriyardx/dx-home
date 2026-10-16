import { PlusIcon } from "lucide-react"
import { BookmarkDialog } from "@/features/bookmarks/components/bookmark-dialog"
import { useBookmarks } from "@/features/bookmarks/use-bookmarks"
import SingleBookmark, { tileClass } from "./single-bookmark"

const Bookmarks = () => {
	const { bookmarks } = useBookmarks()

	return (
		<div className="flex flex-wrap items-start gap-4">
			{bookmarks.map((bookmark) => (
				<SingleBookmark key={bookmark.id} bookmark={bookmark} />
			))}
			<div className="flex flex-col items-center gap-2">
				<BookmarkDialog>
					<button type="button" title="Add bookmark" className={tileClass}>
						<PlusIcon className="size-5 text-muted" />
					</button>
				</BookmarkDialog>
				{/* Keeps this tile's baseline level with the labelled ones. */}
				<span aria-hidden className="text-xs text-transparent select-none">
					add
				</span>
			</div>
		</div>
	)
}

export default Bookmarks
