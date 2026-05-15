import { cn } from "@/lib/utils"
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
		<div
			onClick={() => setClockOnly((v) => !v)}
			className={cn(
				"cursor-pointer select-none transition-opacity duration-500",
				clockOnly &&
					"flex flex-col justify-center items-center fixed inset-0 z-50 backdrop-blur-3xl",
			)}
		>
			<h1
				className={cn(
					"font-bold tracking-tight text-foreground tabular-nums",
					clockOnly
						? "text-[min(18vw,8rem)] leading-none"
						: "text-7xl lg:text-8xl",
				)}
			>
				{time}
				{!clockOnly && <span className="text-foreground/50 ms-2">{ampm}</span>}
			</h1>
			<p className="mt-1 text-sm text-muted-foreground">
				{now.toLocaleDateString(undefined, {
					weekday: "long",
					year: "numeric",
					month: "long",
					day: "numeric",
				})}
			</p>
		</div>
	)
}

export default Clock
