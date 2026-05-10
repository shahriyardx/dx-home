import Bookmarks from "@/components/bookmark/bookmarks"
import Clock from "@/components/clock"
import Tasks from "@/components/tasks/Tasks"
import RecentTabs from "@/components/recent-tabs/tabs"
import SearchBar from "@/components/search"

const App = () => (
	<div
		className="min-h-screen grid grid-cols-1 lg:grid-cols-[6fr_4fr] bg-[url('/banner.png')]"
	>
		<div className="flex flex-col justify-center px-16 relative ">
			<div className="absolute inset-0 bg-cover opacity-50 z-0"></div>
			<div className="flex flex-col justify-center z-50">
				<Clock />
				<div className="space-y-5 mt-10">
					<SearchBar />
					<Bookmarks />
					<RecentTabs />
				</div>
			</div>
		</div>

		<div className="max-lg:hidden lg:h-screen bg-secondary/10 backdrop-blur-xl">
			<div className="h-full border-l">
				<Tasks />
			</div>
		</div>
	</div>
)

export default App
