import { useWeather } from "../use-weather"
import { describeWeather } from "../lib"

/** Continues the date line: a square divider, then icon, temperature, condition. */
export function Weather() {
	const conditions = useWeather()
	if (!conditions) return null

	const { label, icon: Icon } = describeWeather(
		conditions.code,
		conditions.isDay,
	)

	return (
		<>
			<span className="size-1.5 rounded-[2px] bg-primary" />
			<span className="fade-in flex items-center gap-2">
				<Icon className="size-6 shrink-0 text-primary" strokeWidth={2} />
				<span className="tabular-nums">{conditions.temp}°</span>
				<span className="text-white/70">{label}</span>
			</span>
		</>
	)
}
