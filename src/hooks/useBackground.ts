import { useState, useEffect } from "react"

const STORAGE_KEY = "dx-background"
const CUSTOM_KEY = "dx-background-custom"

export interface BackgroundPreset {
	id: string
	name: string
	type: "image" | "gradient"
	value: string
}

export const PRESETS: BackgroundPreset[] = [
	{ id: "peaks", name: "Peaks", type: "image", value: "/backgrounds/peaks.png" },
	{ id: "forest", name: "Forest", type: "image", value: "/backgrounds/forest.png" },
	{ id: "ocean", name: "Ocean", type: "image", value: "/backgrounds/ocean.png" },
	{ id: "sunset", name: "Sunset", type: "image", value: "/backgrounds/sunset.png" },
	{ id: "aurora", name: "Aurora", type: "image", value: "/backgrounds/aurora.png" },
	{
		id: "tulips",
		name: "Tulips",
		type: "image",
		value: "/backgrounds/pink-tulips-on-wood-texture.jpg",
	},
	{
		id: "rose",
		name: "Rose",
		type: "image",
		value: "/backgrounds/red-rose-with-dew-drops.jpg",
	},
	{
		id: "autumn",
		name: "Autumn",
		type: "image",
		value: "/backgrounds/warm-colored-autumn-leaves.jpg",
	},
]

export function useBackground() {
	const [active, setActive] = useState<BackgroundPreset>(PRESETS[0])
	const [customBg, setCustomBg] = useState<string | null>(null)

	const current: BackgroundPreset = customBg
		? { id: "custom", name: "Custom", type: "image", value: customBg }
		: active

	useEffect(() => {
		chrome.storage.local.get([STORAGE_KEY, CUSTOM_KEY]).then((res) => {
			const custom = res[CUSTOM_KEY] as string | undefined
			if (custom) {
				setCustomBg(custom)
				return
			}
			const saved = res[STORAGE_KEY] as string | undefined
			if (saved) {
				const found = PRESETS.find((p) => p.id === saved)
				if (found) setActive(found)
			}
		})

		const handler = (changes: Record<string, chrome.storage.StorageChange>) => {
			if (changes[CUSTOM_KEY]) {
				const url = changes[CUSTOM_KEY].newValue as string | undefined
				setCustomBg(url || null)
				return
			}
			if (changes[STORAGE_KEY]) {
				const id = changes[STORAGE_KEY].newValue as string | undefined
				const found = PRESETS.find((p) => p.id === id)
				if (found) setActive(found)
				setCustomBg(null)
			}
		}
		chrome.storage.onChanged.addListener(handler)
		return () => chrome.storage.onChanged.removeListener(handler)
	}, [])

	const setBackground = (preset: BackgroundPreset) => {
		setActive(preset)
		setCustomBg(null)
		chrome.storage.local.set({ [STORAGE_KEY]: preset.id, [CUSTOM_KEY]: null })
	}

	const setCustomBackground = (url: string) => {
		setCustomBg(url)
		chrome.storage.local.set({ [CUSTOM_KEY]: url })
	}

	return { active: current, setBackground, setCustomBackground }
}
