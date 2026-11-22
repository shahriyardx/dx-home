import { Checkbox } from "@base-ui/react/checkbox"
import { Check, Pencil, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import { deadlineBadge } from "@/features/tasks/lib/view"
import type { Task } from "@/features/tasks/tasks-context"
import { useTasksContext } from "@/features/tasks/tasks-context"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent } from "@/shared/ui/dialog"
import TaskForm from "./task-form"

type Props = {
	task: Task
	/** Passed down so one ticking clock in the list drives every badge. */
	now: Date
}

/** Matches the collapsible transition in tailwind.css. */
const LEAVE_MS = 320

const BADGE_TONE = {
	overdue: "bg-danger-container text-on-danger-container",
	soon: "bg-tonal text-on-tonal",
	normal: "bg-surface text-muted",
}

const SingleTask = ({ task, now }: Props) => {
	const { deleteTask, updateTask, toggleTask } = useTasksContext()
	const [editOpen, setEditOpen] = useState(false)
	const [descExpanded, setDescExpanded] = useState(false)
	// Ticking or deleting first plays the change here, then folds the row
	// away, and only then commits — otherwise the row would vanish mid-click
	// as it jumps to another group.
	const [done, setDone] = useState(task.done)
	const [leaving, setLeaving] = useState(false)

	// Lists that keep the row (a calendar day shows done tasks too) reopen it.
	useEffect(() => {
		setDone(task.done)
		setLeaving(false)
	}, [task.done])

	const leave = (commit: () => void) => {
		setLeaving(true)
		setTimeout(commit, LEAVE_MS)
	}

	const badge = done ? null : deadlineBadge(task.deadline, now)

	return (
		<div className={cn("collapsible", !leaving && "expanded")}>
			<div className="min-h-0 overflow-hidden">
				<div className="group pop-in flex items-center gap-3 rounded-[1.25rem] bg-field px-3.5 py-3 transition-colors hover:bg-field-hover">
					<Checkbox.Root
						checked={done}
						onCheckedChange={() => {
							setDone(!done)
							leave(() => toggleTask(task.id))
						}}
						aria-label={task.title}
						className={cn(
							"pressable grid size-5 shrink-0 place-items-center rounded-[0.4375rem] transition-[background-color,box-shadow] duration-200",
							done
								? "bg-primary text-on-primary"
								: "bg-surface shadow-[inset_0_0_0_2px_var(--color-muted)]",
						)}
					>
						<Checkbox.Indicator className="transition-[scale,opacity] duration-200 data-ending-style:scale-50 data-ending-style:opacity-0 data-starting-style:scale-50 data-starting-style:opacity-0">
							<Check className="size-3.5" strokeWidth={3} />
						</Checkbox.Indicator>
					</Checkbox.Root>

					<div className="min-w-0 flex-1">
						<p
							className={cn(
								"text-sm font-semibold transition-colors duration-200",
								done && "text-muted line-through",
							)}
						>
							{task.title}
						</p>
						{task.description && (
							<button
								type="button"
								onClick={() => setDescExpanded((prev) => !prev)}
								className={cn(
									"mt-0.5 block w-full text-left text-xs text-muted",
									!descExpanded && "line-clamp-1",
								)}
							>
								{task.description}
							</button>
						)}
					</div>

					{/* The badge gives way to the actions on hover, in the same spot. */}
					{badge && (
						<span
							className={cn(
								"shrink-0 rounded-[0.625rem] px-2 py-0.5 text-xs font-bold tabular-nums group-focus-within:hidden group-hover:hidden",
								BADGE_TONE[badge.tone],
							)}
						>
							{badge.text}
						</span>
					)}
					<div className="-my-1 -me-1.5 hidden gap-1 group-focus-within:flex group-hover:flex">
						<Button
							variant="ghost"
							size="icon-sm"
							title="Edit"
							onClick={() => setEditOpen(true)}
						>
							<Pencil />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							title="Delete"
							className="hover:text-danger"
							onClick={() => leave(() => deleteTask(task.id))}
						>
							<Trash />
						</Button>
					</div>
				</div>
			</div>

			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent title="Edit task">
					<TaskForm
						onSuccess={() => setEditOpen(false)}
						defaultValues={{
							title: task.title,
							description: task.description || "",
							deadline: task.deadline,
						}}
						onSubmit={async (values) => {
							await updateTask(task.id, values)
						}}
					/>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default SingleTask
