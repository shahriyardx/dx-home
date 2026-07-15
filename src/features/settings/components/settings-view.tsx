import { useEffect, useState } from "react"
import {
	useNewtabSettings,
	type NewtabSettings,
} from "@/features/settings/use-newtab-settings"
import {
	hasLocalhostAccess,
	requestLocalhostAccess,
	revokeLocalhostAccess,
} from "@/features/dev-servers"
import { cn } from "@/shared/lib/utils"

type Section = {
	key: keyof NewtabSettings
	label: string
	desc: string
}

const SECTIONS: Section[] = [
	{ key: "showClock", label: "Clock", desc: "Current time display" },
	{ key: "showSearch", label: "Search Bar", desc: "Search the web" },
	{ key: "showBookmarks", label: "Bookmarks", desc: "Saved site shortcuts" },
	{ key: "showRecentTabs", label: "Recent Tabs", desc: "Recently closed tabs" },
	{
		key: "showRightPanel",
		label: "Right Panel",
		desc: "Right sidebar content",
	},
	{ key: "showReadingList", label: "Reading List", desc: "Saved pages" },
	{
		key: "showDevServers",
		label: "Dev Servers",
		desc: "Find local HTTP servers",
	},
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
	const [localhostAccess, setLocalhostAccess] = useState<boolean | null>(null)

	useEffect(() => {
		hasLocalhostAccess().then(setLocalhostAccess)
	}, [])

	// The setting defaults to on, so it is true before access exists. What the
	// user sees — and what the toggle acts on — has to be the effective state,
	// not the stored flag, or the first click reads as "turn off" and the
	// permission is never requested.
	const devServersOn = settings.showDevServers && localhostAccess === true

	/**
	 * Turning it on needs localhost access, and Chrome only shows that prompt
	 * from a user gesture — this click is the only place it can be asked for.
	 * Decline and the toggle stays off rather than sitting on while the feature
	 * silently does nothing.
	 *
	 * Turning it off hands the permission back. Nothing here is permanent: the
	 * extension should not keep read access to localhost once the user has said
	 * they are done with it.
	 */
	const toggleDevServers = async () => {
		if (devServersOn) {
			await updateSetting("showDevServers", false)
			await revokeLocalhostAccess()
			setLocalhostAccess(false)
			return
		}

		const ok = localhostAccess || (await requestLocalhostAccess())
		setLocalhostAccess(ok)
		await updateSetting("showDevServers", ok)
	}

	const needsAccess = settings.showDevServers && localhostAccess === false

	return (
		<div>
			<div className="space-y-2">
				{SECTIONS.map((section) => {
					const isDevServers = section.key === "showDevServers"
					const on = isDevServers
						? settings.showDevServers && localhostAccess === true
						: settings[section.key]

					return (
						<div
							key={section.key}
							className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-accent transition-colors"
						>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium">{section.label}</p>
								<p className="text-xs text-muted-foreground truncate">
									{isDevServers && needsAccess
										? "Allow access to localhost to use this"
										: section.desc}
								</p>
							</div>
							<Toggle
								on={on}
								onToggle={() =>
									isDevServers
										? toggleDevServers()
										: updateSetting(section.key, !settings[section.key])
								}
							/>
						</div>
					)
				})}
			</div>
		</div>
	)
}
