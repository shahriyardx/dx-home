import { useState, useMemo } from "react"
import { useTasks } from "@/hooks/useTasks"
import { Button } from "../ui/button"
import SingleTask from "./single-task"
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
import TaskForm from "./task-form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { Plus, CalendarDays, ListTodo, Trash2 } from "lucide-react"
const Tasks = () => {
	const { tasks, deleteTask } = useTasks()
	const [addTaskOpen, setAddTaskOpen] = useState(false)
	const [view, setView] = useState<"tasks" | "calendar">("tasks")
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
		<div className="flex flex-col h-full">
			<div className="p-6 pb-4 shrink-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setView(view === "tasks" ? "calendar" : "tasks")}
							className="p-1 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
							title={view === "tasks" ? "Show Calendar" : "Show Tasks"}
						>
							{view === "tasks" ? (
								<CalendarDays size={20} />
							) : (
								<ListTodo size={20} />
							)}
						</button>

						<h1 className="text-lg font-semibold">
							{view === "tasks" ? "Tasks" : "Calendar"}
						</h1>
					</div>
					<Dialog
						open={addTaskOpen}
						onOpenChange={(val) => setAddTaskOpen(val)}
					>
						<DialogTrigger>
							<Button
								size="sm"
								variant="outline"
								className="text-xs h-7 px-2 cursor-pointer text-muted-foreground hover:text-foreground"
							>
								<Plus /> New
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>New task</DialogHeader>
							<TaskForm onSuccess={() => setAddTaskOpen(false)} />
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{view === "tasks" ? (
				<div className="space-y-3 min-h-0 px-6">
					{tasks.length === 0 && (
						<p className="text-xs text-muted-foreground/60">No tasks yet.</p>
					)}
					{tasks.map((task) => (
						<SingleTask key={task.id} task={task} />
					))}
				</div>
			) : (
				<div className="space-y-4 ">
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
									<div className="relative w-full h-full flex items-center justify-center">
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
			)}
		</div>
	)
}

export default Tasks
