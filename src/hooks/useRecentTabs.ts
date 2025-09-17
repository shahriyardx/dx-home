import type { Tab } from "@/entrypoints/background"
import { useState, useEffect } from "react"

const useRecentTabs = () => {
	const [tabs, setTabs] = useState<Array<Tab>>([])

	useEffect(() => {
		chrome.runtime.sendMessage({ type: "getRecentlyClosed" }, (sessions) => {
			setTabs(sessions)
		})
	}, [])

	return tabs
}

export default useRecentTabs
