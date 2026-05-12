import Bookmarks from "@/components/bookmark/bookmarks"
import Clock from "@/components/clock"
import Tasks from "@/components/tasks/Tasks"
import RecentTabs from "@/components/recent-tabs/tabs"
import SearchBar from "@/components/search"
import { useBackground } from "@/hooks/useBackground"
import { useNewtabSettings } from "@/hooks/useNewtabSettings"
import { NewtabReadingList } from "@/components/reading-list/newtab-reading-list"

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
