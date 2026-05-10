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
				<div className="flex flex-col gap-1.5 items-center group cursor-pointer">
					<Button
						size="icon"
						variant="ghost"
						className="w-12 h-12 border border-dashed border-border bg-transparent hover:bg-secondary/50 transition-colors cursor-pointer rounded-none!"
						asChild
					>
						<span>
							<PlusIcon className="w-5 h-5 text-muted-foreground" />
						</span>
					</Button>

					<span className="text-[11px] text-muted-foreground/60 text-center leading-tight">
						Add
					</span>
				</div>
			</BookmarkDialog>
		</div>
	)
}

export default Bookmarks
