import { CalendarDays, CheckCheck, ChevronDown, ListTodo } from "lucide-react"
import { useState } from "react"
import type { RightPanelSection } from "@/entrypoints/newtab/right-panel-context"
import { groupTasks } from "@/features/tasks/lib/view"
import { type Task, useTasksContext } from "@/features/tasks/tasks-context"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { useNow } from "@/features/tasks/use-now"
import { QuickAdd } from "./quick-add"
import SingleTask from "./single-task"

type Props = {
	onNavigate: (section: RightPanelSection) => void
}

function Group({
	label,
	tasks,
	now,
	danger,
}: {
	label: string
	tasks: Task[]
	now: Date
	danger?: boolean
}) {
	if (tasks.length === 0) return null
	return (
		<section className="flex flex-col gap-1.5">
			<h2
				className={cn(
					"mt-3 flex items-center gap-2 ps-1.5 text-[13px] font-bold",
					danger ? "text-danger" : "text-muted",
				)}
			>
				{label}
				<span className="rounded-[0.5rem] bg-field px-1.5 text-[11px] text-muted">
					{tasks.length}
				</span>
			</h2>
			{tasks.map((task) => (
				<SingleTask key={task.id} task={task} now={now} />
			))}
		</section>
	)
}

/** Nothing open: either no tasks at all, or every one is done. */
function EmptyState({ allDone }: { allDone: boolean }) {
	const Icon = allDone ? CheckCheck : ListTodo
	return (
		<div className="pop-in my-auto flex flex-col items-center gap-3 py-10 text-center">
			<div className="grid size-16 place-items-center rounded-[1.5rem] bg-field text-primary">
				<Icon className="size-7" />
			</div>
			<div>
				<p className="text-lg font-bold tracking-tight">
					{allDone ? "All done" : "No tasks yet"}
				</p>
				<p className="mt-0.5 text-sm text-muted">
					{allDone ? "Nothing left for now" : "Add your first one above"}
				</p>
			</div>
		</div>
	)
}

const TaskListView = ({ onNavigate }: Props) => {
	const { tasks } = useTasksContext()
	const now = useNow()
	const [showDone, setShowDone] = useState(false)
	const groups = groupTasks(tasks, now)

	return (
		<div className="flex flex-1 flex-col p-5 pb-20">
			<div className="mb-4 flex items-center gap-1">
				<h1 className="flex-1 ps-1 text-2xl font-bold tracking-tight">Tasks</h1>
				<Button
					variant="neutral"
					size="icon"
					title="Calendar"
					onClick={() => onNavigate("calendar")}
				>
					<CalendarDays />
				</Button>
			</div>

			<QuickAdd />

			{groups.overdue.length + groups.today.length + groups.later.length ===
				0 && <EmptyState allDone={groups.done.length > 0} />}

			<div className="mt-1 flex flex-col gap-2">
				<Group label="Overdue" tasks={groups.overdue} now={now} danger />
				<Group label="Today" tasks={groups.today} now={now} />
				<Group label="Later" tasks={groups.later} now={now} />
			</div>

			{groups.done.length > 0 && (
				<div className="mt-5 flex flex-col gap-1.5">
					<button
						type="button"
						onClick={() => setShowDone((v) => !v)}
						aria-expanded={showDone}
						className="flex items-center gap-1.5 self-start rounded-[0.75rem] px-1.5 py-1 text-[13px] font-bold text-muted hover:text-fg"
					>
						<ChevronDown
							className={cn(
								"size-4 transition-transform",
								!showDone && "-rotate-90",
							)}
						/>
						Done · {groups.done.length}
					</button>
					<div
						className={cn("collapsible", showDone && "expanded")}
						inert={!showDone}
					>
						<div className="flex min-h-0 flex-col gap-1.5 overflow-hidden">
							{groups.done.map((task) => (
								<SingleTask key={task.id} task={task} now={now} />
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default TaskListView
