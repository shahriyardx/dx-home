import { createContext, useContext, useCallback, type ReactNode } from "react"
import { createId } from "@paralleldrive/cuid2"
import { defineStorageItem, useStorageItem } from "@/shared/storage"
import type { TaskType } from "@/features/tasks/schema"

export interface Task {
	id: string
	title: string
	description?: string
	done: boolean
	deadline?: Date
	createdAt: Date
}

/** What actually lands in storage: chrome.storage JSON-encodes, so no Dates. */
interface StoredTask {
	id: string
	title: string
	description?: string
	done: boolean
	deadline?: string
	createdAt: string
}

export const tasksItem = defineStorageItem<Task[], StoredTask[]>(
	"sync",
	"dx-tasks",
	[],
	{
		serialize: (tasks) =>
			tasks.map((task) => ({
				...task,
				deadline: task.deadline?.toISOString(),
				createdAt: task.createdAt.toISOString(),
			})),
		deserialize: (raw) =>
			raw.map((task) => ({
				...task,
				deadline: task.deadline ? new Date(task.deadline) : undefined,
				createdAt: new Date(task.createdAt),
			})),
	},
)

interface TasksContextValue {
	tasks: Task[]
	addTask: (values: TaskType) => Promise<void>
	updateTask: (id: string, values: TaskType) => Promise<void>
	deleteTask: (id: string) => Promise<void>
}

const TasksContext = createContext<TasksContextValue | null>(null)

function sortTasks(tasks: Task[]): Task[] {
	return [...tasks].sort((a, b) => {
		if (a.deadline && b.deadline)
			return a.deadline.getTime() - b.deadline.getTime()
		if (a.deadline) return -1
		if (b.deadline) return 1
		return b.createdAt.getTime() - a.createdAt.getTime()
	})
}

export function TasksProvider({ children }: { children: ReactNode }) {
	const { value: stored, setValue } = useStorageItem(tasksItem)
	const tasks = sortTasks(stored)

	// storage.sync caps a single item at QUOTA_BYTES_PER_ITEM (8KB). Surfacing
	// the rejection matters: swallowing it loses the task with no sign that
	// anything went wrong.
	const write = useCallback(
		async (next: Task[]) => {
			try {
				await setValue(next)
			} catch (err) {
				console.error(
					"[dx-home] could not save tasks — storage.sync item quota reached",
					err,
				)
				throw err
			}
		},
		[setValue],
	)

	const addTask = useCallback(
		async (values: TaskType) => {
			await write([
				...stored,
				{
					id: createId(),
					title: values.title,
					description: values.description,
					done: false,
					deadline: values.deadline,
					createdAt: new Date(),
				},
			])
		},
		[stored, write],
	)

	const updateTask = useCallback(
		async (id: string, values: TaskType) => {
			await write(
				stored.map((task) =>
					task.id === id
						? {
								...task,
								title: values.title,
								description: values.description,
								deadline: values.deadline,
							}
						: task,
				),
			)
		},
		[stored, write],
	)

	const deleteTask = useCallback(
		async (id: string) => {
			await write(stored.filter((task) => task.id !== id))
		},
		[stored, write],
	)

	return (
		<TasksContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
			{children}
		</TasksContext.Provider>
	)
}

export function useTasksContext() {
	const ctx = useContext(TasksContext)
	if (!ctx) throw new Error("useTasksContext must be used within TasksProvider")
	return ctx
}
