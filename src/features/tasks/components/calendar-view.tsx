import type { RightPanelSection } from "@/entrypoints/newtab/right-panel-context"
import { useState, useMemo } from "react"
import { useTasksContext } from "@/features/tasks/tasks-context"
import { ListTodo, Trash2 } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"

type Props = {
	onNavigate: (section: RightPanelSection) => void
}

/** Local YYYY-MM-DD. Not toISOString(), which would shift the day across UTC. */
function dateKey(d: Date) {
	const month = String(d.getMonth() + 1).padStart(2, "0")
	const day = String(d.getDate()).padStart(2, "0")
	return `${d.getFullYear()}-${month}-${day}`
}

const CalendarView = ({ onNavigate }: Props) => {
	const { tasks, deleteTask } = useTasksContext()
	const [selectedDate, setSelectedDate] = useState<Date | undefined>()

	const taskDates = useMemo(() => {
		const map = new Map<string, typeof tasks>()
		for (const task of tasks) {
			if (!task.deadline) continue
			const key = dateKey(task.deadline)
			const existing = map.get(key)
			if (existing) existing.push(task)
			else map.set(key, [task])
		}
		return map
	}, [tasks])

	const datesWithTasks = useMemo(
		() => [...taskDates.keys()].map((d) => new Date(`${d}T00:00:00`)),
		[taskDates],
	)

	const selectedKey = selectedDate ? dateKey(selectedDate) : undefined

	const selectedTasks = selectedKey ? taskDates.get(selectedKey) || [] : []

	return (
		<div className="flex flex-col p-5 pb-20">
			<div className="mb-3 flex items-center gap-1">
				<h1 className="flex-1 ps-1 text-2xl font-bold tracking-tight">
					Calendar
				</h1>
				<Button
					variant="ghost"
					size="icon"
					title="Tasks"
					onClick={() => onNavigate("tasks")}
				>
					<ListTodo />
				</Button>
			</div>

			<Calendar
				className="-mx-3"
				mode="single"
				selected={selectedDate}
				onSelect={setSelectedDate}
				modifiers={{ hasTask: datesWithTasks }}
				modifiersClassNames={{
					hasTask:
						"after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-primary",
				}}
			/>

			{selectedTasks.length > 0 && (
				<div className="fade-in mt-4 flex flex-col gap-2">
					<p className="ps-1 text-[13px] font-semibold text-muted">
						{selectedDate?.toLocaleDateString(undefined, {
							weekday: "long",
							month: "long",
							day: "numeric",
						})}
					</p>
					{selectedTasks.map((task) => (
						<div
							key={task.id}
							className="group flex items-start gap-3 rounded-[1.25rem] bg-field p-4"
						>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-semibold">{task.title}</p>
								{task.deadline && (
									<p className="mt-0.5 text-xs text-muted">
										{task.deadline.toLocaleTimeString(undefined, {
											hour: "numeric",
											minute: "2-digit",
										})}
									</p>
								)}
							</div>
							<Button
								variant="ghost"
								size="icon-sm"
								title="Delete"
								className="-my-1 -me-1 opacity-0 group-hover:opacity-100 hover:text-danger"
								onClick={() => deleteTask(task.id)}
							>
								<Trash2 />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default CalendarView
