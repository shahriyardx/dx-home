import moment from "moment"
import type { Task } from "@/features/tasks/tasks-context"
import { Pencil, Trash } from "lucide-react"
import { useTasksContext } from "@/features/tasks/tasks-context"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent } from "@/shared/ui/dialog"
import TaskForm from "./task-form"

type Props = {
	task: Task
}

const SingleTask = ({ task }: Props) => {
	const { deleteTask, updateTask } = useTasksContext()
	const [editOpen, setEditOpen] = useState(false)
	const [descExpanded, setDescExpanded] = useState(false)
	const [countdown, setCountdown] = useState("")

	const deadline = task.deadline
	const hasDeadline = deadline !== undefined
	const urgency = hasDeadline
		? deadline < new Date()
			? "overdue"
			: deadline.getTime() - Date.now() <= 5 * 60 * 1000
				? "critical"
				: deadline.getTime() - Date.now() <= 60 * 60 * 1000
					? "warning"
					: "none"
		: "none"

	const updateCd = useCallback(() => {
		if (hasDeadline) {
			setCountdown(moment(deadline).fromNow())
		}
	}, [deadline, hasDeadline])

	useEffect(() => {
		updateCd()
		if (!hasDeadline) return
		const interval = setInterval(updateCd, 30_000)
		return () => clearInterval(interval)
	}, [updateCd, hasDeadline])

	const urgencyColor = cn(
		urgency === "overdue" && "text-danger",
		urgency === "critical" && "text-amber-300",
		urgency === "warning" && "text-yellow-200",
		urgency === "none" && "text-muted",
	)

	return (
		<>
			<div className="group flex items-start gap-3 rounded-[1.25rem] bg-field p-4 transition-colors hover:bg-field-hover">
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold">{task.title}</p>
					<p className="mt-0.5 text-xs text-muted">
						{hasDeadline ? (
							<>
								<span className={cn("font-semibold", urgencyColor)}>
									{countdown}
								</span>
								<span className="mx-1">&middot;</span>
								{moment(deadline).format("MMM D, h:mm A")}
							</>
						) : (
							<>Created {moment(task.createdAt).fromNow()}</>
						)}
					</p>
					{task.description && (
						<button
							type="button"
							onClick={() => setDescExpanded((prev) => !prev)}
							className={cn(
								"mt-2 block w-full text-left text-[13px] text-muted",
								!descExpanded && "line-clamp-1",
							)}
						>
							{task.description}
						</button>
					)}
				</div>
				<div className="-my-1 -me-1 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
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
						onClick={() => deleteTask(task.id)}
					>
						<Trash />
					</Button>
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
		</>
	)
}

export default SingleTask
