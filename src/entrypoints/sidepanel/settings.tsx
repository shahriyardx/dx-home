import {
	useNewtabSettings,
	type NewtabSettings,
} from "@/hooks/use-newtab-settings"
import { cn } from "@/lib/utils"

type Section = {
	key: keyof NewtabSettings
	label: string
	desc: string
}

const SECTIONS: Section[] = [
	{ key: "showClock", label: "Clock", desc: "Current time display" },
	{ key: "showSearch", label: "Search Bar", desc: "Search and calculator" },
	{ key: "showBookmarks", label: "Bookmarks", desc: "Saved site shortcuts" },
	{ key: "showRecentTabs", label: "Recent Tabs", desc: "Recently closed tabs" },
	{
		key: "showRightPanel",
		label: "Right Panel",
		desc: "Right sidebar content",
	},
	{ key: "showReadingList", label: "Reading List", desc: "Saved pages" },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className={cn(
				"relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
				on ? "bg-primary" : "bg-input",
			)}
			role="switch"
			aria-checked={on}
		>
			<span
				className={cn(
					"pointer-events-none block size-3 rounded-full bg-background shadow-sm ring-0 transition-transform",
					on ? "translate-x-3" : "translate-x-0",
				)}
			/>
		</button>
	)
}

export function SettingsView() {
	const { settings, updateSetting } = useNewtabSettings()

	return (
		<div>
			<div className="space-y-2">
				{SECTIONS.map((section) => (
					<div
						key={section.key}
						className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-accent transition-colors"
					>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium">{section.label}</p>
							<p className="text-xs text-muted-foreground truncate">
								{section.desc}
							</p>
						</div>
						<Toggle
							on={settings[section.key]}
							onToggle={() =>
								updateSetting(section.key, !settings[section.key])
							}
						/>
					</div>
				))}
			</div>
		</div>
	)
}
