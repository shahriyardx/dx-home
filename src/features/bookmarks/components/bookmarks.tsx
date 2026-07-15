import { PlusIcon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"
import { BookmarkDialog } from "@/features/bookmarks/components/bookmark-dialog"
import SingleBookmark from "./single-bookmark"
import { useBookmarks } from "@/features/bookmarks/use-bookmarks"

const Bookmarks = () => {
	const { bookmarks } = useBookmarks()

	return (
		<div className="flex flex-wrap items-start gap-3">
			{bookmarks.map((bookmark) => (
				<SingleBookmark key={bookmark.id} bookmark={bookmark} />
			))}
			<BookmarkDialog>
				<div className="group flex cursor-pointer flex-col items-center gap-1.5">
					<Button
						size="icon"
						variant="ghost"
						className={cn(
							"size-12 cursor-pointer rounded-xl border border-dashed border-white/15 bg-transparent",
							"transition-[transform,background-color,border-color] duration-200",
							"hover:-translate-y-0.5 hover:border-white/30 hover:bg-glass-hover",
						)}
						asChild
					>
						<span>
							<PlusIcon className="size-4 text-white/40 transition-colors group-hover:text-white/70" />
						</span>
					</Button>
					{/* Placeholder keeps this tile's baseline aligned with the labelled ones. */}
					<span className="text-[9px] text-transparent select-none">add</span>
				</div>
			</BookmarkDialog>
		</div>
	)
}

export default Bookmarks
