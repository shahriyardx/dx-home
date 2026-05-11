import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "dx-newtab-settings"

export interface NewtabSettings {
	showClock: boolean
	showSearch: boolean
	showBookmarks: boolean
	showRecentTabs: boolean
	showTasks: boolean
	showReadingList: boolean
}

const DEFAULTS: NewtabSettings = {
	showClock: true,
	showSearch: true,
	showBookmarks: true,
	showRecentTabs: true,
	showTasks: true,
	showReadingList: false,
}

export function useNewtabSettings() {
	const [settings, setSettings] = useState<NewtabSettings>(DEFAULTS)
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		chrome.storage.local.get(STORAGE_KEY).then((res) => {
			const saved = res[STORAGE_KEY] as Partial<NewtabSettings> | undefined
			if (saved) {
				setSettings({ ...DEFAULTS, ...saved })
			}
			setLoaded(true)
		})

		const handler = (changes: Record<string, chrome.storage.StorageChange>) => {
			if (changes[STORAGE_KEY]) {
				const saved = changes[STORAGE_KEY].newValue as
					| Partial<NewtabSettings>
					| undefined
				if (saved) setSettings({ ...DEFAULTS, ...saved })
			}
		}
		chrome.storage.onChanged.addListener(handler)
		return () => chrome.storage.onChanged.removeListener(handler)
	}, [])

	const updateSetting = useCallback(
		(key: keyof NewtabSettings, value: boolean) => {
			const next = { ...settings, [key]: value }
			setSettings(next)
			chrome.storage.local.set({ [STORAGE_KEY]: next })
		},
		[settings],
	)

	return { settings, updateSetting, loaded }
}
