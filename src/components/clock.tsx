import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const Clock = () => {
	const [clockOnly, setClockOnly] = useState(false)
	const settings = useSettings()
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
		const hoursFormatted = hours < 10 ? `0${hours}` : hours
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
		const seconds = showSeconds ? `:${date.getSeconds()}` : ""
		return `${hoursFormatted}:${formattedMinutes}${seconds} ${clockOnly ? "" : ampm}`
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
				"cursor-pointer select-none",
				clockOnly &&
					"flex flex-col justify-center items-center fixed top-0 left-0 w-full h-screen",
			)}
			style={clockOnly ? { background: settings.background } : {}}
		>
			<h1 className={cn("text-9xl font-bold", clockOnly && "text-[10rem]")}>
				{formatTime(currentTime, clockOnly)}
			</h1>
			{!clockOnly && (
				<h2 className="text-lg text-primary/50 font-semibold">
					{formatDate(currentTime)}
				</h2>
			)}
		</div>
	)
}

export default Clock
