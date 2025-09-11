import { Button } from "@/components/ui/button"
import { type Bookmark, db } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"
import { PenIcon, PlusIcon, Trash2Icon } from "lucide-react"
import {
	BookmarkDialog,
	bookmarkSchema,
	type BookmarkType,
} from "@/components/bookmark/bookmark-dialog"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog"
import BookmarkForm from "./bookmark-form"

const Bookmarks = () => {
	const bookmarks =
		useLiveQuery(() => db.bookmarks.toArray()) || ([] as Bookmark[])

	return (
		<div className="flex flex-wrap items-center gap-4">
			{bookmarks.map((bookmark) => (
				<SingleBookmark key={bookmark.id} bookmark={bookmark} />
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
	const [open, setOpen] = useState(false)
	const url = new URL(bookmark.url)
	const form = useForm({
		resolver: zodResolver(bookmarkSchema),
		defaultValues: bookmark,
	})

	const handleSubmit = async (values: BookmarkType) => {
		await db.bookmarks.update(bookmark.id, values)
		setOpen(false)
	}

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger>
					<div className="flex flex-col gap-1 items-center">
						<Button size="icon" className="rounded-full w-10 h-10 p-2" asChild>
							<a href={bookmark.url}>
								<img
									src={`${url.origin}/favicon.ico`}
									onError={(e) => {
										e.currentTarget.src = `https://icons.duckduckgo.com/ip3/${url.hostname}.ico`
									}}
									alt=""
								/>
							</a>
						</Button>

						<p>{bookmark.label}</p>
					</div>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onSelect={() => setOpen(true)}>
						<PenIcon /> Edit
					</ContextMenuItem>
					<ContextMenuItem onClick={() => db.bookmarks.delete(bookmark.id)}>
						<Trash2Icon /> Delete
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<Dialog open={open} onOpenChange={(val) => setOpen(val)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit Bookmark</DialogTitle>
					</DialogHeader>

					<BookmarkForm
						form={form}
						handleSubmit={(values) => console.log(values)}
					/>

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
		</>
	)
}
