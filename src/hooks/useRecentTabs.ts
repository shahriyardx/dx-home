import { useState, useEffect } from "react"
import type { Tab } from "@/entrypoints/background"

const useRecentTabs = () => {
	const [tabs, setTabs] = useState<Tab[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		setTimeout(() => {
			chrome.runtime.sendMessage({ type: "getRecentlyClosed" }, (sessions) => {
				if (chrome.runtime.lastError) {
					console.error(
						"Error getting recently closed tabs:",
						chrome.runtime.lastError.message,
					)
					setLoading(false)
					return
				}

				if (Array.isArray(sessions)) {
					setTabs(sessions)
				} else {
					console.error(
						"Received invalid response from background script:",
						sessions,
					)
					setTabs([])
				}
				setLoading(false)
			})
		}, 500)
	}, [])

	return { tabs, loading }
}

export default useRecentTabs
