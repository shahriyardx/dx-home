import type { ClosedTab } from "@/lib/db"
import { Favicon } from "@/components/favicon"
import { LinkCard } from "@/components/link-card"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"
import useRecentTabs from "@/hooks/use-recent-tabs"

type Props = {
	tab: ClosedTab
}

const SingleTab = ({ tab }: Props) => {
	const { deleteTab } = useRecentTabs({ max: 1 })

	return (
		<ContextMenu key={tab.id}>
			<ContextMenuTrigger>
				<LinkCard
					icon={
						<Favicon
							url={tab.url}
							size={20}
							className="w-5 h-5 object-cover shrink-0 rounded-md"
						/>
					}
					title={tab.title}
					url={tab.url}
				/>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem
					variant="destructive"
					onMouseDown={() => deleteTab(tab.id)}
				>
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}

export default SingleTab
