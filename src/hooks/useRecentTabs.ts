import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"

const useRecentTabs = () => {
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
	).slice(0, 10)

	return { tabs: uniqueTabs }
}

export default useRecentTabs
