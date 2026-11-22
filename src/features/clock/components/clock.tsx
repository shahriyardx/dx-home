import { useNewtabSettings } from "@/features/settings"
import { Weather } from "@/features/weather"
import { cn } from "@/shared/lib/utils"
import { useState, useEffect } from "react"

const Clock = () => {
	const { settings } = useNewtabSettings()
	const [clockOnly, setClockOnly] = useState(false)
	const [now, setNow] = useState(new Date())

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(id)
	}, [])

	const h = now.getHours()
	// Always two digits: "01" sits as one block with the minutes, and the width
	// never shifts when the hour crosses 9 to 10.
	const hours = String(settings.clock24h ? h : h % 12 || 12).padStart(2, "0")
	const mm = String(now.getMinutes()).padStart(2, "0")
	const ampm = h >= 12 ? "PM" : "AM"
	const ss = String(now.getSeconds()).padStart(2, "0")

	// Drawn, not typed: Roboto's colon is either too thin to hold its own next to
	// the digits or, when bold, two round holes. Two squares in the accent, sized
	// in em so they scale with the clock in focus mode too.
	const colon = (
		<span className="mx-[0.11em] inline-flex translate-y-[0.03em] flex-col gap-[0.23em] self-center">
			<span className="sr-only">:</span>
			<i className="size-[0.13em] rounded-[0.03em] bg-primary" />
			<i className="size-[0.13em] rounded-[0.03em] bg-primary" />
		</span>
	)

	return (
		<button
			type="button"
			onClick={() => setClockOnly((v) => !v)}
			title={clockOnly ? "Exit focus" : "Focus the clock"}
			className={cn(
				"block w-fit select-none text-left",
				clockOnly &&
					"fade-in fixed inset-0 z-50 flex w-full flex-col items-center justify-center bg-black/30 backdrop-blur-3xl",
			)}
		>
			{/* tabular-nums so the width does not jitter as the minute ticks over. */}
			<h1
				className={cn(
					"on-wallpaper flex items-baseline font-semibold tracking-tight tabular-nums",
					// Focus mode has the whole window; vw drives it, the rem cap only
					// stops it overflowing an ultrawide.
					clockOnly
						? "text-[min(16vw,12rem)] leading-[0.85]"
						: "text-8xl leading-none lg:text-9xl",
				)}
			>
				<span className="text-white">{hours}</span>
				{colon}
				{/* Minutes take the wallpaper's accent: the clock belongs to the theme. */}
				<span className="text-primary">{mm}</span>
				{clockOnly ? (
					<>
						{colon}
						<span className="text-white/85">{ss}</span>
					</>
				) : settings.clock24h ? null : (
					// Full size so the line reads as one block; dimmed so the time still
					// leads. Below the white/70 wallpaper floor on purpose: at this size it
					// stays readable, and the hours and minutes carry the information.
					<span className="ms-[0.15em] text-white/40">{ampm}</span>
				)}
			</h1>

			<div
				className={cn(
					"on-wallpaper mt-4 flex items-center gap-3.5 text-xl font-semibold text-white",
					clockOnly && "mt-8 justify-center",
				)}
			>
				<p>
					{now.toLocaleDateString(undefined, {
						weekday: "long",
						month: "long",
						day: "numeric",
					})}
				</p>
				<Weather />
			</div>
		</button>
	)
}

export default Clock
