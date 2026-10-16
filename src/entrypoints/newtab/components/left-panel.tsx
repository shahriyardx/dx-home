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
import { SegmentedTabs } from "@/shared/ui/tabs"

type Feed = "recentTabs" | "readingList"

const FEEDS = [
	{ value: "recentTabs", label: "Recent", icon: <History /> },
	{ value: "readingList", label: "Reading", icon: <BookOpen /> },
] satisfies { value: Feed; label: string; icon: React.ReactNode }[]

const LeftPanel = ({ fullWidth = false }: { fullWidth?: boolean }) => {
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
				{/*
				 * 72rem, double the old 36rem cap. The panel is user-resizable, so a
				 * tight cap meant dragging the handle past it only widened the empty
				 * gutter, not the content.
				 *
				 * With no right panel there is no gutter to balance against, so the cap
				 * comes off entirely and the column takes the window.
				 */}
				<div className={cn("w-full shrink-0", !fullWidth && "max-w-[72rem]")}>
					{settings.showClock && (
						<div className="rise">
							<SectionBoundary label="Clock">
								<Clock />
							</SectionBoundary>
						</div>
					)}

					<div className="rise-stagger mt-10 space-y-8">
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
								<SegmentedTabs
									value={feed}
									onChange={setFeed}
									items={FEEDS}
									className="mb-3 bg-surface"
								/>
								{/* Keyed so switching feeds remounts and fades the new one in. */}
								<div key={feed} className="fade-in">
									<SectionBoundary
										label={
											feed === "recentTabs" ? "Recent tabs" : "Reading list"
										}
									>
										{feed === "recentTabs" ? (
											<RecentTabs tabbed />
										) : (
											<NewtabReadingList tabbed />
										)}
									</SectionBoundary>
								</div>
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
