import { format } from "date-fns"
import { ChevronLeft, ChevronRight, ListTodo } from "lucide-react"
import { useMemo, useState } from "react"
import type { RightPanelSection } from "@/entrypoints/newtab/right-panel-context"
import { addDays, sameDay } from "@/features/tasks/lib/deadline"
import { dateKey, monthGrid } from "@/features/tasks/lib/view"
import { type Task, useTasksContext } from "@/features/tasks/tasks-context"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { useNow } from "@/features/tasks/use-now"
import SingleTask from "./single-task"

type Props = {
	onNavigate: (section: RightPanelSection) => void
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

/** Busier days get a stronger tone, so the month reads at a glance. */
const LOAD = ["bg-field", "bg-tonal/55", "bg-tonal/80", "bg-tonal"]

const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)

const CalendarView = ({ onNavigate }: Props) => {
	const { tasks } = useTasksContext()
	const now = useNow()
	const [month, setMonth] = useState(() => firstOfMonth(new Date()))
	const [selected, setSelected] = useState<Date>()

	// Open tasks by local day. Done ones do not make a day look busy.
	const byDay = useMemo(() => {
		const map = new Map<string, Task[]>()
		for (const task of tasks) {
			if (!task.deadline || task.done) continue
			const key = dateKey(task.deadline)
			map.set(key, [...(map.get(key) ?? []), task])
		}
		return map
	}, [tasks])

	// Rolling, not calendar-week: on a Sunday "this week" would be one day.
	const today = addDays(now, 0)
	const horizon = addDays(today, 7)
	const listed = selected
		? tasks.filter((t) => sameDay(t.deadline, selected))
		: tasks.filter(
				(t) =>
					!t.done && t.deadline && t.deadline >= today && t.deadline < horizon,
			)

	const shiftMonth = (by: number) =>
		setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1))

	return (
		<div className="flex flex-col p-5 pb-20">
			<div className="mb-3 flex items-center gap-1">
				<h1 className="flex-1 ps-1 text-2xl font-bold tracking-tight">
					{format(month, "MMMM yyyy")}
				</h1>
				<Button
					size="sm"
					onClick={() => {
						setMonth(firstOfMonth(now))
						setSelected(undefined)
					}}
				>
					Today
				</Button>
				<Button
					size="icon-sm"
					title="Previous month"
					onClick={() => shiftMonth(-1)}
				>
					<ChevronLeft />
				</Button>
				<Button size="icon-sm" title="Next month" onClick={() => shiftMonth(1)}>
					<ChevronRight />
				</Button>
				<Button
					variant="neutral"
					size="icon"
					title="Tasks"
					className="ms-1"
					onClick={() => onNavigate("tasks")}
				>
					<ListTodo />
				</Button>
			</div>

			{/* Keyed by month so paging plays the arrival animation. */}
			<div key={month.getTime()} className="pop-in grid grid-cols-7 gap-1">
				{WEEKDAYS.map((d, i) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed list with repeated letters.
						key={i}
						className="pb-1 text-center text-[11px] font-bold text-muted"
					>
						{d}
					</span>
				))}

				{monthGrid(month).map((day) => {
					const inMonth = day.getMonth() === month.getMonth()
					const count = byDay.get(dateKey(day))?.length ?? 0
					const isToday = sameDay(day, now)
					const isSelected = sameDay(selected, day)
					return (
						<button
							type="button"
							key={dateKey(day)}
							onClick={() => setSelected(isSelected ? undefined : day)}
							aria-pressed={isSelected}
							aria-label={`${format(day, "EEEE, MMMM d")}${count ? `, ${count} tasks` : ""}`}
							className={cn(
								"pressable flex h-12 flex-col justify-between rounded-[0.875rem] p-1.5 text-left text-[13px] font-semibold outline-offset-2 transition-[background-color,color,outline-color] duration-200",
								isToday
									? "bg-primary text-on-primary"
									: inMonth
										? LOAD[Math.min(count, 3)]
										: "text-muted/50",
								isSelected
									? "outline-2 outline-primary"
									: "outline-2 outline-transparent",
							)}
						>
							<span className="ps-0.5">{day.getDate()}</span>
							{count > 0 && (
								<span
									className={cn(
										"self-end rounded-[0.4375rem] px-1.5 text-[11px] font-extrabold tabular-nums",
										isToday
											? "bg-on-primary text-primary"
											: "bg-surface text-fg",
									)}
								>
									{count}
								</span>
							)}
						</button>
					)
				})}
			</div>

			<h2 className="mt-5 mb-2 ps-1.5 text-[13px] font-bold text-muted">
				{selected ? format(selected, "EEEE, MMM d") : "Next 7 days"}
			</h2>
			<div key={selected?.getTime()} className="pop-in flex flex-col gap-1.5">
				{listed.length === 0 ? (
					<p className="ps-1.5 text-sm text-muted">Nothing planned.</p>
				) : (
					listed.map((task) => (
						<SingleTask key={task.id} task={task} now={now} />
					))
				)}
			</div>
		</div>
	)
}

export default CalendarView
