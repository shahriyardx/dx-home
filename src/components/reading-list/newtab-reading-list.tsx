import { useState, useEffect } from "react"
import { useReadingList } from "@/hooks/use-reading-list"
import { Check, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { Favicon } from "@/components/favicon"
import { LinkCard } from "@/components/link-card"

const PAGE_SIZE = 10

export function NewtabReadingList({ tabbed }: { tabbed?: boolean }) {
	const { items } = useReadingList()
	const [page, setPage] = useState(0)
	const totalPages = Math.ceil(items.length / PAGE_SIZE)
	const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

	useEffect(() => {
		if (page >= totalPages) setPage(Math.max(0, totalPages - 1))
	}, [page, totalPages])
	if (items.length === 0) return null

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
					<LinkCard
						key={item.id}
						icon={
							item.read ? (
								<div className="size-5 shrink-0 rounded flex items-center justify-center bg-primary/10 text-primary">
									<Check className="size-3" />
								</div>
							) : item.icon ? (
								<img
									src={item.icon}
									alt=""
									className="size-5 shrink-0 rounded"
								/>
							) : (
								<Favicon
									url={item.url}
									size={20}
									className="size-5 shrink-0 rounded"
								/>
							)
						}
						title={item.title}
						url={item.url}
						read={item.read}
					/>
				))}
			</div>
		</div>
	)
}
