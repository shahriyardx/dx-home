import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

/**
 * Segmented control. A tonal pill slides under the active tab. Renders only
 * the strip: callers show their own content for `value`.
 */
export function SegmentedTabs<T extends string>({
	value,
	onChange,
	items,
	className,
}: {
	value: T
	onChange: (value: T) => void
	items: { value: T; label: ReactNode; icon?: ReactNode }[]
	className?: string
}) {
	return (
		<BaseTabs.Root value={value} onValueChange={(v) => onChange(v as T)}>
			<BaseTabs.List
				className={cn(
					"relative z-0 flex w-max gap-1 rounded-[1.125rem] bg-field p-1",
					className,
				)}
			>
				{items.map((item) => (
					<BaseTabs.Tab
						key={item.value}
						value={item.value}
						className="pressable flex h-7 items-center gap-1.5 rounded-[0.875rem] px-3 text-[13px] font-semibold text-muted transition-colors outline-none hover:text-fg data-active:text-on-tonal [&_svg]:size-3.5"
					>
						{item.icon}
						{item.label}
					</BaseTabs.Tab>
				))}
				<BaseTabs.Indicator className="absolute top-1 left-0 -z-10 h-7 w-(--active-tab-width) translate-x-(--active-tab-left) rounded-[0.875rem] bg-tonal transition-[translate,width] duration-300" />
			</BaseTabs.List>
		</BaseTabs.Root>
	)
}
