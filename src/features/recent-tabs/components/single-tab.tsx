import type { ClosedTab } from "@/shared/storage/db"
import { Favicon } from "@/shared/components/favicon"
import { LinkCard } from "@/shared/components/link-card"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/shared/ui/context-menu"
import useRecentTabs from "@/features/recent-tabs/use-recent-tabs"

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
							className="size-5 shrink-0 rounded-md object-cover"
						/>
					}
					title={tab.title}
					url={tab.url}
				/>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem danger onClick={() => deleteTab(tab.id)}>
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}

export default SingleTab
