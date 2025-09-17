import type { Task } from "@/lib/db"
import { defineBackground } from "wxt/utils/define-background"

export default defineBackground(() => {
	chrome.alarms.onAlarm.addListener((alarm) => {
		const task = JSON.parse(alarm.name) as Task & { type: "due" | "5m" }
		const msg = task.type === "due" ? "past due" : "due in 5 minutes"

		chrome.notifications.create({
			type: "basic",
			iconUrl: "/icon/48.png",
			title: "Task Reminder",
			message: `${task.title} ${msg}`,
			priority: 2,
		})
	})

	// Example: schedule an alarm from your React popup
	function scheduleTaskNotification(task: Task) {
		const deadline = new Date(task.deadline).getTime()
		const now = Date.now()

		const fiveMinBefore = deadline - 5 * 60 * 1000
		if (fiveMinBefore > now) {
			chrome.alarms.create(JSON.stringify({ ...task, type: "5m" }), {
				when: fiveMinBefore,
			})
		}

		if (deadline > now) {
			chrome.alarms.create(JSON.stringify({ ...task, type: "due" }), {
				when: deadline,
			})
		}
	}

	chrome.runtime.onMessage.addListener((msg) => {
		console.log(msg)
		if (msg.type === "schedule-task") {
			scheduleTaskNotification(msg.task as Task)
		}

		if (msg.type === "delete-task") {
			chrome.alarms.getAll((alarms) => {
				alarms.forEach((alarm) => {
					const task = JSON.parse(alarm.name) as Task

					if (task.id === msg.task_id) {
						chrome.alarms.clear(alarm.name)
					}
				})
			})
		}
	})
})
