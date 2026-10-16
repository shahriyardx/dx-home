import { defineStorageItem, useStorageItem } from "@/shared/storage"
import { isSafeImageUrl } from "@/shared/lib/utils"
import type { Seed } from "./seed"

export interface BackgroundPreset {
	id: string
	name: string
	type: "image" | "gradient"
	value: string
	/** Precomputed with seedFromPixels so presets theme with no flash. Custom
	 * images have none and are sampled at runtime. */
	seed?: Seed
}

export const PRESETS: BackgroundPreset[] = [
	{
		id: "peaks",
		name: "Peaks",
		type: "image",
		value: "/backgrounds/peaks.png",
		seed: { hue: 274, chroma: 0.47 },
	},
	{
		id: "forest",
		name: "Forest",
		type: "image",
		value: "/backgrounds/forest.png",
		seed: { hue: 269, chroma: 0.42 },
	},
	{
		id: "ocean",
		name: "Ocean",
		type: "image",
		value: "/backgrounds/ocean.png",
		seed: { hue: 203, chroma: 0.38 },
	},
	{
		id: "sunset",
		name: "Sunset",
		type: "image",
		value: "/backgrounds/sunset.png",
		seed: { hue: 256, chroma: 0.71 },
	},
	{
		id: "aurora",
		name: "Aurora",
		type: "image",
		value: "/backgrounds/aurora.png",
		seed: { hue: 265, chroma: 0 },
	},
	{
		id: "tulips",
		name: "Tulips",
		type: "image",
		value: "/backgrounds/pink-tulips-on-wood-texture.jpg",
		seed: { hue: 62, chroma: 0.55 },
	},
	{
		id: "rose",
		name: "Rose",
		type: "image",
		value: "/backgrounds/red-rose-with-dew-drops.jpg",
		seed: { hue: 24, chroma: 0.54 },
	},
	{
		id: "autumn",
		name: "Autumn",
		type: "image",
		value: "/backgrounds/warm-colored-autumn-leaves.jpg",
		seed: { hue: 55, chroma: 0.54 },
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
	const {
		value: presetId,
		setValue: setPresetId,
		loaded: presetLoaded,
	} = useStorageItem(backgroundPresetId)
	const {
		value: customUrl,
		setValue: setCustomUrl,
		loaded: customLoaded,
	} = useStorageItem(customBackground)
	const loaded = presetLoaded && customLoaded

	const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]

	const active: BackgroundPreset = customUrl
		? { id: "custom", name: "Custom", type: "image", value: customUrl }
		: preset

	const setBackground = async (next: BackgroundPreset) => {
		// Clearing the custom image is what makes a preset take effect.
		await Promise.all([setPresetId(next.id), setCustomUrl(null)])
	}

	const setCustomBackground = (url: string) => setCustomUrl(url)

	return { active, setBackground, setCustomBackground, loaded }
}
