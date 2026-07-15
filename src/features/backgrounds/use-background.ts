import { defineStorageItem, useStorageItem } from "@/shared/storage"
import { isSafeImageUrl } from "@/shared/lib/utils"

export interface BackgroundPreset {
	id: string
	name: string
	type: "image" | "gradient"
	value: string
}

export const PRESETS: BackgroundPreset[] = [
	{
		id: "peaks",
		name: "Peaks",
		type: "image",
		value: "/backgrounds/peaks.png",
	},
	{
		id: "forest",
		name: "Forest",
		type: "image",
		value: "/backgrounds/forest.png",
	},
	{
		id: "ocean",
		name: "Ocean",
		type: "image",
		value: "/backgrounds/ocean.png",
	},
	{
		id: "sunset",
		name: "Sunset",
		type: "image",
		value: "/backgrounds/sunset.png",
	},
	{
		id: "aurora",
		name: "Aurora",
		type: "image",
		value: "/backgrounds/aurora.png",
	},
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

export const backgroundPresetId = defineStorageItem<string>(
	"local",
	"dx-background",
	PRESETS[0].id,
)

export const customBackground = defineStorageItem<string | null, unknown>(
	"local",
	"dx-background-custom",
	null,
	{
		// Validated on read, not only where it is written: a URL stored before
		// this check existed — or by an older version — must not become live.
		deserialize: (url) =>
			typeof url === "string" && isSafeImageUrl(url) ? url : null,
	},
)

export function useBackground() {
	const { value: presetId, setValue: setPresetId } =
		useStorageItem(backgroundPresetId)
	const { value: customUrl, setValue: setCustomUrl } =
		useStorageItem(customBackground)

	const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]

	const active: BackgroundPreset = customUrl
		? { id: "custom", name: "Custom", type: "image", value: customUrl }
		: preset

	const setBackground = async (next: BackgroundPreset) => {
		// Clearing the custom image is what makes a preset take effect.
		await Promise.all([setPresetId(next.id), setCustomUrl(null)])
	}

	const setCustomBackground = (url: string) => setCustomUrl(url)

	return { active, setBackground, setCustomBackground }
}
