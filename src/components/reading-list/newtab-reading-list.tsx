import { useState, useEffect } from "react"
import { useReadingList } from "@/hooks/use-reading-list"
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import SingleReadingItem from "@/components/reading-list/single-reading-item"

const PAGE_SIZE = 10

export function NewtabReadingList({ tabbed }: { tabbed?: boolean }) {
	const { items, deleteItem, toggleRead } = useReadingList()
	const [page, setPage] = useState(0)
	const totalPages = Math.ceil(items.length / PAGE_SIZE)
	const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

	useEffect(() => {
		if (page >= totalPages) setPage(Math.max(0, totalPages - 1))
	}, [page, totalPages])
	if (items.length === 0) return <p className="text-xs text-muted-foreground/60">Reading list empty</p>

	return (
		<div>
			<div className="flex items-center gap-2 mb-2">
				{!tabbed && (
					<>
						<BookOpen className="size-3.5 text-muted-foreground" />
						<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Reading List
						</h3>
					</>
				)}
				{totalPages > 1 && (
					<div className="flex items-center gap-1 ml-auto">
						<button
							type="button"
							onClick={() => setPage(Math.max(0, page - 1))}
							disabled={page === 0}
							className="p-0.5 rounded text-muted-foreground/50 hover:text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
						>
							<ChevronLeft className="size-3" />
						</button>
						<span className="text-[10px] text-muted-foreground/60 font-medium tabular-nums">
							{page + 1}/{totalPages}
						</span>
						<button
							type="button"
							onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
							disabled={page >= totalPages - 1}
							className="p-0.5 rounded text-muted-foreground/50 hover:text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
						>
							<ChevronRight className="size-3" />
						</button>
					</div>
				)}
			</div>
			<div className="flex items-center gap-1.5 flex-wrap">
				{pageItems.map((item) => (
					<SingleReadingItem
						key={item.id}
						item={item}
						onDelete={deleteItem}
						onToggleRead={toggleRead}
					/>
				))}
			</div>
		</div>
	)
}
