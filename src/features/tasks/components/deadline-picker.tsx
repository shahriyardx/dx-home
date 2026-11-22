import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { type ReactNode, useState } from "react"
import { useNewtabSettings } from "@/features/settings"
import {
	addDays,
	defaultTime,
	sameDay,
	withDate,
	withTime,
} from "@/features/tasks/lib/deadline"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { TimeDial } from "./time-dial"

/**
 * Date and time are two chips over one `Date`. Picking a date keeps the time
 * (or uses the next full hour); picking a time with no date means today.
 */
type Props = {
	value: Date | undefined
	onChange: (value: Date | undefined) => void
}

const QUICK = [
	{ label: "Today", days: 0 },
	{ label: "Tomorrow", days: 1 },
	{ label: "Next week", days: 7 },
]

const chipClass = (on: boolean) =>
	cn(
		"pressable flex h-8 items-center gap-1.5 rounded-[0.75rem] px-3 text-[13px] font-semibold transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
		on ? "bg-tonal text-on-tonal" : "bg-surface text-muted hover:text-fg",
	)

function Chip({
	on,
	open,
	onOpenChange,
	label,
	children,
	width,
}: {
	on: boolean
	open: boolean
	onOpenChange: (open: boolean) => void
	label: ReactNode
	children: ReactNode
	width: string
}) {
	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger className={chipClass(on)}>{label}</PopoverTrigger>
			{/* One tone up from what it opens over, so it reads as on top. */}
			<PopoverContent className={cn("bg-field p-3", width)}>
				{children}
			</PopoverContent>
		</Popover>
	)
}

export function DateChip({ value, onChange }: Props) {
	const [open, setOpen] = useState(false)
	const now = new Date()
	const today = addDays(now, 0)

	const label = !value
		? "Date"
		: sameDay(value, today)
			? "Today"
			: sameDay(value, addDays(today, 1))
				? "Tomorrow"
				: format(value, "EEE, MMM d")

	const pick = (day: Date) => {
		onChange(withDate(day, value, now))
		setOpen(false)
	}

	return (
		<Chip
			on={!!value}
			open={open}
			onOpenChange={setOpen}
			width="w-80"
			label={
				<>
					<CalendarIcon />
					{label}
				</>
			}
		>
			<div className="flex gap-1.5">
				{QUICK.map((q) => {
					const day = addDays(today, q.days)
					return (
						<button
							type="button"
							key={q.label}
							onClick={() => pick(day)}
							className={cn(
								"pressable h-8 flex-1 rounded-[1rem] text-[13px] font-semibold",
								sameDay(value, day)
									? "bg-tonal text-on-tonal"
									: "bg-field-hover text-fg hover:bg-field-hover/70",
							)}
						>
							{q.label}
						</button>
					)
				})}
			</div>

			<Calendar
				className="-mx-3 [--cell:2.375rem]"
				mode="single"
				selected={value}
				defaultMonth={value}
				onSelect={(day) => day && pick(day)}
				classNames={{
					day_button:
						"pressable flex size-(--cell) items-center justify-center rounded-[1.1875rem] text-sm font-medium hover:bg-field-hover",
				}}
			/>

			<Button
				variant="ghost"
				size="sm"
				disabled={!value}
				onClick={() => {
					onChange(undefined)
					setOpen(false)
				}}
			>
				Clear
			</Button>
		</Chip>
	)
}

export function TimeChip({ value, onChange }: Props) {
	const { settings } = useNewtabSettings()
	const use24h = settings.clock24h
	const [open, setOpen] = useState(false)
	const [draft, setDraft] = useState(() => defaultTime(new Date()))

	const openChange = (next: boolean) => {
		// Start from the saved time, or the next full hour.
		if (next)
			setDraft(
				value
					? { h: value.getHours(), m: value.getMinutes() }
					: defaultTime(new Date()),
			)
		setOpen(next)
	}

	const save = () => {
		const pad = (n: number) => String(n).padStart(2, "0")
		onChange(withTime(value, `${pad(draft.h)}:${pad(draft.m)}`, new Date()))
		setOpen(false)
	}

	return (
		<Chip
			on={!!value}
			open={open}
			onOpenChange={openChange}
			width="w-auto"
			label={
				<>
					<Clock />
					{value ? format(value, use24h ? "HH:mm" : "h:mm a") : "Time"}
				</>
			}
		>
			<TimeDial value={draft} onChange={setDraft} use24h={use24h} />
			<div className="mt-3 flex justify-end gap-1">
				<Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
					Cancel
				</Button>
				<Button variant="primary" size="sm" onClick={save}>
					OK
				</Button>
			</div>
		</Chip>
	)
}
