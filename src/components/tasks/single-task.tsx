import moment from "moment"
import type { Task } from "@/lib/db"
import { Pencil, Trash } from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import TaskForm from "./task-form"

type Props = {
	task: Task
}

const SingleTask = ({ task }: Props) => {
	const { deleteTask, updateTask } = useTasks()
	const [editOpen, setEditOpen] = useState(false)
	const [countdown, setCountdown] = useState("")

	const hasDeadline = task.deadline !== undefined
	const urgency = hasDeadline
		? task.deadline! < new Date()
			? "overdue"
			: task.deadline!.getTime() - Date.now() <= 5 * 60 * 1000
				? "critical"
				: task.deadline!.getTime() - Date.now() <= 60 * 60 * 1000
					? "warning"
					: "none"
		: "none"

	const updateCd = useCallback(() => {
		if (hasDeadline) {
			setCountdown(moment(task.deadline!).fromNow())
		}
	}, [task.deadline, hasDeadline])

	useEffect(() => {
		updateCd()
		if (!hasDeadline) return
		const interval = setInterval(updateCd, 30_000)
		return () => clearInterval(interval)
	}, [updateCd, hasDeadline])

	return (
		<>
			<Card
				className={cn(
					"grid grid-cols-[1fr_auto] gap-3 p-4 group bg-secondary/50",
					urgency === "overdue" && "opacity-60",
				)}
			>
				<div className="min-w-0">
					<div className="flex items-center gap-2 text-xs">
						{hasDeadline ? (
							<>
								<span
									className={cn(
										"font-medium",
										urgency === "overdue" && "text-red-500",
										urgency === "critical" && "text-amber-500",
										urgency === "warning" && "text-yellow-500",
										urgency === "none" && "text-muted-foreground",
									)}
								>
									{countdown}
								</span>
								{hasDeadline && (
									<span className="text-muted-foreground">&middot;</span>
								)}
								<span className="text-muted-foreground">
									{moment(task.deadline).format("MMM D, h:mm A")}
								</span>
							</>
						) : (
							<span className="text-muted-foreground">
								Created {moment(task.createdAt).fromNow()}
							</span>
						)}
					</div>
					<p className="text-sm mt-0.5 text-foreground/90 truncate">
						{task.title}
					</p>
					{task.description && (
						<p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
							{task.description}
						</p>
					)}
				</div>

				<div className="flex items-center gap-1.5">
					<Button
						variant="outline"
						size="icon"
						className="size-7 shrink-0 text-muted-foreground/50 hover:text-foreground"
						onClick={() => setEditOpen(true)}
					>
						<Pencil size={13} />
					</Button>
					<Button
						variant="destructive"
						size="icon"
						className="size-7 shrink-0"
						onClick={() => deleteTask(task.id)}
					>
						<Trash size={14} />
					</Button>
				</div>
			</Card>

			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit task</DialogTitle>
					</DialogHeader>
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
