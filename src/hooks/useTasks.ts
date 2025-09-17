import type { TaskType } from "@/components/tasks"
import { db, type Task } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"

export const useTasks = () => {
	const tasks =
		useLiveQuery(() => db.tasks.orderBy("deadline").toArray()) || ([] as Task[])

	const addTask = async (values: TaskType) => {
		const task_id = await db.tasks.add({
			...values,
			done: false,
			createdAt: new Date(),
		})

		chrome.runtime.sendMessage({
			type: "schedule-task",
			task: { ...values, id: task_id },
		})
	}

	const deleteTask = async (id: number) => {
		await db.tasks.delete(id)

		chrome.runtime.sendMessage({
			type: "delete-task",
			task_id: id,
		})
	}

	return {
		tasks,
		addTask,
		deleteTask,
	}
}
