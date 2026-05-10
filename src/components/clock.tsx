import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const BG = "#0a0a0a"

const Clock = () => {
	const [clockOnly, setClockOnly] = useState(false)
	const [currentTime, setCurrentTime] = useState(new Date())

	useEffect(() => {
		const timerId = setInterval(() => {
			setCurrentTime(new Date())
		}, 1000)

		return () => clearInterval(timerId)
	}, [])

	const formatTime = (date: Date, showSeconds: boolean = false) => {
		let hours = date.getHours()
		const minutes = date.getMinutes()
		const ampm = hours >= 12 ? "PM" : "AM"
		hours = hours % 12
		hours = hours ? hours : 12
		const h = hours < 10 ? `0${hours}` : hours
		const m = minutes < 10 ? `0${minutes}` : minutes
		const s = showSeconds
			? `:${String(date.getSeconds()).padStart(2, "0")}`
			: ""
		return `${h}:${m}${s} ${clockOnly ? "" : ampm}`
	}

	const formatDate = (date: Date) => {
		return date.toLocaleDateString(undefined, {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	}

	return (
		<div
			onClick={() => setClockOnly((val) => !val)}
			className={cn(
				"cursor-pointer select-none transition-opacity duration-500",
				clockOnly &&
					"flex flex-col justify-center items-center fixed inset-0 z-50",
			)}
			style={clockOnly ? { background: BG } : {}}
		>
			<h1
				className={cn(
					"font-light tracking-tight text-foreground",
					clockOnly ? "text-[min(18vw,8rem)]" : "text-7xl lg:text-8xl",
				)}
			>
				{formatTime(currentTime, clockOnly)}
			</h1>
			{!clockOnly && (
				<p className="mt-1 text-sm text-muted-foreground">
					{formatDate(currentTime)}
				</p>
			)}
		</div>
	)
}

export default Clock
