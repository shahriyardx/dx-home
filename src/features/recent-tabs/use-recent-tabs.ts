import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/shared/storage/db"

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

	// The list is deduped by url above, so one visible row can stand for several
	// records. Deleting only `id` would leave the rest and the entry would
	// reappear as the next duplicate surfaced.
	const deleteTab = async (id: number) => {
		const tab = await db.recenttabs.get(id)
		if (!tab) return
		await db.recenttabs.where("url").equals(tab.url).delete()
	}

	return {
		tabs: uniqueTabs.slice(0, max),
		hasMore: uniqueTabs.length > max,
		allTabs: uniqueTabs,
		deleteTab,
	}
}

export default useRecentTabs
