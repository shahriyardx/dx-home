import { useBackground, PRESETS } from "@/hooks/useBackground"
import { SaveCurrentPageButton, ReadingListView } from "./ReadingList"
import { SettingsView } from "./Settings"
import { Check, Image, BookmarkPlus, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

function Preview({ value }: { value: string }) {
	return (
		<div
			className="w-full h-full bg-cover bg-center rounded-md"
			style={{ backgroundImage: `url(${value})` }}
		/>
	)
}

function BackgroundGrid() {
	const { active, setBackground } = useBackground()

	return (
		<div className="grid grid-cols-2 gap-2">
			{PRESETS.map((preset) => {
					const isActive = active.id === preset.id
					return (
						<button
							type="button"
							key={preset.id}
							onClick={() => setBackground(preset)}
							className={cn(
								"relative aspect-video rounded-lg border-2 overflow-hidden transition-all hover:ring-2 hover:ring-ring",
								isActive ? "border-ring ring-2 ring-ring" : "border-border",
							)}
						>
							<Preview value={preset.value} />
							{isActive && (
								<div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
									<Check className="size-3" />
								</div>
							)}
							<div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/60 to-transparent p-1.5">
								<span className="text-[11px] text-white font-medium">
									{preset.name}
								</span>
							</div>
						</button>
					)
				})}
			</div>
		
	)
}

type Tab = "backgrounds" | "saved" | "settings"
const TABS: { id: Tab; icon: typeof Image; label: string }[] = [
	{ id: "backgrounds", icon: Image, label: "Backgrounds" },
	{ id: "saved", icon: BookmarkPlus, label: "Saved" },
	{ id: "settings", icon: Settings, label: "Settings" },
]

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
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
