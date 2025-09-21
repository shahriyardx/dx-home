import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"

const useRecentTabs = ({ max }: { max: number } = { max: 10 }) => {
	const tabs =
		useLiveQuery(() => db.recenttabs.orderBy("id").reverse().toArray()) || []
	const filteredTabs = tabs.filter(
		(tab) =>
			tab.url &&
			tab.url.length > 1 &&
			!tab.url.startsWith("about:") &&
			!tab.url.startsWith("chrome://") &&
			!tab.url.startsWith("view-source:") &&
			!tab.title.startsWith("https://") &&
			!tab.title.startsWith("http://"),
	)
	const uniqueTabs = Array.from(
		new Map(filteredTabs.map((tab) => [tab.url, tab])).values(),
	)

	const deleteTab = (id: number) => {
		db.recenttabs.delete(id)
	}

	return {
		tabs: uniqueTabs.slice(0, max),
		hasMore: uniqueTabs.length > max,
		allTabs: uniqueTabs,
		deleteTab,
	}
}

export default useRecentTabs
