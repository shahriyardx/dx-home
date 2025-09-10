import React from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, db } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"
import { PenIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { BookmarkDialog } from "@/components/bookmark/bookmark-dialog"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"

const Bookmarks = () => {
	const bookmarks =
		useLiveQuery(() => db.bookmarks.toArray()) || ([] as Bookmark[])

	return (
		<div className="flex flex-wrap items-center gap-4">
			{bookmarks.map((bookmark) => (
				<SingleBookmark bookmark={bookmark} />
			))}
			<BookmarkDialog>
				<div className="flex flex-col gap-1 items-center">
					<Button
						size="icon"
						variant="outline"
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

const SingleBookmark = ({ bookmark }: { bookmark: Bookmark }) => {
	const getDomain = (url: string) => {
		return new URL(url).hostname
	}

	return (
		<ContextMenu>
			<ContextMenuTrigger>
				<div className="flex flex-col gap-1 items-center">
					<Button size="icon" className="rounded-full w-10 h-10" asChild>
						<a href={bookmark.url}>
							<img
								src={`https://icons.duckduckgo.com/ip3/${getDomain(bookmark.url)}.ico`}
								alt=""
							/>
						</a>
					</Button>

					<p>{bookmark.label}</p>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem>
					<PenIcon /> Edit
				</ContextMenuItem>
				<ContextMenuItem onClick={() => db.bookmarks.delete(bookmark.id)}>
					<Trash2Icon /> Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}
