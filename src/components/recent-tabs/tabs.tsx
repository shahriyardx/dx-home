import useRecentTabs from "@/hooks/useRecentTabs"
import SingleTab from "./single-tab"
import TabsDialog from "./tabs-dialog"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "../ui/context-menu"
import { Trash2Icon } from "lucide-react"

const RecentTabs = () => {
	const { tabs, deleteTab } = useRecentTabs({ max: 2 })

	return (
		<>
			{tabs.length > 0 && (
				<div>
					<h1 className="text-lg font-bold">Recent Tabs</h1>
					<div className="mt-2 flex items-center gap-2 flex-wrap">
						{tabs.map((tab) => (
							<ContextMenu key={tab.id}>
								<ContextMenuTrigger>
									<SingleTab key={tab.id} tab={tab} />
								</ContextMenuTrigger>
								<ContextMenuContent>
									<ContextMenuItem onClick={() => deleteTab(tab.id)}>
										<Trash2Icon /> Delete
									</ContextMenuItem>
								</ContextMenuContent>
							</ContextMenu>
						))}

						<TabsDialog />
					</div>
				</div>
			)}
		</>
	)
}

export default RecentTabs
