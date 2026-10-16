import { ScrollArea as BaseScroll } from "@base-ui/react/scroll-area"
import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

const bar =
	"flex rounded-full p-0.5 opacity-0 transition-opacity data-hovering:opacity-100 data-scrolling:opacity-100 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:h-2"

/** Thin overlay scrollbars that show only while hovering or scrolling. */
export function ScrollArea({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<BaseScroll.Root className={cn("relative overflow-hidden", className)}>
			<BaseScroll.Viewport className="size-full overscroll-contain outline-none">
				{children}
			</BaseScroll.Viewport>
			<BaseScroll.Scrollbar orientation="vertical" className={bar}>
				<BaseScroll.Thumb className="w-full rounded-full bg-field-hover" />
			</BaseScroll.Scrollbar>
			<BaseScroll.Scrollbar orientation="horizontal" className={bar}>
				<BaseScroll.Thumb className="h-full rounded-full bg-field-hover" />
			</BaseScroll.Scrollbar>
		</BaseScroll.Root>
	)
}
