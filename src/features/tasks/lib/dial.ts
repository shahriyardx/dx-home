/**
 * Geometry for the clock-face time picker. 0° is 12 o'clock, clockwise.
 *
 * 12-hour: one ring, 12 at the top.
 * 24-hour (as Material 3 does it): outer ring 12, 1–11; inner ring 00, 13–23.
 */

export const DIAL_SIZE = 256
/** Label ring radii, from the centre. */
export const OUTER_R = 104
export const INNER_R = 68

/** Angle (0–360) and distance of a point from the dial's centre. */
export function polar(x: number, y: number, size = DIAL_SIZE) {
	const dx = x - size / 2
	const dy = y - size / 2
	const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
	return { deg, dist: Math.hypot(dx, dy) }
}

/** Position on the face for a label at `deg` on ring radius `r`. */
export function onRing(deg: number, r: number, size = DIAL_SIZE) {
	const rad = (deg * Math.PI) / 180
	return { x: size / 2 + r * Math.sin(rad), y: size / 2 - r * Math.cos(rad) }
}

/** Hour (0–23) under a point. `pm` only matters in 12-hour mode. */
export function hourAt(
	deg: number,
	dist: number,
	{ use24h, pm }: { use24h: boolean; pm: boolean },
) {
	const slot = Math.round(deg / 30) % 12 // 0 = top
	if (use24h) {
		const inner = dist < (OUTER_R + INNER_R) / 2
		if (inner) return slot === 0 ? 0 : slot + 12
		return slot === 0 ? 12 : slot
	}
	return (slot % 12) + (pm ? 12 : 0)
}

export function minuteAt(deg: number) {
	return Math.round(deg / 6) % 60
}

/** Where the hand points for hour `h`: angle and which ring. */
export function hourHand(h: number, use24h: boolean) {
	const deg = (h % 12) * 30
	const inner = use24h && (h === 0 || h > 12)
	return { deg, r: inner ? INNER_R : OUTER_R }
}
