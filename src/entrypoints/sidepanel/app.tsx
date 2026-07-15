import { Image, BookmarkPlus, Settings } from "lucide-react"
import { useState } from "react"
import { BackgroundGrid } from "@/features/backgrounds"
import { SaveCurrentPageButton, ReadingListView } from "@/features/reading-list"
import { SettingsView } from "@/features/settings"
import { cn } from "@/shared/lib/utils"

type Tab = "backgrounds" | "saved" | "settings"

const TABS: { id: Tab; icon: typeof Image; label: string }[] = [
	{ id: "backgrounds", icon: Image, label: "Backgrounds" },
	{ id: "saved", icon: BookmarkPlus, label: "Saved" },
	{ id: "settings", icon: Settings, label: "Settings" },
]

function TabBar({
	active,
	onChange,
}: {
	active: Tab
	onChange: (t: Tab) => void
}) {
	return (
		<div className="flex gap-1 mb-4">
			{TABS.map((tab) => {
				const Icon = tab.icon
				return (
					<button
						type="button"
						key={tab.id}
						onClick={() => onChange(tab.id)}
						title={tab.label}
						className={cn(
							"flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-md transition-colors",
							active === tab.id
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:text-foreground hover:bg-accent border border-border",
						)}
					>
						<Icon className="size-3.5" />
						<span className="text-[7px] font-semibold uppercase tracking-wider leading-none">
							{tab.label}
						</span>
					</button>
				)
			})}
		</div>
	)
}

const App = () => {
	const [tab, setTab] = useState<Tab>("backgrounds")

	return (
		<div className="min-h-screen bg-background text-foreground p-3">
			<TabBar active={tab} onChange={setTab} />
			{tab === "backgrounds" && <BackgroundGrid />}
			{tab === "saved" && (
				<>
					<SaveCurrentPageButton />
					<ReadingListView />
				</>
			)}
			{tab === "settings" && <SettingsView />}
		</div>
	)
}

export default App
