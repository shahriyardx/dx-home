import type { ClosedTab } from "@/lib/db"
import { cn, urlToFavicon } from "@/lib/utils"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"

function formatUrl(url: string): string {
	try {
		const parsed = new URL(url)
		const hasExtra =
			parsed.pathname !== "/" || parsed.search !== "" || parsed.hash !== ""
		return hasExtra ? `${parsed.hostname}/...` : parsed.hostname
	} catch {
		return url
	}
}

type Props = {
	tab: ClosedTab
}

const SingleTab = ({ tab }: Props) => {
	const { deleteTab } = useRecentTabs({ max: 1 })

	return (
		<ContextMenu key={tab.id}>
			<ContextMenuTrigger>
				<div
					className={cn(
						"bg-secondary/50 rounded-md p-2 border",
						"grid grid-cols-[1.25rem_auto] gap-2",
					)}
				>
					<img
						src={urlToFavicon(tab.url)}
						alt=""
						className="w-5 h-5 object-cover shrink-0 rounded-md"
					/>

					<a
						href={tab.url}
						target="_blank"
						className="min-w-0 flex-1"
						title={tab.title}
					>
						<p className="text-xs text-foreground/80 max-w-[20ch] truncate">
							{tab.title}
						</p>
						<p className="text-[10px] text-muted-foreground">
							{formatUrl(tab.url)}
						</p>
					</a>
				</div>
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
