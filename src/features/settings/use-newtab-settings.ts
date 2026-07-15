import { useCallback } from "react"
import { defineStorageItem, useStorageItem } from "@/shared/storage"

export interface NewtabSettings {
	showClock: boolean
	showSearch: boolean
	showBookmarks: boolean
	showRecentTabs: boolean
	showRightPanel: boolean
	showReadingList: boolean
	showDevServers: boolean
}

const DEFAULTS: NewtabSettings = {
	showClock: true,
	showSearch: true,
	showBookmarks: true,
	showRecentTabs: true,
	showRightPanel: true,
	showReadingList: true,
	// On by default, but inert until localhost access is granted in settings —
	// the section renders nothing at all without it, so this costs a user who
	// never runs a dev server exactly nothing.
	showDevServers: true,
}

export const newtabSettings = defineStorageItem<
	NewtabSettings,
	Partial<NewtabSettings>
>("local", "dx-newtab-settings", DEFAULTS, {
	// Merged over DEFAULTS so a setting introduced in a later version still has
	// a value for users whose stored object predates it.
	deserialize: (saved) => ({ ...DEFAULTS, ...saved }),
})

export function useNewtabSettings() {
	const { value: settings, setValue, loaded } = useStorageItem(newtabSettings)

	const updateSetting = useCallback(
		<K extends keyof NewtabSettings>(key: K, value: NewtabSettings[K]) => {
			setValue({ ...settings, [key]: value })
		},
		[settings, setValue],
	)

	return { settings, updateSetting, loaded }
}
