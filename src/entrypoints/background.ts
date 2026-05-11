import { db } from "@/lib/db"
import type { Task } from "@/hooks/useTasks"
import { defineBackground } from "wxt/utils/define-background"
import { createId } from "@paralleldrive/cuid2"

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

	// Context menu for setting image as background
	chrome.contextMenus.create({
		id: "set-background",
		title: "Set Image as Background",
		contexts: ["image"],
	})

	// Context menu for adding to tasks
	chrome.contextMenus.create({
		id: "add-task",
		title: "Add to Tasks",
		contexts: ["page", "selection", "link"],
	})

	// Context menu for bookmarking page
	chrome.contextMenus.create({
		id: "bookmark-page",
		title: "Bookmark This Page",
		contexts: ["page"],
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

		if (info.menuItemId === "set-background" && info.srcUrl) {
			await chrome.storage.local.set({ "dx-background-custom": info.srcUrl })
		}
		if (info.menuItemId === "add-task") {
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
			const title = info.linkUrl
				? ((info as any).linkText || info.linkUrl)
				: (info.selectionText || tab?.title || "Untitled task")
			const raw = (await chrome.storage.sync.get("dx-tasks"))["dx-tasks"] as Task[] | undefined
			const existing = raw || []
			existing.push({
				id: createId(),
				title,
				description: info.linkUrl || undefined,
				done: false,
				createdAt: new Date().toISOString() as unknown as Date,
			})
			await chrome.storage.sync.set({ "dx-tasks": existing })
		}

		if (info.menuItemId === "bookmark-page") {
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
			if (tab?.title && tab.url) {
				await db.bookmarks.add({ label: tab.title, url: tab.url })
			}
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
