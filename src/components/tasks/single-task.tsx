import moment from "moment"
import type { Task } from "@/lib/db"
import { Trash } from "lucide-react"
import { useTasks } from "@/hooks/useTasks"
import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

type Props = {
	task: Task
}

const SingleTask = ({ task }: Props) => {
	const { deleteTask } = useTasks()
	const [countdown, setCountdown] = useState("")
	const [color, setColor] = useState("text-muted-foreground/60")

	const updateCd = useCallback(() => {
		const now = moment()
		const deadline = moment(task.deadline)
		const diff = deadline.diff(now)
		const cd = deadline.fromNow()

		let newColor = "text-muted-foreground/60"

		if (diff <= 60 * 60 * 1000) {
			newColor = "text-yellow-500"
		}
		if (diff <= 5 * 60 * 1000) {
			newColor = "text-red-500"
		}

		setCountdown(cd)
		setColor(newColor)
	}, [task.deadline])

	useEffect(() => {
		updateCd()
		const interval = setInterval(updateCd, 1000)
		return () => clearInterval(interval)
	}, [updateCd])

	return (
		<div
			className="grid grid-cols-[auto_20px] gap-5 border p-5 rounded-md backdrop-blur-2xl"
			key={task.id}
		>
			<div className="flex-1">
				<div className="flex items-center justify-between">
					<p className={cn(color)}>
						{task.deadline < new Date() ? "due " : ""}
						{countdown}
					</p>
					<p>{moment(task.deadline).format("D MMMM, h:mm A")}</p>
				</div>

				<p className="text-lg flex-1 truncate">{task.title}</p>
			</div>

			<Trash
				onClick={() => deleteTask(task.id)}
				size={18}
				className="hover:text-destructive cursor-pointer"
			/>
		</div>
	)
}

export default SingleTask
