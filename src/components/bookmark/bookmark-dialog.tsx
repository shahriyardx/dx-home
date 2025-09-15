import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import type { DialogProps } from "@radix-ui/react-dialog"
import { useForm } from "react-hook-form"
import BookmarkForm from "./bookmark-form"
import { bookmarkSchema, type BookmarkType } from "."
import { useBookmarks } from "@/hooks/useBookmarks"

export function BookmarkDialog({ children }: DialogProps) {
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
	}

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
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
							await form.trigger()
							if (form.formState.isValid) {
								handleSubmit(form.getValues())
							}
						}}
					>
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
