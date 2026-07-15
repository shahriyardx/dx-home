import { useState } from "react"
import { Button } from "@/shared/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import type { DialogProps } from "@radix-ui/react-dialog"
import { useForm } from "react-hook-form"
import BookmarkForm from "./bookmark-form"
import { bookmarkSchema, type BookmarkType } from "@/features/bookmarks/schema"
import { useBookmarks } from "@/features/bookmarks/use-bookmarks"

export function BookmarkDialog({ children }: DialogProps) {
	const [open, setOpen] = useState(false)

	const form = useForm<BookmarkType>({
		resolver: zodResolver(bookmarkSchema),
		defaultValues: {
			label: "",
			url: "https://",
		},
	})

	const { addBookmark } = useBookmarks()

	const handleSubmit = async (values: BookmarkType) => {
		await addBookmark(values)
		form.reset({ label: "", url: "https://" })
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-106">
				<DialogHeader>
					<DialogTitle>Add Bookmark</DialogTitle>
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
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
