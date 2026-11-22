/**
 * How tasks are sorted into groups and labelled. Pure, so it is tested
 * without React; every function takes `now` instead of reading the clock.
 * Local getters throughout (see deadline.ts).
 */
import { format } from "date-fns"
import type { Task } from "@/features/tasks/tasks-context"
import { addDays, sameDay } from "./deadline"

export interface TaskGroups {
	overdue: Task[]
	today: Task[]
	later: Task[]
	done: Task[]
}

/** Expects tasks already sorted (TasksProvider sorts by deadline). */
export function groupTasks(tasks: Task[], now: Date): TaskGroups {
	const groups: TaskGroups = { overdue: [], today: [], later: [], done: [] }
	for (const task of tasks) {
		if (task.done) groups.done.push(task)
		else if (task.deadline && task.deadline < now) groups.overdue.push(task)
		else if (sameDay(task.deadline, now)) groups.today.push(task)
		else groups.later.push(task)
	}
	return groups
}

export type BadgeTone = "overdue" | "soon" | "normal"

/**
 * The short tag on the right of a task row: "2h ago", "in 42m", "6:30 PM",
 * "Tue", "Dec 2". Null when there is no deadline.
 */
export function deadlineBadge(
	deadline: Date | undefined,
	now: Date,
): { text: string; tone: BadgeTone } | null {
	if (!deadline) return null
	const mins = Math.round((deadline.getTime() - now.getTime()) / 60_000)

	if (mins < 0) {
		const ago = -mins
		const text =
			ago < 60
				? `${ago}m ago`
				: ago < 24 * 60
					? `${Math.floor(ago / 60)}h ago`
					: `${Math.floor(ago / (24 * 60))}d ago`
		return { text, tone: "overdue" }
	}
	if (mins <= 60) return { text: `in ${mins}m`, tone: "soon" }
	if (sameDay(deadline, now))
		return { text: format(deadline, "h:mm a"), tone: "normal" }
	// Within the coming week the weekday is unambiguous and shorter.
	if (deadline < addDays(now, 7))
		return { text: format(deadline, "EEE"), tone: "normal" }
	return { text: format(deadline, "MMM d"), tone: "normal" }
}

/**
 * Sunday of the week `date` is in, at midnight. Sunday first, to match the
 * react-day-picker calendar in the deadline picker.
 */
export function startOfWeek(date: Date) {
	return addDays(date, -date.getDay())
}

/** The 6×7 days shown for `month`'s grid, Sunday first. */
export function monthGrid(month: Date): Date[] {
	const first = startOfWeek(new Date(month.getFullYear(), month.getMonth(), 1))
	return Array.from({ length: 42 }, (_, i) => addDays(first, i))
}

/** Local YYYY-MM-DD. Not toISOString(), which would shift the day across UTC. */
export function dateKey(d: Date) {
	const month = String(d.getMonth() + 1).padStart(2, "0")
	const day = String(d.getDate()).padStart(2, "0")
	return `${d.getFullYear()}-${month}-${day}`
}
