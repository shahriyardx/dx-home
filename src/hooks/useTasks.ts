import type { TaskType } from "@/components/tasks"
import { db, type Task } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"

export const useTasks = () => {
	const tasks =
		useLiveQuery(async () => {
			const all = await db.tasks.toArray()
			return all.sort((a, b) => {
				if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime()
				if (a.deadline) return -1
				if (b.deadline) return 1
				return b.createdAt.getTime() - a.createdAt.getTime()
			})
		}) || ([] as Task[])

	const addTask = async (values: TaskType) => {
		const task_id = await db.tasks.add({
			title: values.title,
			description: values.description,
			done: false,
			deadline: values.deadline,
			createdAt: new Date(),
		})

		if (values.deadline) {
			chrome.runtime.sendMessage({
				type: "schedule-task",
				task: { ...values, id: task_id },
			})
		}
	}

	const updateTask = async (id: number, values: TaskType) => {
		await db.tasks.update(id, {
			title: values.title,
			description: values.description,
			deadline: values.deadline,
		})

		// Clear old alarms and schedule new ones if deadline changed
		chrome.alarms?.getAll?.((alarms) => {
			alarms.forEach((alarm) => {
				try {
					const task = JSON.parse(alarm.name)
					if (task.id === id) {
						chrome.alarms.clear(alarm.name)
					}
				} catch {}
			})
		})

		if (values.deadline) {
			chrome.runtime.sendMessage({
				type: "schedule-task",
				task: { ...values, id },
			})
		}
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
		updateTask,
		deleteTask,
	}
}
