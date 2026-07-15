import { cn } from "@/shared/lib/utils"
import { useState, useEffect } from "react"

const Clock = () => {
	const [clockOnly, setClockOnly] = useState(false)
	const [now, setNow] = useState(new Date())

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(id)
	}, [])

	const h = now.getHours()
	const h12 = h % 12 || 12
	const mm = String(now.getMinutes()).padStart(2, "0")
	const ampm = h >= 12 ? "PM" : "AM"

	const time = clockOnly
		? `${String(h12).padStart(2, "0")}:${mm}:${String(now.getSeconds()).padStart(2, "0")}`
		: `${h12}:${mm}`

	return (
		<button
			type="button"
			onClick={() => setClockOnly((v) => !v)}
			title={clockOnly ? "Exit focus" : "Focus the clock"}
			className={cn(
				"group block w-fit cursor-pointer select-none text-left transition-all duration-500",
				clockOnly &&
					"fixed inset-0 z-50 flex w-full flex-col items-center justify-center bg-black/25 backdrop-blur-3xl",
			)}
		>
			{/* tabular-nums so the width does not jitter as the minute ticks over. */}
			<h1
				className={cn(
					"on-wallpaper font-bold tabular-nums text-white",
					"tracking-tight",
					// Focus mode has the whole window to work with; the old 8rem cap
					// left it barely larger than the inline clock, which made the mode
					// look broken rather than focused. vw drives it, the rem cap only
					// stops it overflowing an ultrawide.
					clockOnly
						? "text-[min(16vw,12rem)] leading-[0.85]"
						: "text-7xl leading-none lg:text-8xl",
				)}
			>
				{time}
				{!clockOnly && <span className="ms-2 text-white/50">{ampm}</span>}
			</h1>

			{/*
			 * Digits have no descenders, so ~20% of the line box under them is
			 * empty. At 18rem that dead space *is* the gap — margin has to come off
			 * to compensate, not go on.
			 */}
			<p
				className={cn(
					"on-wallpaper font-medium uppercase text-white/55",
					"mt-3 text-[0.68rem] tracking-[0.3em]",
					clockOnly && "mt-2 text-xs tracking-[0.4em]",
				)}
			>
				{now.toLocaleDateString(undefined, {
					weekday: "long",
					month: "long",
					day: "numeric",
				})}
			</p>
		</button>
	)
}

export default Clock
