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
import z from "zod"
import { type Bookmark, db } from "@/lib/db"
import BookmarkForm from "./bookmark-form"

export const bookmarkSchema = z.object({
	label: z.string().min(1),
	url: z.url(),
})

export type BookmarkType = z.infer<typeof bookmarkSchema>

export function BookmarkDialog({
	children,
	initialValues,
}: DialogProps & { initialValues?: Bookmark }) {
	const form = useForm<z.infer<typeof bookmarkSchema>>({
		resolver: zodResolver(bookmarkSchema),
		defaultValues: initialValues || {
			label: "",
			url: "https://",
		},
	})

	const handleSubmit = async (values: z.infer<typeof bookmarkSchema>) => {
		if (initialValues) {
			await db.bookmarks.update(initialValues.id, values)
		} else {
			await db.bookmarks.add(values)
		}

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
