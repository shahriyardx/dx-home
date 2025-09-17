import { useState, useEffect } from "react"

type Tab = {
	title: string
	url: string
	icon: string
}

const useRecentTabs = () => {
	const [tabs, setTabs] = useState<Array<Tab>>([])

	useEffect(() => {
		chrome.sessions.getRecentlyClosed({ maxResults: 10 }, (sessions) => {
			const recentTabs = sessions.reduce<Array<Tab>>((prev, curr) => {
				const prevTabs = prev
				const curTabs = curr.tab
					? [curr.tab]
					: curr.window
						? curr.window.tabs || []
						: []

				return [
					...prevTabs,
					...curTabs
						.filter((tab) => {
							if (
								tab.url === "about:blank" ||
								tab.url?.includes("chrome://") ||
								!tab.url ||
								tab.url.length < 1
							) {
								return false
							}

							return true
						})
						.map((tab) => ({
							title: tab.title ?? "",
							url: tab.url ?? "",
							icon: tab.favIconUrl ?? "",
						})),
				]
			}, [])

			const uniqueTabs = Array.from(
				new Map(recentTabs.map((tab) => [tab.url, tab])).values(),
			)
			setTabs(uniqueTabs)
		})
	}, [])

	return tabs
}

export default useRecentTabs
