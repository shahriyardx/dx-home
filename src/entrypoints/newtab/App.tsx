import { useState, useEffect } from "react"
import Bookmarks from "@/components/bookmark/bookmarks"
import Clock from "@/components/clock"
import Tasks from "@/components/tasks/Tasks"
import RecentTabs from "@/components/recent-tabs/tabs"
import SearchBar from "@/components/search"
import { useBackground } from "@/hooks/useBackground"
import { useReadingList } from "@/hooks/useReadingList"
import { Check, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { Favicon } from "@/components/favicon"

import { useNewtabSettings } from "@/hooks/useNewtabSettings"

function formatHostname(url: string): string {
	try {
		const parsed = new URL(url)
		const hasExtra =
			parsed.pathname !== "/" || parsed.search !== "" || parsed.hash !== ""
		return hasExtra ? `${parsed.hostname}/...` : parsed.hostname
	} catch {
		return url
	}
}

const PAGE_SIZE = 5

function NewtabReadingList() {
	const { items } = useReadingList()
	const [page, setPage] = useState(0)
	const totalPages = Math.ceil(items.length / PAGE_SIZE)
	const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

	useEffect(() => {
		if (page >= totalPages) setPage(Math.max(0, totalPages - 1))
	}, [page, totalPages])
	if (items.length === 0) return null

	const unreadCount = items.filter((i) => !i.read).length

	return (
		<div>
			<div className="flex items-center gap-2 mb-2">
				<BookOpen className="size-3.5 text-muted-foreground" />
				<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
					Reading List
				</h3>
				<span className="text-[10px] text-muted-foreground/60 font-medium ml-auto">
					{unreadCount} unread
				</span>
			</div>
			<div className="flex flex-col gap-1.5">
				{pageItems.map((item) => (
					<a
						key={item.id}
						href={item.url}
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-2.5 bg-secondary/50 rounded-md p-2 border text-sm transition-colors group hover:bg-secondary"
					>
						{item.read ? (
							<div className="size-4 shrink-0 rounded flex items-center justify-center bg-primary/10 text-primary">
								<Check className="size-3" />
							</div>
						) : item.icon ? (
							<img src={item.icon} alt="" className="size-4 shrink-0 rounded" />
						) : (
							<Favicon url={item.url} size={16} className="size-4 shrink-0 rounded" />
						)}
						<div className="min-w-0 flex-1">
							<p
								className={
									"truncate text-xs " +
									(item.read
										? "text-muted-foreground/50 line-through"
										: "text-foreground/80 group-hover:text-foreground")
								}
							>
								{item.title}
							</p>
							<p className="text-[10px] text-muted-foreground truncate">
								{formatHostname(item.url)}
							</p>
						</div>
					</a>
				))}
			</div>
			{totalPages > 1 && (
				<div className="flex items-center justify-end gap-1 mt-1.5">
					<button
						type="button"
						onClick={() => setPage(Math.max(0, page - 1))}
						disabled={page === 0}
						className="p-0.5 rounded text-muted-foreground/50 hover:text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
					>
						<ChevronLeft className="size-3" />
					</button>
					<span className="text-[10px] text-muted-foreground/50 font-medium tabular-nums">
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
	)
}

const App = () => {
	const { active: bg } = useBackground()
	const { settings } = useNewtabSettings()

	const bgStyle =
		bg.type === "image"
			? {
					backgroundImage: `url(${bg.value})`,
					backgroundSize: "cover" as const,
					backgroundPosition: "center" as const,
				}
			: {
					background: bg.value,
					backgroundSize: "cover" as const,
					backgroundPosition: "center" as const,
				}

	return (
		<div
			className="min-h-screen grid grid-cols-1 lg:grid-cols-[6fr_4fr] bg-cover bg-center"
			style={bgStyle}
		>
			<div className="flex flex-col px-16 relative h-screen overflow-y-auto">
				<div className="absolute inset-0 bg-cover opacity-50 z-0"></div>
				<div className="flex flex-col justify-center z-50 my-auto min-h-0">
					{settings.showClock && <Clock />}
					<div className="space-y-5 mt-10">
						{settings.showSearch && <SearchBar />}
						{settings.showBookmarks && <Bookmarks />}
						{settings.showRecentTabs && <RecentTabs />}
						{settings.showReadingList && <NewtabReadingList />}
					</div>
				</div>
			</div>

			{settings.showTasks && (
				<div className="max-lg:hidden lg:h-screen bg-secondary/10 backdrop-blur-xl">
					<div className="h-full border-l">
						<Tasks />
					</div>
				</div>
			)}
		</div>
	)
}

export default App
