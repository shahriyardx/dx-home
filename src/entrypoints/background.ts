import { db } from "@/shared/storage/db"
import { defineStorageItem } from "@/shared/storage"
import { tasksItem, type Task } from "@/features/tasks/tasks-context"
import { customBackground } from "@/features/backgrounds/use-background"
import { defineBackground } from "wxt/utils/define-background"
import { createId } from "@paralleldrive/cuid2"
import { isSafeImageUrl, isSafeWebUrl } from "@/shared/lib/utils"

export type Tab = {
	title: string
	url: string
	icon: string
}

type CachedTab = { title: string; url: string; icon: string }

// The service worker is torn down after ~30s idle, so tab state has to live in
// storage.session rather than a module-scoped object — otherwise onRemoved wakes
// a fresh worker with an empty cache and records nothing.
const tabCache = defineStorageItem<Record<number, CachedTab>>(
	"session",
	"dx-open-tabs",
	{},
)

export default defineBackground(() => {
	// Tab events fire in bursts; serialize the read-modify-writes so they don't
	// clobber each other.
	let queue: Promise<unknown> = Promise.resolve()
	const enqueue = <T>(job: () => Promise<T>): Promise<T> => {
		const run = queue.then(job, job)
		queue = run.catch(() => {})
		return run
	}

	const rememberTab = (tab: chrome.tabs.Tab) =>
		enqueue(async () => {
			if (tab.id == null) return
			const cache = await tabCache.get()
			cache[tab.id] = {
				title: tab.title || "",
				url: tab.url || "",
				icon: tab.favIconUrl || "",
			}
			await tabCache.set(cache)
		})

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
			// linkUrl is the raw href of whatever was right-clicked, so a page can
			// offer a javascript: link here. It is later handed to window.open from
			// an extension page, where it would run with our origin.
			if (!url || !isSafeWebUrl(url)) return
			const [tab] = await chrome.tabs.query({
				active: true,
				currentWindow: true,
			})
			await db.readinglist.add({
				title: info.selectionText || tab?.title || url,
				url,
				icon: tab?.favIconUrl || "",
				read: false,
				savedAt: new Date(),
			})
		}

		if (info.menuItemId === "set-background" && info.srcUrl) {
			// Re-fetched on every new tab, so a page-controlled URL here is a
			// persistent beacon that outlives the page itself.
			if (!isSafeImageUrl(info.srcUrl)) return
			await customBackground.set(info.srcUrl)
		}
		if (info.menuItemId === "add-task") {
			const [tab] = await chrome.tabs.query({
				active: true,
				currentWindow: true,
			})
			// linkText is populated by Chrome but missing from @types/chrome.
			const linkText = (info as { linkText?: string }).linkText
			const title = info.linkUrl
				? linkText || info.linkUrl
				: info.selectionText || tab?.title || "Untitled task"
			const task: Task = {
				id: createId(),
				title,
				description: info.linkUrl || undefined,
				done: false,
				createdAt: new Date(),
			}
			// storage.sync caps a single item at QUOTA_BYTES_PER_ITEM (8KB). Without
			// this the set() rejects inside the listener and the task vanishes with
			// no error surfaced anywhere.
			try {
				const existing = await tasksItem.get()
				await tasksItem.set([...existing, task])
			} catch (err) {
				console.error(
					"[dx-home] could not save task — storage.sync item quota reached",
					err,
				)
			}
		}

		if (info.menuItemId === "bookmark-page") {
			const [tab] = await chrome.tabs.query({
				active: true,
				currentWindow: true,
			})
			if (tab?.title && tab.url) {
				await db.bookmarks.add({ label: tab.title, url: tab.url })
			}
		}
	})

	chrome.tabs.onCreated.addListener((tab) => {
		rememberTab(tab)
	})

	chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
		rememberTab(tab)
	})

	chrome.tabs.onRemoved.addListener(async (tabId) => {
		const tab = await enqueue(async () => {
			const cache = await tabCache.get()
			const entry = cache[tabId]
			if (entry) {
				delete cache[tabId]
				await tabCache.set(cache)
			}
			return entry
		})

		if (tab && isSafeWebUrl(tab.url)) {
			await db.recenttabs.add(tab)
		}
	})
})
