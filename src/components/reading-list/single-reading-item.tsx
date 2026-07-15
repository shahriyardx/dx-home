import type { ReadingItem } from "@/lib/db"
import { Check } from "lucide-react"
import { Favicon } from "@/components/favicon"
import { LinkCard } from "@/components/link-card"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"

type Props = {
	item: ReadingItem
	onDelete: (id: number) => void
	onToggleRead: (id: number) => void
}

const SingleReadingItem = ({ item, onDelete, onToggleRead }: Props) => {
	return (
		<ContextMenu key={item.id}>
			<ContextMenuTrigger>
				<LinkCard
					icon={
						item.read ? (
							<div className="size-5 shrink-0 rounded flex items-center justify-center bg-primary/10 text-primary">
								<Check className="size-3" />
							</div>
						) : item.icon ? (
							<img src={item.icon} alt="" className="size-5 shrink-0 rounded" />
						) : (
							<Favicon
								url={item.url}
								size={20}
								className="size-5 shrink-0 rounded"
							/>
						)
					}
					title={item.title}
					url={item.url}
					read={item.read}
				/>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onMouseDown={() => onToggleRead(item.id)}>
					Mark as {item.read ? "unread" : "read"}
				</ContextMenuItem>
				<ContextMenuItem
					variant="destructive"
					onMouseDown={() => onDelete(item.id)}
				>
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}

export default SingleReadingItem
