import type { LucideIcon } from "lucide-react"

/** Section label on the wallpaper. Small and semibold; it never competes with the clock. */
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
			<Icon className="on-wallpaper size-4 shrink-0 text-white" />
			<h3 className="on-wallpaper text-[13px] font-semibold text-white">
				{children}
			</h3>
			{action ? <div className="ml-auto">{action}</div> : null}
		</div>
	)
}

/** Text on bare wallpaper carries its own shadow; at low alpha it vanishes on a bright photo. */
export function EmptyState({ children }: { children: React.ReactNode }) {
	return (
		<p className="on-wallpaper py-1 text-sm font-medium text-white">
			{children}
		</p>
	)
}
