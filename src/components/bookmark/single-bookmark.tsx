import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Bookmark } from "@/lib/db"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"
import BookmarkForm from "./bookmark-form"
import { bookmarkSchema, type BookmarkType } from "."
import { useBookmarks } from "@/hooks/useBookmarks"
import { urlToFavicon } from "@/lib/utils"

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
					<div className="flex flex-col gap-1.5 items-center group">
						<a
							href={bookmark.url}
							className="w-12 h-12 border rounded-md bg-secondary/50 grid place-items-center"
						>
							<img
								src={urlToFavicon(bookmark.url)}
								alt=""
								className="w-5 h-5"
							/>
						</a>
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
