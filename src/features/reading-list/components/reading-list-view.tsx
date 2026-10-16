import { useReadingList } from "@/features/reading-list/use-reading-list"
import { BookOpen, Check, Trash2 } from "lucide-react"
import { Favicon } from "@/shared/components/favicon"
import { cn, openExternal } from "@/shared/lib/utils"
import { useState } from "react"
import { Button } from "@/shared/ui/button"
import { SegmentedTabs } from "@/shared/ui/tabs"

type Filter = "all" | "unread" | "read"
const FILTERS = [
	{ value: "all", label: "All" },
	{ value: "unread", label: "Unread" },
	{ value: "read", label: "Read" },
] satisfies { value: Filter; label: string }[]

export function ReadingListView() {
	const { items, toggleRead, deleteItem } = useReadingList()
	const [filter, setFilter] = useState<Filter>("all")

	const filtered =
		filter === "all"
			? items
			: items.filter((i) => (filter === "read") === i.read)

	const openLink = (url: string) => openExternal(url)

	return (
		<div>
			<SegmentedTabs value={filter} onChange={setFilter} items={FILTERS} />

			{filtered.length === 0 ? (
				<p className="px-3 py-6 text-center text-sm text-muted">
					{items.length === 0 ? "Nothing saved yet" : `No ${filter} pages`}
				</p>
			) : (
				<div className="mt-3 flex flex-col gap-0.5">
					{filtered.map((item) => (
						<div
							key={item.id}
							className={cn(
								"group flex items-center gap-2.5 rounded-field px-2.5 py-1.5 transition-colors hover:bg-surface-hover",
								item.read && "text-muted",
							)}
						>
							{item.icon ? (
								<img
									src={item.icon}
									alt=""
									className="size-4 shrink-0 rounded"
								/>
							) : (
								<Favicon
									url={item.url}
									size={16}
									className="size-4 shrink-0 rounded"
								/>
							)}
							<button
								type="button"
								className="flex-1 truncate text-left text-[13px] font-medium"
								onClick={() => openLink(item.url)}
								title={item.title}
							>
								{item.title}
							</button>
							<div className="flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => toggleRead(item.id)}
									title={item.read ? "Mark unread" : "Mark read"}
								>
									<Check />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => deleteItem(item.id)}
									title="Delete"
									className="hover:text-danger"
								>
									<Trash2 />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export function SaveCurrentPageButton() {
	const [saving, setSaving] = useState(false)
	const { addItem } = useReadingList()

	const saveCurrent = async () => {
		setSaving(true)
		try {
			const [tab] = await chrome.tabs.query({
				active: true,
				currentWindow: true,
			})
			if (tab?.url && tab.title) {
				await addItem(tab.title, tab.url, tab.favIconUrl || "")
			}
		} finally {
			setSaving(false)
		}
	}

	return (
		<Button
			variant="tonal"
			onClick={saveCurrent}
			disabled={saving}
			className="mb-4 w-full"
		>
			<BookOpen />
			{saving ? "Saving…" : "Save this page"}
		</Button>
	)
}
