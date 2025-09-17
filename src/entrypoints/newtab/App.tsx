import { useState } from "react"
import Bookmarks from "@/components/bookmark/bookmarks"
import Clock from "@/components/clock"
import Settings from "@/components/settings/Settings"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"
import { useSettings } from "@/hooks/useSettings"
import RecentTabs from "@/components/recent-tabs"

const App = () => {
	const [settingsOpen, setSettingsOpen] = useState(false)
	const settings = useSettings()

	return (
		<>
			<div
				className="h-screen grid grid-cols-1 lg:grid-cols-2 px-10"
				style={{ background: settings.background }}
			>
				<div className="flex flex-col justify-center gap-24">
					<Clock />
					<div className="grid gap-5">
						<Bookmarks />
						<RecentTabs />
					</div>
				</div>
			</div>

			<div className="fixed bottom-5 right-5">
				<Button
					onClick={() => setSettingsOpen((val) => !val)}
					variant="ghost"
					className="cursor-pointer"
				>
					<Settings2 />
				</Button>

				<Settings open={settingsOpen} setOpen={setSettingsOpen} />
			</div>
		</>
	)
}

export default App
