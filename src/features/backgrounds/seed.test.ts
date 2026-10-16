import { describe, expect, test } from "bun:test"
import { seedFromPixels } from "./seed"

const px = (...rgb: [number, number, number][]) =>
	rgb.flatMap(([r, g, b]) => [r, g, b, 255])

describe("seedFromPixels", () => {
	test("picks the hue covering the most area, not the mean", () => {
		// 3 red, 1 green: the mean of these is a muddy brown.
		const seed = seedFromPixels(
			px([200, 30, 40], [200, 30, 40], [200, 30, 40], [40, 160, 60]),
		)
		expect(seed.hue).toBeGreaterThan(10)
		expect(seed.hue).toBeLessThan(40)
	})

	test("grey and near-black images have no chroma", () => {
		expect(seedFromPixels(px([128, 128, 128], [10, 10, 12])).chroma).toBe(0)
	})

	test("skips transparent pixels", () => {
		const seed = seedFromPixels([0, 0, 255, 0, 200, 30, 40, 255])
		expect(seed.hue).toBeLessThan(40)
	})
})
