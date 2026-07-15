import useRecentTabs from "@/features/recent-tabs/use-recent-tabs"
import { EmptyState, SectionHeader } from "@/shared/components/section-header"
import SingleTab from "./single-tab"
import { History } from "lucide-react"

const MAX_TABS = 10

const RecentTabs = ({ tabbed }: { tabbed?: boolean }) => {
	const { tabs } = useRecentTabs({ max: MAX_TABS })

	if (tabs.length === 0) {
		return <EmptyState>Your recently closed tabs will appear here</EmptyState>
	}

	return (
		<div>
			{!tabbed && <SectionHeader icon={History}>Recent Tabs</SectionHeader>}
			<div className="flex flex-wrap items-center gap-1.5">
				{tabs.map((tab) => (
					<SingleTab key={tab.id} tab={tab} />
				))}
			</div>
		</div>
	)
}

export default RecentTabs
