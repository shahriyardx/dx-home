import { useState, useEffect, useCallback } from "react"
import { createId } from "@paralleldrive/cuid2"
import type { TaskType } from "@/components/tasks"

export interface Task {
	id: string
	title: string
	description?: string
	done: boolean
	deadline?: Date
	createdAt: Date
}

const STORAGE_KEY = "dx-tasks"

async function readTasks(): Promise<Task[]> {
	const result = await chrome.storage.sync.get(STORAGE_KEY)
	const raw = result[STORAGE_KEY] as Record<string, unknown>[] | undefined
	if (!raw) return []

	return raw.map((t) => ({
		...t,
		deadline: t.deadline ? new Date(t.deadline as string) : undefined,
		createdAt: new Date(t.createdAt as string),
	})) as Task[]
}

async function writeTasks(tasks: Task[]): Promise<void> {
	await chrome.storage.sync.set({
		[STORAGE_KEY]: tasks.map((t) => ({
			...t,
			deadline: t.deadline?.toISOString(),
			createdAt: t.createdAt.toISOString(),
		})),
	})
}

function sortTasks(tasks: Task[]): Task[] {
	return [...tasks].sort((a, b) => {
		if (a.deadline && b.deadline)
			return a.deadline.getTime() - b.deadline.getTime()
		if (a.deadline) return -1
		if (b.deadline) return 1
		return b.createdAt.getTime() - a.createdAt.getTime()
	})
}

export const useTasks = () => {
	const [tasks, setTasks] = useState<Task[]>([])

	useEffect(() => {
		readTasks().then((data) => setTasks(sortTasks(data)))

		const handler = (changes: Record<string, chrome.storage.StorageChange>) => {
			if (changes[STORAGE_KEY]) {
				const raw = changes[STORAGE_KEY].newValue as
					| Record<string, unknown>[]
					| undefined
				if (raw) {
					const parsed = raw.map((t) => ({
						...t,
						deadline: t.deadline ? new Date(t.deadline as string) : undefined,
						createdAt: new Date(t.createdAt as string),
					})) as Task[]
					setTasks(sortTasks(parsed))
				} else {
					setTasks([])
				}
			}
		}

		chrome.storage.onChanged.addListener(handler)
		return () => chrome.storage.onChanged.removeListener(handler)
	}, [])

	const addTask = useCallback(async (values: TaskType) => {
		const task: Task = {
			id: createId(),
			title: values.title,
			description: values.description,
			done: false,
			deadline: values.deadline,
			createdAt: new Date(),
		}
		const existing = await readTasks()
		existing.push(task)
		await writeTasks(existing)
		setTasks(sortTasks(existing))

	}, [])

	const updateTask = useCallback(async (id: string, values: TaskType) => {
		const existing = await readTasks()
		const index = existing.findIndex((t) => t.id === id)
		if (index === -1) return

		existing[index] = {
			...existing[index],
			title: values.title,
			description: values.description,
			deadline: values.deadline,
		}
		await writeTasks(existing)
		setTasks(sortTasks(existing))

	}, [])

	const deleteTask = useCallback(async (id: string) => {
		const existing = await readTasks()
		const filtered = existing.filter((t) => t.id !== id)
		await writeTasks(filtered)
		setTasks(sortTasks(filtered))

	}, [])

	return { tasks, addTask, updateTask, deleteTask }
}
