import React, { useState, useEffect } from "react"

const Clock = () => {
	const [currentTime, setCurrentTime] = useState(new Date())

	useEffect(() => {
		const timerId = setInterval(() => {
			setCurrentTime(new Date())
		}, 1000)

		return () => clearInterval(timerId)
	}, [])

	const formatTime = (date: Date) => {
		let hours = date.getHours()
		const minutes = date.getMinutes()
		const ampm = hours >= 12 ? "PM" : "AM"
		hours = hours % 12
		hours = hours ? hours : 12
		const hoursFormatted = hours < 10 ? `0${hours}` : hours
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
		return `${hoursFormatted}:${formattedMinutes} ${ampm}`
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
		<div>
			<h1 className="text-9xl font-bold">{formatTime(currentTime)}</h1>
			<h2 className="text-lg text-gray-500 font-semibold">
				{formatDate(currentTime)}
			</h2>
		</div>
	)
}

export default Clock
