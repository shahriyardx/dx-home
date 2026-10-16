import { useEffect, useLayoutEffect } from "react"
import { DEFAULT_SEED, type Seed, seedFromImage } from "./seed"
import { useBackground } from "./use-background"

function apply(seed: Seed) {
	const root = document.documentElement
	root.style.setProperty("--seed-h", String(seed.hue))
	root.style.setProperty("--seed-c", String(seed.chroma))
}

/**
 * Themes the page from the active wallpaper. Call once per page, at the root.
 *
 * Presets carry a precomputed seed and apply before paint. Custom images are
 * sampled after they load; a cross-origin image that cannot be read falls back
 * to the default seed.
 */
export function useSeed() {
	const { active, loaded } = useBackground()

	useLayoutEffect(() => {
		if (!loaded || !active.seed) return
		apply(active.seed)
	}, [loaded, active.seed])

	useEffect(() => {
		if (!loaded) return
		// Turn the hue transition on only after the first real seed lands.
		const id = requestAnimationFrame(() =>
			document.documentElement.setAttribute("data-seeded", ""),
		)
		if (active.seed || active.type !== "image")
			return () => cancelAnimationFrame(id)

		let cancelled = false
		seedFromImage(active.value)
			.catch(() => null)
			.then((seed) => {
				if (!cancelled) apply(seed ?? DEFAULT_SEED)
			})
		return () => {
			cancelled = true
			cancelAnimationFrame(id)
		}
	}, [loaded, active.seed, active.type, active.value])
}
