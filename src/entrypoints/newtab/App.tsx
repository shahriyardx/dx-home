import Bookmarks from "@/components/bookmark/bookmarks"
import Clock from "@/components/clock"
import Tasks from "@/components/tasks/Tasks"
import RecentTabs from "@/components/recent-tabs/tabs"

const BG = "#0a0a0a"

const App = () => (
	<div
		className="min-h-screen grid grid-cols-1 lg:grid-cols-[6fr_4fr] dark"
		style={{ background: BG }}
	>
		<div className="flex flex-col justify-center py-16 px-10 lg:px-16 gap-16">
			<Clock />
			<div className="space-y-6">
				<Bookmarks />
				<RecentTabs />
			</div>
		</div>

		<div className="max-lg:hidden lg:h-screen overflow-hidden">
			<div className="h-full border-l border-border">
				<Tasks />
			</div>
		</div>
	</div>
)

export default App
