import useRecentTabs from "@/hooks/useRecentTabs"
import { ExternalLink, Trash } from "lucide-react"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { DialogClose } from "@radix-ui/react-dialog"
import { Button } from "../ui/button"

const TabsDialog = () => {
	const { hasMore, allTabs, deleteTab } = useRecentTabs({ max: 2 })
	return (
		<Dialog>
			{hasMore && (
				<DialogTrigger asChild>
					<button
						type="button"
						className={cn(
							"flex items-center gap-2 p-3 rounded-md cursor-pointer",
							"border hover:border-primary/50 transition-all",
						)}
					>
						Show More
					</button>
				</DialogTrigger>
			)}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>All Recently Closed Tabs</DialogTitle>

					<ScrollArea className="h-75">
						<div className="space-y-2">
							{allTabs.map((tab) => (
								<div
									key={tab.id}
									className="grid grid-cols-[20px_auto_50px] gap-2"
								>
									{tab.icon && (
										<img
											src={tab.icon}
											alt={tab.title}
											className="w-5 h-5 object-cover"
										/>
									)}

									<div className="w-full truncate" title={tab.title}>
										{tab.title}
									</div>

									<div className="flex gap-1 items-center flex-shrink-0">
										<Trash
											size={15}
											className="ml-2 cursor-pointer"
											onClick={() => deleteTab(tab.id)}
										/>

										<DialogClose asChild>
											<ExternalLink
												size={15}
												className="ml-2 cursor-pointer"
												onClick={() => window.open(tab.url)}
											/>
										</DialogClose>
									</div>
								</div>
							))}
						</div>
						<ScrollBar />
					</ScrollArea>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button>Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default TabsDialog
