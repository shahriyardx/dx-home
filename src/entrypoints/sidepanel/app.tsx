import { BookmarkPlus, Image, Settings } from "lucide-react"
import { useState } from "react"
import { BackgroundGrid, useSeed } from "@/features/backgrounds"
import { ReadingListView, SaveCurrentPageButton } from "@/features/reading-list"
import { SettingsView } from "@/features/settings"
import { SegmentedTabs } from "@/shared/ui/tabs"

type Tab = "backgrounds" | "saved" | "settings"

const TABS = [
	{ value: "backgrounds", label: "Wallpaper", icon: <Image /> },
	{ value: "saved", label: "Saved", icon: <BookmarkPlus /> },
	{ value: "settings", label: "Settings", icon: <Settings /> },
] satisfies { value: Tab; label: string; icon: React.ReactNode }[]

const App = () => {
	const [tab, setTab] = useState<Tab>("backgrounds")
	useSeed()

	return (
		<div className="min-h-screen bg-surface p-3 text-fg">
			<SegmentedTabs
				value={tab}
				onChange={setTab}
				items={TABS}
				className="mb-4 w-full [&>button]:flex-1 [&>button]:justify-center"
			/>
			<div key={tab} className="fade-in">
				{tab === "backgrounds" && <BackgroundGrid />}
				{tab === "saved" && (
					<>
						<SaveCurrentPageButton />
						<ReadingListView />
					</>
				)}
				{tab === "settings" && <SettingsView />}
			</div>
		</div>
	)
}

export default App
