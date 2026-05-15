import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

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

interface LinkCardProps {
	icon: ReactNode
	title: string
	url: string
	description?: string
	read?: boolean
}

export function LinkCard({
	icon,
	title,
	url,
	description,
	read,
}: LinkCardProps) {
	return (
		<div
			className={cn(
				"bg-secondary/50 rounded-md p-2 border cursor-pointer transition-all",
				"grid grid-cols-[1.25rem_auto] gap-2",
				"hover:backdrop-blur-2xl hover:border-primary",
			)}
		>
			<div className="w-5 h-5 shrink-0 rounded-md flex items-center justify-center">
				{icon}
			</div>
			<a
				href={url}
				target="_blank"
				rel="noreferrer"
				className="min-w-0 flex-1"
				title={title}
			>
				<p
					className={cn(
						"text-xs max-w-[20ch] truncate",
						read
							? "text-muted-foreground/50 line-through"
							: "text-foreground/80",
					)}
				>
					{title}
				</p>
				<p className="text-[10px] text-muted-foreground truncate">
					{description || formatUrl(url)}
				</p>
			</a>
		</div>
	)
}
