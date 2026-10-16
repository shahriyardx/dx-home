import { Popover as BasePopover } from "@base-ui/react/popover"
import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

export const Popover = BasePopover.Root
export const PopoverTrigger = BasePopover.Trigger

export function PopoverContent({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<BasePopover.Portal>
			<BasePopover.Positioner sideOffset={8} className="z-50">
				<BasePopover.Popup
					className={cn(
						"elevated origin-(--transform-origin) rounded-menu bg-overlay text-fg outline-none",
						"transition-[scale,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
						className,
					)}
				>
					{children}
				</BasePopover.Popup>
			</BasePopover.Positioner>
		</BasePopover.Portal>
	)
}
