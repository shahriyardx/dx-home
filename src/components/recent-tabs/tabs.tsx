import useRecentTabs from "@/hooks/useRecentTabs"
import SingleTab from "./single-tab"
import { History } from "lucide-react"

const MAX_TABS = 10

const RecentTabs = () => {
	const { tabs } = useRecentTabs({ max: MAX_TABS })

	return (
		<>
			{tabs.length > 0 && (
				<div>
					<div className="flex items-center gap-2 mb-2">
						<History className="size-3.5 text-muted-foreground" />
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Recent Tabs
						</p>
					</div>
					<div className="flex items-center gap-1.5 flex-wrap">
						{tabs.map((tab) => (
							<SingleTab key={tab.id} tab={tab} />
						))}
					</div>
				</div>
			)}
		</>
	)
}

export default RecentTabs
