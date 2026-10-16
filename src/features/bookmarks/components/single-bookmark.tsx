import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { bookmarkSchema, type BookmarkType } from "@/features/bookmarks/schema"
import { useBookmarks } from "@/features/bookmarks/use-bookmarks"
import { Favicon } from "@/shared/components/favicon"
import type { Bookmark } from "@/shared/storage/db"
import { Button } from "@/shared/ui/button"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/shared/ui/context-menu"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
} from "@/shared/ui/dialog"
import BookmarkForm from "./bookmark-form"

export const tileClass =
	"pressable grid size-14 place-items-center rounded-[1.25rem] bg-surface hover:bg-surface-hover"

const SingleBookmark = ({ bookmark }: { bookmark: Bookmark }) => {
	const [open, setOpen] = useState(false)
	const { deleteBookmark, updateBookmark } = useBookmarks()

	const form = useForm({
		resolver: zodResolver(bookmarkSchema),
		defaultValues: bookmark,
	})

	const handleSubmit = async (values: BookmarkType) => {
		await updateBookmark(bookmark.id, values)
		// Keep the saved values: resetting to blank emptied the next edit.
		form.reset(values)
		setOpen(false)
	}

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger className="flex flex-col items-center gap-2">
					<a href={bookmark.url} title={bookmark.label} className={tileClass}>
						<Favicon url={bookmark.url} size={24} className="size-6" />
					</a>
					{/* Sits on bare wallpaper, so it carries its own shadow. */}
					<span className="on-wallpaper max-w-16 truncate text-xs font-medium text-white/85">
						{bookmark.label}
					</span>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onClick={() => setOpen(true)}>Edit</ContextMenuItem>
					<ContextMenuItem danger onClick={() => deleteBookmark(bookmark.id)}>
						Delete
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent title="Edit bookmark">
					<BookmarkForm form={form} handleSubmit={handleSubmit} />
					<DialogFooter>
						<DialogClose render={<Button variant="ghost" />}>
							Cancel
						</DialogClose>
						<Button variant="primary" onClick={form.handleSubmit(handleSubmit)}>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default SingleBookmark
