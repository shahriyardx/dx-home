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

	const hours = clockOnly ? String(h12).padStart(2, "0") : String(h12)
	const ss = String(now.getSeconds()).padStart(2, "0")

	// Thin and lifted: a bold colon at this size reads as two holes punched in
	// the numbers, and Roboto's sits a little low against lining digits.
	const colon = (
		<span className="-mx-[0.01em] inline-block -translate-y-[0.06em] font-light text-white/40">
			:
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
						<span className="text-white/60">{ss}</span>
					</>
				) : (
					<span className="ms-4 text-2xl font-semibold tracking-normal text-white/60 lg:text-3xl">
						{ampm}
					</span>
				)}
			</h1>

			<p
				className={cn(
					"on-wallpaper mt-4 text-lg font-medium text-white/80",
					clockOnly && "mt-6 text-xl",
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
