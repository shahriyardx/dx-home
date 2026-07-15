import { useState } from "react"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"
import type { Bookmark } from "@/shared/storage/db"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/shared/ui/context-menu"
import BookmarkForm from "./bookmark-form"
import { bookmarkSchema, type BookmarkType } from "@/features/bookmarks/schema"
import { useBookmarks } from "@/features/bookmarks/use-bookmarks"

import { Favicon } from "@/shared/components/favicon"

const SingleBookmark = ({ bookmark }: { bookmark: Bookmark }) => {
	const [open, setOpen] = useState(false)
	const { deleteBookmark, updateBookmark } = useBookmarks()

	const form = useForm({
		resolver: zodResolver(bookmarkSchema),
		defaultValues: bookmark,
	})

	const handleSubmit = async (values: BookmarkType) => {
		await updateBookmark(bookmark.id, values)
		form.reset({ label: "", url: "https://" })
		setOpen(false)
	}

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger>
					<div className="group flex flex-col items-center gap-1.5">
						<a
							href={bookmark.url}
							title={bookmark.label}
							className={cn(
								"glass grid size-12 place-items-center rounded-xl",
								"transition-[transform,background-color,border-color] duration-200",
								"hover:-translate-y-0.5 hover:border-glass-border-lit hover:bg-glass-hover",
							)}
						>
							<Favicon url={bookmark.url} size={20} className="size-5" />
						</a>
						{/* Sits on bare wallpaper, so it carries its own shadow. */}
						<span className="on-wallpaper max-w-14 truncate text-[9px] tracking-wide text-white/60 transition-colors group-hover:text-white/90">
							{bookmark.label}
						</span>
					</div>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onClick={() => setOpen(true)}>Edit</ContextMenuItem>
					<ContextMenuItem
						variant="destructive"
						onClick={() => deleteBookmark(bookmark.id)}
					>
						Delete
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<Dialog open={open} onOpenChange={(val) => setOpen(val)}>
				<DialogContent className="sm:max-w-106.25">
					<DialogHeader>
						<DialogTitle>Edit Bookmark</DialogTitle>
					</DialogHeader>

					<BookmarkForm form={form} handleSubmit={handleSubmit} />

					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DialogClose>
						<Button
							type="submit"
							className="cursor-pointer"
							onClick={async () => {
								const valid = await form.trigger()
								if (valid) {
									await handleSubmit(form.getValues())
								}
							}}
						>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default SingleBookmark
