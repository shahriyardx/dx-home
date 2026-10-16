import { zodResolver } from "@hookform/resolvers/zod"
import { type ReactElement, useState } from "react"
import { useForm } from "react-hook-form"
import { bookmarkSchema, type BookmarkType } from "@/features/bookmarks/schema"
import { useBookmarks } from "@/features/bookmarks/use-bookmarks"
import { Button } from "@/shared/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogTrigger,
} from "@/shared/ui/dialog"
import BookmarkForm from "./bookmark-form"

const EMPTY = { label: "", url: "https://" }

/** `children` becomes the trigger, so it must be a single element. */
export function BookmarkDialog({ children }: { children: ReactElement }) {
	const [open, setOpen] = useState(false)
	const { addBookmark } = useBookmarks()

	const form = useForm<BookmarkType>({
		resolver: zodResolver(bookmarkSchema),
		defaultValues: EMPTY,
	})

	const handleSubmit = async (values: BookmarkType) => {
		await addBookmark(values)
		form.reset(EMPTY)
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={children} />
			<DialogContent title="Add bookmark">
				<BookmarkForm form={form} handleSubmit={handleSubmit} />
				<DialogFooter>
					<DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
					<Button variant="primary" onClick={form.handleSubmit(handleSubmit)}>
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
