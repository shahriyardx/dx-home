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
		<div
			className={cn(
				"glass group cursor-pointer rounded-xl p-2.5",
				"grid grid-cols-[1.25rem_auto] gap-2.5",
				// Lifts toward the light on hover rather than changing colour: the
				// depth cue is what the whole system is built on.
				"transition-[transform,background-color,border-color] duration-200",
				"hover:-translate-y-0.5 hover:border-glass-border-lit hover:bg-glass-hover",
			)}
		>
			<div className="flex size-5 shrink-0 items-center justify-center rounded-md">
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
						"max-w-[20ch] truncate text-xs",
						read ? "text-white/35 line-through" : "text-white/85",
					)}
				>
					{title}
				</p>
				<p className="truncate text-[10px] text-white/40">
					{description || formatUrl(url)}
				</p>
			</a>
		</div>
	)
}
