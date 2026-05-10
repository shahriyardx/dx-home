import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Bookmark } from "@/lib/db"
import { PenIcon, Trash2Icon } from "lucide-react"
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
import { bookmarkSchema, type BookmarkType } from "."
import { useBookmarks } from "@/hooks/useBookmarks"

const faviconCache = new Map<string, string>()

function getFavicon(url: string): string {
	if (faviconCache.has(url)) return faviconCache.get(url)!
	try {
		const parsed = new URL(url)
		return `${parsed.origin}/favicon.ico`
	} catch {
		return ""
	}
}

const SingleBookmark = ({ bookmark }: { bookmark: Bookmark }) => {
	const [open, setOpen] = useState(false)
	const [faviconSrc, setFaviconSrc] = useState(getFavicon(bookmark.url))
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

	const handleFaviconError = () => {
		try {
			const parsed = new URL(bookmark.url)
			const fallback = `https://icons.duckduckgo.com/ip3/${parsed.hostname}.ico`
			faviconCache.set(bookmark.url, fallback)
			setFaviconSrc(fallback)
		} catch {
			setFaviconSrc("")
		}
	}

	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger>
					<div className="flex flex-col gap-1.5 items-center group">
						<Button
							size="icon"
							variant="ghost"
							className="w-12 h-12 bg-secondary/50 hover:bg-secondary transition-colors rounded-none!"
							asChild
						>
							<a href={bookmark.url}>
								{faviconSrc ? (
									<img
										src={faviconSrc}
										onError={handleFaviconError}
										alt=""
										className="w-5 h-5 object-contain"
									/>
								) : (
									<span className="text-sm text-muted-foreground">
										{bookmark.label.charAt(0).toUpperCase()}
									</span>
								)}
							</a>
						</Button>

						<span className="text-[11px] text-muted-foreground text-center max-w-[10ch] truncate leading-tight">
							{bookmark.label}
						</span>
					</div>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem onMouseDown={() => setOpen(true)}>
						<PenIcon className="size-3.5" /> Edit
					</ContextMenuItem>
					<ContextMenuItem variant="destructive" onMouseDown={() => deleteBookmark(bookmark.id)}>
						<Trash2Icon className="size-3.5" /> Delete
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<Dialog open={open} onOpenChange={(val) => setOpen(val)}>
				<DialogContent className="sm:max-w-[425px]">
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
