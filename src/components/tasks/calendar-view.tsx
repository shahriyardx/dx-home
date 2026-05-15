import { useState, useMemo } from "react"
import { useTasksContext } from "@/contexts/tasks-context"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { ListTodo, Trash2 } from "lucide-react"

type Props = {
	onNavigate: (section: string) => void
}

const CalendarView = ({ onNavigate }: Props) => {
	const { tasks, deleteTask } = useTasksContext()
	const [selectedDate, setSelectedDate] = useState<Date | undefined>()

	const taskDates = useMemo(() => {
		const map = new Map<string, typeof tasks>()
		for (const task of tasks) {
			if (!task.deadline) continue
			const d = task.deadline
			const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
			if (!map.has(key)) map.set(key, [])
			map.get(key)!.push(task)
		}
		return map
	}, [tasks])

	const datesWithTasks = useMemo(
		() => [...taskDates.keys()].map((d) => new Date(d + "T00:00:00")),
		[taskDates],
	)

	const selectedKey = selectedDate
		? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
		: undefined

	const selectedTasks = selectedKey ? taskDates.get(selectedKey) || [] : []

	return (
		<div className="flex flex-col h-full pb-20">
			<div className="p-6 pb-4 shrink-0">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => onNavigate("tasks")}
						className="p-1 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
						title="Show Tasks"
					>
						<ListTodo size={20} />
					</button>
					<h1 className="text-lg font-semibold">Calendar</h1>
				</div>
			</div>

			<div className="space-y-4">
				<Calendar
					className="w-full bg-transparent border-t"
					modifiers={{ hasTask: datesWithTasks }}
					mode="single"
					selected={selectedDate}
					onSelect={(date) => setSelectedDate(date)}
					components={{
						DayButton: (props) => {
							const dot = props.modifiers?.hasTask
							return (
								<div className="relative w-full h-full flex">
									<CalendarDayButton {...props} />
									{dot && (
										<span className="absolute bottom-2 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
									)}
								</div>
							)
						},
					}}
				/>
				{selectedTasks.length > 0 && (
					<div className="space-y-2 pb-2 border-t p-6">
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							{selectedDate?.toLocaleDateString(undefined, {
								weekday: "short",
								month: "short",
								day: "numeric",
							})}
						</p>
						{selectedTasks.map((task) => (
							<div
								key={task.id}
								className="flex items-start gap-3 p-3 border-l-2 border-primary/30 bg-secondary/20 rounded-r-md group w-full"
							>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-foreground/80 whitespace-normal truncate">
										{task.title}
									</p>
									{task.deadline && (
										<p className="text-[10px] text-muted-foreground/60 mt-0.5">
											{task.deadline.toLocaleDateString(undefined, {
												month: "long",
												day: "numeric",
												year: "numeric",
												hour: "numeric",
												minute: "2-digit",
											})}
										</p>
									)}
								</div>
								<button
									type="button"
									onClick={() => deleteTask(task.id)}
									className="p-0.5 rounded opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-destructive transition-colors cursor-pointer shrink-0 mt-0.5"
								>
									<Trash2 className="size-3" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export default CalendarView
