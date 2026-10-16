import { ContextMenu as BaseMenu } from "@base-ui/react/context-menu"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

export const ContextMenu = BaseMenu.Root
export const ContextMenuTrigger = BaseMenu.Trigger

export function ContextMenuContent({ children }: { children: ReactNode }) {
	return (
		<BaseMenu.Portal>
			<BaseMenu.Positioner className="z-50 outline-none">
				<BaseMenu.Popup className="elevated min-w-40 origin-(--transform-origin) rounded-menu bg-overlay p-1.5 text-sm text-fg outline-none transition-[scale,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
					{children}
				</BaseMenu.Popup>
			</BaseMenu.Positioner>
		</BaseMenu.Portal>
	)
}

export function ContextMenuItem({
	danger,
	className,
	...props
}: ComponentProps<typeof BaseMenu.Item> & {
	danger?: boolean
	className?: string
}) {
	return (
		<BaseMenu.Item
			className={cn(
				"flex h-9 items-center rounded-field px-3 font-medium outline-none select-none",
				"data-highlighted:bg-field",
				danger && "text-danger",
				className,
			)}
			{...props}
		/>
	)
}
