import useRecentTabs from "@/hooks/useRecentTabs"
import SingleTab from "./single-tab"

const MAX_TABS = 10

const RecentTabs = () => {
	const { tabs } = useRecentTabs({ max: MAX_TABS })

	return (
		<>
			{tabs.length > 0 && (
				<div>
					<p className="font-medium text-muted-foreground uppercase tracking-wider mb-2">
						Recent Tabs
					</p>
					<div className="grid grid-cols-1 md:flex items-center gap-1.5 flex-wrap">
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
