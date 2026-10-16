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
import { Switch } from "@/shared/ui/switch"

type Section = {
	key: keyof NewtabSettings
	label: string
	desc?: string
}

const SECTIONS: Section[] = [
	{ key: "showClock", label: "Clock" },
	{ key: "showSearch", label: "Search" },
	{ key: "showBookmarks", label: "Bookmarks" },
	{ key: "showRecentTabs", label: "Recent tabs" },
	{ key: "showRightPanel", label: "Tasks panel" },
	{ key: "showReadingList", label: "Reading list" },
	// The one label users can't guess from its name.
	{
		key: "showDevServers",
		label: "Dev servers",
		desc: "Finds servers on localhost",
	},
]

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
		<div className="flex flex-col gap-1">
			{SECTIONS.map((section) => {
				const isDevServers = section.key === "showDevServers"
				const on = isDevServers ? devServersOn : settings[section.key]
				const desc =
					isDevServers && needsAccess
						? "Needs access to localhost"
						: section.desc

				return (
					// biome-ignore lint/a11y/noLabelWithoutControl: Switch renders the control; wrapping it is Base UI's documented label pattern.
					<label
						key={section.key}
						className="flex items-center gap-3 rounded-[1.25rem] px-3 py-2.5 transition-colors hover:bg-surface-hover"
					>
						<span className="min-w-0 flex-1">
							<span className="block text-sm font-semibold">
								{section.label}
							</span>
							{desc && (
								<span className="block truncate text-xs text-muted">
									{desc}
								</span>
							)}
						</span>
						<Switch
							checked={on}
							onCheckedChange={() =>
								isDevServers
									? toggleDevServers()
									: updateSetting(section.key, !settings[section.key])
							}
						/>
					</label>
				)
			})}
		</div>
	)
}
