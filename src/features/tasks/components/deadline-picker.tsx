import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { useState } from "react"
import {
	addDays,
	sameDay,
	toTimeValue,
	withDate,
	withTime,
} from "@/features/tasks/lib/deadline"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { fieldClass } from "@/shared/ui/text-field"

const QUICK = [
	{ label: "Today", days: 0 },
	{ label: "Tomorrow", days: 1 },
	{ label: "Next week", days: 7 },
]

export function DeadlinePicker({
	value,
	onChange,
}: {
	value: Date | undefined
	onChange: (value: Date | undefined) => void
}) {
	const [open, setOpen] = useState(false)
	const now = new Date()
	const today = addDays(now, 0)

	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-[13px] font-semibold text-muted">Deadline</span>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					className={cn(
						fieldClass,
						"flex h-11 items-center gap-2.5 text-left",
						!value && "text-muted",
					)}
				>
					<CalendarIcon className="size-4 shrink-0 text-muted" />
					{value ? format(value, "EEE, MMM d · h:mm a") : "No deadline"}
				</PopoverTrigger>

				{/* One tone up from the dialog, so it reads as on top of it. */}
				<PopoverContent className="w-80 bg-field p-3">
					<div className="flex gap-1.5">
						{QUICK.map((q) => {
							const day = addDays(today, q.days)
							const active = sameDay(value, day)
							return (
								<button
									type="button"
									key={q.label}
									onClick={() => onChange(withDate(day, value, now))}
									className={cn(
										"pressable h-8 flex-1 rounded-[1rem] text-[13px] font-semibold",
										active
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
						onSelect={(day) => day && onChange(withDate(day, value, now))}
						classNames={{
							day_button:
								"pressable flex size-(--cell) items-center justify-center rounded-[1.1875rem] text-sm font-medium hover:bg-field-hover",
						}}
					/>

					<label className="flex h-11 items-center gap-2.5 rounded-field bg-field-hover px-3.5">
						<Clock className="size-4 shrink-0 text-muted" />
						<span className="flex-1 text-sm font-semibold">Time</span>
						{/* Native: typing, arrow keys and the locale's 12/24h come free. */}
						<input
							type="time"
							step={300}
							value={toTimeValue(value)}
							onChange={(e) => onChange(withTime(value, e.target.value, now))}
							className="bg-transparent text-right text-sm font-semibold tabular-nums text-fg outline-none [&::-webkit-calendar-picker-indicator]:hidden"
						/>
					</label>

					<div className="mt-3 flex justify-between">
						<Button
							variant="ghost"
							size="sm"
							disabled={!value}
							onClick={() => onChange(undefined)}
						>
							Clear
						</Button>
						<Button variant="primary" size="sm" onClick={() => setOpen(false)}>
							Done
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
