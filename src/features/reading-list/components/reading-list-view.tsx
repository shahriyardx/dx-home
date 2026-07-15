import { useReadingList } from "@/features/reading-list/use-reading-list"
import { BookOpen, Check, Trash2 } from "lucide-react"
import { Favicon } from "@/shared/components/favicon"
import { cn, openExternal } from "@/shared/lib/utils"
import { useState } from "react"

type Filter = "all" | "unread" | "read"
const FILTERS: Filter[] = ["all", "unread", "read"]

export function ReadingListView() {
	const { items, toggleRead, deleteItem } = useReadingList()
	const [filter, setFilter] = useState<Filter>("all")

	const filtered =
		filter === "all"
			? items
			: items.filter((i) => (filter === "read") === i.read)

	const openLink = (url: string) => openExternal(url)

	return (
		<div className="@container">
			<div className="flex gap-0.5 @[400px]:gap-1 border rounded-md w-max">
				{FILTERS.map((f) => (
					<button
						type="button"
						key={f}
						onClick={() => setFilter(f)}
						className={cn(
							"text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold transition-colors",
							filter === f
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{f}
					</button>
				))}
			</div>

			{items.length === 0 ? (
				<p className="text-xs text-muted-foreground py-3 text-center mt-2">
					Nothing saved yet
				</p>
			) : filtered.length === 0 ? (
				<p className="text-xs text-muted-foreground py-3 text-center mt-2">
					No {filter} items
				</p>
			) : (
				<div className="space-y-0.5 mt-2">
					{filtered.map((item) => (
						<div
							key={item.id}
							className={cn(
								"flex items-center gap-1.5 rounded px-1.5 py-1.5 transition-colors group hover:bg-accent border-b border-border last:border-b-0",
								item.read && "opacity-50",
							)}
						>
							{item.icon ? (
								<img
									src={item.icon}
									alt=""
									className="size-3.5 shrink-0 rounded"
								/>
							) : (
								<Favicon
									url={item.url}
									size={14}
									className="size-3.5 shrink-0 rounded"
								/>
							)}
							<button
								type="button"
								className="flex-1 truncate text-left text-xs cursor-pointer"
								onClick={() => openLink(item.url)}
								title={item.title}
							>
								{item.title}
							</button>
							<button
								type="button"
								onClick={() => toggleRead(item.id)}
								className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted cursor-pointer shrink-0"
								title={item.read ? "Unread" : "Read"}
							>
								<Check className="size-2.5 text-muted-foreground" />
							</button>
							<button
								type="button"
								onClick={() => deleteItem(item.id)}
								className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted cursor-pointer shrink-0"
								title="Delete"
							>
								<Trash2 className="size-2.5 text-muted-foreground" />
							</button>
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
		<button
			type="button"
			onClick={saveCurrent}
			disabled={saving}
			className="w-full flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-ring transition-colors cursor-pointer mb-3"
		>
			<BookOpen className="size-4" />
			{saving ? "Saving..." : "Save Current Page"}
		</button>
	)
}
