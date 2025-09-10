import Bookmarks from "@/components/bookmark/bookmarks"
import Clock from "@/components/clock"

const App = () => {
	return (
		<div className="h-screen grid grid-cols-2 px-5">
			<div className="flex flex-col justify-center gap-24">
				<Clock />

				<Bookmarks />
			</div>
		</div>
	)
}

export default App
