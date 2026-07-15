import { useState } from "react"
import { Bookmarks } from "@/features/bookmarks"
import { Clock } from "@/features/clock"
import { DevServers } from "@/features/dev-servers"
import { RecentTabs } from "@/features/recent-tabs"
import { SearchBar } from "@/features/search"
import { useNewtabSettings } from "@/features/settings"
import { NewtabReadingList } from "@/features/reading-list"
import { SectionBoundary } from "@/shared/components/error-boundary"
import { History, BookOpen } from "lucide-react"
import { cn } from "@/shared/lib/utils"

type Feed = "recentTabs" | "readingList"

const FEEDS: { id: Feed; icon: typeof History; label: string }[] = [
	{ id: "recentTabs", icon: History, label: "Recent" },
	{ id: "readingList", icon: BookOpen, label: "Reading" },
]

const LeftPanel = () => {
	const { settings } = useNewtabSettings()
	const [feed, setFeed] = useState<Feed>("recentTabs")

	const bothFeeds = settings.showRecentTabs && settings.showReadingList

	return (
		// Two layers on purpose: the scrim is absolute against this box so it
		// spans the panel and does not scroll, while the inner wrapper does the
		// scrolling. Making the outer box the scroller would stretch the scrim to
		// the scroll height instead of the window.
		<div className="relative h-screen">
			{/*
			 * The legibility floor: the wallpaper is user-chosen and can be
			 * blown-out white, so the column is weighted before any text lands on
			 * it.
			 *
			 * inset-0, no max-width — it has to reach the panel's right edge at
			 * every window size. Capped at a fixed width it died partway across a
			 * wide monitor and left a bright band between the scrim and the right
			 * panel.
			 */}
			<div className="content-scrim pointer-events-none absolute inset-0 z-0" />

			<div className="relative z-10 flex h-full flex-col justify-center overflow-y-auto px-16 py-12">
				<div className="w-full max-w-xl shrink-0">
					{settings.showClock && (
						<SectionBoundary label="Clock">
							<Clock />
						</SectionBoundary>
					)}

					<div className="mt-10 space-y-6">
						{settings.showSearch && (
							<SectionBoundary label="Search">
								<SearchBar />
							</SectionBoundary>
						)}

						{settings.showBookmarks && (
							<SectionBoundary label="Bookmarks">
								<Bookmarks />
							</SectionBoundary>
						)}

						{settings.showDevServers && (
							<SectionBoundary label="Dev servers">
								<DevServers />
							</SectionBoundary>
						)}

						{bothFeeds ? (
							<div>
								<div className="mb-3 flex items-center gap-1">
									{FEEDS.map((item) => {
										const Icon = item.icon
										const isActive = feed === item.id
										return (
											<button
												type="button"
												key={item.id}
												onClick={() => setFeed(item.id)}
												className={cn(
													"flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1",
													"text-[10px] font-semibold uppercase tracking-[0.16em]",
													"transition-all duration-200",
													isActive
														? "glass-raised text-white/90"
														: "on-wallpaper border border-transparent text-white/50 hover:text-white/80",
												)}
											>
												<Icon className="size-3" />
												{item.label}
											</button>
										)
									})}
								</div>
								<SectionBoundary
									label={feed === "recentTabs" ? "Recent tabs" : "Reading list"}
								>
									{feed === "recentTabs" ? (
										<RecentTabs tabbed />
									) : (
										<NewtabReadingList tabbed />
									)}
								</SectionBoundary>
							</div>
						) : (
							<>
								{settings.showRecentTabs && (
									<SectionBoundary label="Recent tabs">
										<RecentTabs />
									</SectionBoundary>
								)}
								{settings.showReadingList && (
									<SectionBoundary label="Reading list">
										<NewtabReadingList />
									</SectionBoundary>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default LeftPanel
