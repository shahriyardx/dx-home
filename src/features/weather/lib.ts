import {
	Cloud,
	CloudDrizzle,
	CloudFog,
	CloudLightning,
	CloudMoon,
	CloudRain,
	CloudSnow,
	CloudSun,
	type LucideIcon,
	Moon,
	Sun,
} from "lucide-react"

/** WMO weather interpretation codes, as Open-Meteo returns them. */
export function describeWeather(
	code: number,
	isDay: boolean,
): { label: string; icon: LucideIcon } {
	if (code === 0) return { label: "Clear", icon: isDay ? Sun : Moon }
	if (code <= 2)
		return { label: "Partly cloudy", icon: isDay ? CloudSun : CloudMoon }
	if (code === 3) return { label: "Cloudy", icon: Cloud }
	if (code === 45 || code === 48) return { label: "Fog", icon: CloudFog }
	if (code >= 51 && code <= 57) return { label: "Drizzle", icon: CloudDrizzle }
	if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
		return { label: "Rain", icon: CloudRain }
	if ((code >= 71 && code <= 77) || code === 85 || code === 86)
		return { label: "Snow", icon: CloudSnow }
	if (code >= 95) return { label: "Storm", icon: CloudLightning }
	return { label: "Cloudy", icon: Cloud }
}

/** The latest entry that has started by `now` (epoch ms), or null. */
export function pickCurrent<T extends { t: number }>(
	items: T[],
	now: number,
): T | null {
	let hit: T | null = null
	for (const item of items) if (item.t * 1000 <= now) hit = item
	return hit
}
