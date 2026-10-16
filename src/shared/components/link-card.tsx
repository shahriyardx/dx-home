import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

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
		<a
			href={url}
			target="_blank"
			rel="noreferrer"
			title={title}
			className="pressable flex items-center gap-3 rounded-[1.25rem] bg-surface py-2.5 pr-4 pl-3 hover:bg-surface-hover"
		>
			<span className="flex size-8 shrink-0 items-center justify-center rounded-[0.75rem] bg-field">
				{icon}
			</span>
			<span className="min-w-0">
				<span
					className={cn(
						"block max-w-[22ch] truncate text-[13px] font-semibold",
						read ? "text-muted line-through" : "text-fg",
					)}
				>
					{title}
				</span>
				<span className="block truncate text-xs text-muted">
					{description || formatUrl(url)}
				</span>
			</span>
		</a>
	)
}
