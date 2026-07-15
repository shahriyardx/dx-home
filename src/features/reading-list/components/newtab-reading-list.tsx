import { useState, useEffect } from "react"
import { useReadingList } from "@/features/reading-list/use-reading-list"
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { EmptyState, SectionHeader } from "@/shared/components/section-header"
import SingleReadingItem from "@/features/reading-list/components/single-reading-item"

const PAGE_SIZE = 10

function Pager({
	page,
	totalPages,
	onChange,
}: {
	page: number
	totalPages: number
	onChange: (page: number) => void
}) {
	const step =
		"cursor-pointer rounded p-0.5 text-white/30 transition-colors hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-25"

	return (
		<div className="flex items-center gap-1">
			<button
				type="button"
				onClick={() => onChange(Math.max(0, page - 1))}
				disabled={page === 0}
				className={step}
			>
				<ChevronLeft className="size-3" />
			</button>
			<span className="font-mono text-[10px] tabular-nums text-white/35">
				{page + 1}/{totalPages}
			</span>
			<button
				type="button"
				onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
				disabled={page >= totalPages - 1}
				className={step}
			>
				<ChevronRight className="size-3" />
			</button>
		</div>
	)
}

export function NewtabReadingList({ tabbed }: { tabbed?: boolean }) {
	const { items, deleteItem, toggleRead } = useReadingList()
	const [page, setPage] = useState(0)
	const totalPages = Math.ceil(items.length / PAGE_SIZE)
	const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

	useEffect(() => {
		if (page >= totalPages) setPage(Math.max(0, totalPages - 1))
	}, [page, totalPages])

	if (items.length === 0) return <EmptyState>Reading list empty</EmptyState>

	const pager =
		totalPages > 1 ? (
			<Pager page={page} totalPages={totalPages} onChange={setPage} />
		) : null

	return (
		<div>
			{tabbed ? (
				// Tabbed: the tab strip is already the heading, so only the pager
				// needs a home.
				pager && <div className="mb-3 flex justify-end">{pager}</div>
			) : (
				<SectionHeader icon={BookOpen} action={pager}>
					Reading List
				</SectionHeader>
			)}
			<div className="flex flex-wrap items-center gap-1.5">
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
