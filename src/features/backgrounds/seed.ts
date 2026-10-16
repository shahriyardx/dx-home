/**
 * The wallpaper's dominant hue, in OKLCH degrees, plus how colourful the
 * wallpaper is overall (0–1). Every surface colour in the theme is derived from
 * these two numbers, the way Android's dynamic colour derives a scheme from the
 * home-screen photo.
 */
export interface Seed {
	hue: number
	chroma: number
}

export const DEFAULT_SEED: Seed = { hue: 265, chroma: 1 }

const BINS = 36

function toLinear(c: number) {
	const v = c / 255
	return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/** sRGB 0–255 → OKLab a/b plus lightness. */
function oklab(r: number, g: number, b: number) {
	const lr = toLinear(r)
	const lg = toLinear(g)
	const lb = toLinear(b)
	const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
	const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
	const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
	return {
		L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
	}
}

/**
 * Picks the hue that covers the most colourful area, not the mean colour: a
 * photo of red tulips on green leaves averages to grey, which is no-one's idea
 * of that photo's colour.
 *
 * ponytail: chroma-weighted hue histogram, not Material's quantize-and-score.
 * Upgrade to @material/material-color-utilities if seeds look wrong in practice.
 */
export function seedFromPixels(rgba: ArrayLike<number>): Seed {
	const bins = Array.from({ length: BINS }, () => ({ w: 0, a: 0, b: 0 }))
	let total = 0
	let count = 0

	for (let i = 0; i < rgba.length; i += 4) {
		if (rgba[i + 3] < 128) continue
		const { L, a, b } = oklab(rgba[i], rgba[i + 1], rgba[i + 2])
		const c = Math.hypot(a, b)
		count++
		total += c
		// Near-black and near-white pixels carry no usable hue.
		if (c < 0.02 || L < 0.15 || L > 0.97) continue
		const h = (Math.atan2(b, a) * 180) / Math.PI
		const bin = bins[Math.floor(((h + 360) % 360) / (360 / BINS)) % BINS]
		bin.w += c
		bin.a += a
		bin.b += b
	}

	const best = bins.reduce((x, y) => (y.w > x.w ? y : x))
	if (best.w === 0 || count === 0) return { hue: DEFAULT_SEED.hue, chroma: 0 }

	const hue = ((Math.atan2(best.b, best.a) * 180) / Math.PI + 360) % 360
	// 0.08 mean chroma reads as a properly colourful photo.
	const chroma = Math.min(1, total / count / 0.08)
	return { hue: Math.round(hue), chroma: Math.round(chroma * 100) / 100 }
}

/** Loads an image and samples it small. Null when the image is cross-origin. */
export async function seedFromImage(src: string): Promise<Seed | null> {
	const img = new Image()
	img.crossOrigin = "anonymous"
	img.src = src
	await img.decode()
	const canvas = document.createElement("canvas")
	canvas.width = 32
	canvas.height = 32
	const ctx = canvas.getContext("2d")
	if (!ctx) return null
	ctx.drawImage(img, 0, 0, 32, 32)
	try {
		return seedFromPixels(ctx.getImageData(0, 0, 32, 32).data)
	} catch {
		// Tainted canvas: the host sent no CORS header.
		return null
	}
}
