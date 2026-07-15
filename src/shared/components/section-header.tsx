import type { LucideIcon } from "lucide-react"

/**
 * The one label style on the newtab. Wide letter-spacing at a small size reads
 * as a quiet system label rather than as content — it should recede behind the
 * clock and the wallpaper, never compete with them.
 */
export function SectionHeader({
	icon: Icon,
	children,
	action,
}: {
	icon: LucideIcon
	children: React.ReactNode
	action?: React.ReactNode
}) {
	return (
		<div className="mb-3 flex items-center gap-2">
			<Icon className="on-wallpaper size-3 shrink-0 text-white/50" />
			<h3 className="on-wallpaper text-[10px] font-semibold tracking-[0.2em] text-white/55 uppercase">
				{children}
			</h3>
			{action ? <div className="ml-auto">{action}</div> : null}
		</div>
	)
}

/**
 * Restrained, but never below legible. These sit directly on the wallpaper with
 * no panel to tint it, so they carry their own shadow — at white/30 over a
 * bright photo this text simply disappeared.
 */
export function EmptyState({ children }: { children: React.ReactNode }) {
	return <p className="on-wallpaper py-1 text-xs text-white/50">{children}</p>
}
