import type { ReadingItem } from "@/shared/storage/db"
import { Check } from "lucide-react"
import { Favicon } from "@/shared/components/favicon"
import { LinkCard } from "@/shared/components/link-card"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/shared/ui/context-menu"

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
							<div className="flex size-5 shrink-0 items-center justify-center text-primary">
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
				<ContextMenuItem onClick={() => onToggleRead(item.id)}>
					Mark as {item.read ? "unread" : "read"}
				</ContextMenuItem>
				<ContextMenuItem danger onClick={() => onDelete(item.id)}>
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}

export default SingleReadingItem
