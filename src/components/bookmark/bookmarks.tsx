import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookmarkDialog } from "@/components/bookmark/bookmark-dialog"
import SingleBookmark from "./single-bookmark"
import { useBookmarks } from "@/hooks/useBookmarks"

const Bookmarks = () => {
	const { bookmarks } = useBookmarks()

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
