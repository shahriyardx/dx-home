import { db } from "@/lib/db"
import type { Task } from "@/hooks/useTasks"
import { defineBackground } from "wxt/utils/define-background"

export type Tab = {
	title: string
	url: string
	icon: string
}

export default defineBackground(() => {
	const openTabs: Record<number, chrome.tabs.Tab> = {}

	// Open sidepanel on action icon click
	chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

	// Context menu for saving to reading list
	chrome.contextMenus.create({
		id: "save-reading-list",
		title: "Save to Reading List",
		contexts: ["page", "link"],
	})

	chrome.contextMenus.onClicked.addListener(async (info) => {
		if (info.menuItemId === "save-reading-list") {
			const url = info.linkUrl || info.pageUrl
			if (!url) return
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
			await db.readinglist.add({
				title: info.selectionText || tab?.title || url,
				url,
				icon: tab?.favIconUrl || "",
				read: false,
				savedAt: new Date(),
			})
		}
	})

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
	function scheduleTaskNotification(task: Task & { deadline?: Date }) {
		if (!task.deadline) return
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

	chrome.runtime.onMessage.addListener(async (msg, _sender) => {
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

	chrome.tabs.onCreated.addListener((tab) => {
		if (tab.id) {
			openTabs[tab.id] = tab
		}
	})

	chrome.tabs.onUpdated.addListener((tabId, _changeInfo, tab) => {
		openTabs[tabId] = tab

		console.log(openTabs)
	})

	chrome.tabs.onRemoved.addListener(async (tabId) => {
		const tab = openTabs[tabId]
		if (tab) {
			await db.recenttabs.add({
				title: tab.title || "",
				url: tab.url || "",
				icon: tab.favIconUrl || "",
			})
		}
	})
})
