import * as Panels from "react-resizable-panels"
import { cn } from "@/shared/lib/utils"

export function ResizablePanelGroup({
	className,
	...props
}: Panels.GroupProps) {
	return <Panels.Group className={cn("flex size-full", className)} {...props} />
}

export const ResizablePanel = Panels.Panel

/** A wide, invisible hit area with a small grip that shows on hover. */
export function ResizableHandle(props: Panels.SeparatorProps) {
	return (
		<Panels.Separator
			className="group relative flex w-3 items-center justify-center outline-none"
			{...props}
		>
			<div className="h-12 w-1 rounded-full bg-fg/0 transition-colors group-hover:bg-fg/40 group-focus-visible:bg-primary group-data-[separator=active]:bg-primary" />
		</Panels.Separator>
	)
}
