import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ComponentProps } from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import { cn } from "@/shared/lib/utils"
import { buttonClass } from "./button"

const rdp = getDefaultClassNames()

/**
 * react-day-picker, styled. Keys must match v10's names exactly — an unknown
 * key (e.g. the old `table`) fails silently and its styles never apply.
 */
export function Calendar({
	className,
	classNames,
	...props
}: ComponentProps<typeof DayPicker>) {
	return (
		<DayPicker
			showOutsideDays
			className={cn("p-3 text-fg [--cell:2.5rem]", className)}
			classNames={{
				months: "relative flex flex-col",
				month: "flex flex-col gap-3",
				nav: "absolute inset-x-0 top-0 flex justify-between",
				button_previous: cn(
					buttonClass("ghost", "icon-sm"),
					"disabled:opacity-30",
				),
				button_next: cn(buttonClass("ghost", "icon-sm"), "disabled:opacity-30"),
				month_caption: "flex h-8 items-center justify-center",
				caption_label: "text-sm font-bold tracking-tight",
				month_grid: "w-full border-collapse",
				weekdays: "flex",
				weekday: "flex-1 text-xs font-semibold text-muted",
				week: "mt-1 flex w-full",
				day: cn("relative flex flex-1 justify-center p-0", rdp.day),
				day_button:
					"pressable flex size-(--cell) items-center justify-center rounded-[1.25rem] text-sm font-medium hover:bg-field-hover",
				// Not when selected: both set the text colour at equal specificity, so
				// today's primary text landed on the selected primary fill.
				today:
					"[&:not([data-selected])>button]:text-primary [&>button]:font-bold",
				selected:
					"[&>button]:bg-primary [&>button]:text-on-primary [&>button]:hover:bg-primary",
				outside: "text-muted/50",
				disabled: "opacity-40",
				hidden: "invisible",
				...classNames,
			}}
			components={{
				Chevron: ({ orientation }) =>
					orientation === "left" ? <ChevronLeft /> : <ChevronRight />,
			}}
			{...props}
		/>
	)
}
