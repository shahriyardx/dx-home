import moment from "moment"
import type { Task } from "@/hooks/useTasks"
import { Pencil, Trash } from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
	Card,
	CardHeader,
	CardTitle,
	CardAction,
	CardContent,
} from "@/components/ui/card"
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
		urgency === "overdue" && "text-red-500",
		urgency === "critical" && "text-amber-500",
		urgency === "warning" && "text-yellow-500",
		urgency === "none" && "text-muted-foreground",
	)

	return (
		<>
			<Card
				size="sm"
				className={cn(
					"group bg-secondary/50",
					urgency === "overdue" && "opacity-60",
				)}
			>
				<CardHeader>
					<CardTitle className="text-xs">
						{hasDeadline ? (
							<>
								<span className={cn("font-medium", urgencyColor)}>
									{countdown}
								</span>
								<span className="mx-1 text-muted-foreground/40">&middot;</span>
								<span className="font-normal text-muted-foreground">
									{moment(deadline).format("MMM D, h:mm A")}
								</span>
							</>
						) : (
							<span className="text-muted-foreground">
								Created {moment(task.createdAt).fromNow()}
							</span>
						)}
					</CardTitle>
					<CardAction>
						<div className="flex gap-1">
							<Button
								variant="outline"
								size="icon-xs"
								onClick={() => setEditOpen(true)}
							>
								<Pencil size={12} />
							</Button>
							<Button
								variant="destructive"
								size="icon-xs"
								onClick={() => deleteTask(task.id)}
							>
								<Trash size={12} />
							</Button>
						</div>
					</CardAction>
				</CardHeader>
				<CardContent>
					<p className="text-lg">{task.title}</p>
					{task.description && (
						<p className="text-muted-foreground mt-2">{task.description}</p>
					)}
				</CardContent>
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
