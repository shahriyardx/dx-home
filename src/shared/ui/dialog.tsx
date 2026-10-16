import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

export const Dialog = BaseDialog.Root
export const DialogTrigger = BaseDialog.Trigger
export const DialogClose = BaseDialog.Close

export function DialogContent({
	title,
	children,
	className,
}: {
	title: ReactNode
	children: ReactNode
	className?: string
}) {
	return (
		<BaseDialog.Portal>
			<BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
			<BaseDialog.Popup
				className={cn(
					"elevated fixed top-1/2 left-1/2 z-50 flex w-[min(28rem,calc(100vw-2rem))] -translate-1/2 flex-col gap-5",
					"rounded-sheet bg-overlay p-6 text-sm text-fg outline-none",
					"transition-[scale,opacity] duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
					className,
				)}
			>
				<BaseDialog.Title className="text-xl font-bold tracking-tight">
					{title}
				</BaseDialog.Title>
				{children}
			</BaseDialog.Popup>
		</BaseDialog.Portal>
	)
}

export function DialogFooter({ children }: { children: ReactNode }) {
	return <div className="flex justify-end gap-2 pt-1">{children}</div>
}
