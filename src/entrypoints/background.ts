import { db } from "@/lib/db"
import type { Task } from "@/contexts/tasks-context"
import { defineBackground } from "wxt/utils/define-background"
import { createId } from "@paralleldrive/cuid2"
import { isSafeImageUrl, isSafeWebUrl } from "@/lib/utils"

export type Tab = {
	title: string
	url: string
	icon: string
}

const TAB_CACHE_KEY = "dx-open-tabs"

type CachedTab = { title: string; url: string; icon: string }

export default defineBackground(() => {
	// The service worker is torn down after ~30s idle, so tab state has to live in
	// storage.session rather than a module-scoped object — otherwise onRemoved
	// wakes a fresh worker with an empty cache and records nothing.
	const readTabCache = async () =>
		(((await chrome.storage.session.get(TAB_CACHE_KEY))[TAB_CACHE_KEY] ??
			{}) as Record<number, CachedTab>)

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
			const cache = await readTabCache()
			cache[tab.id] = {
				title: tab.title || "",
				url: tab.url || "",
				icon: tab.favIconUrl || "",
			}
			await chrome.storage.session.set({ [TAB_CACHE_KEY]: cache })
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
			await chrome.storage.local.set({ "dx-background-custom": info.srcUrl })
		}
		if (info.menuItemId === "add-task") {
			const [tab] = await chrome.tabs.query({
				active: true,
				currentWindow: true,
			})
			const title = info.linkUrl
				? (info as any).linkText || info.linkUrl
				: info.selectionText || tab?.title || "Untitled task"
			const raw = (await chrome.storage.sync.get("dx-tasks"))["dx-tasks"] as
				| Task[]
				| undefined
			const existing = raw || []
			existing.push({
				id: createId(),
				title,
				description: info.linkUrl || undefined,
				done: false,
				createdAt: new Date().toISOString() as unknown as Date,
			})
			// storage.sync caps a single item at QUOTA_BYTES_PER_ITEM (8KB). Without
			// this the set() rejects inside the listener and the task vanishes with
			// no error surfaced anywhere.
			try {
				await chrome.storage.sync.set({ "dx-tasks": existing })
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
			const cache = await readTabCache()
			const entry = cache[tabId]
			if (entry) {
				delete cache[tabId]
				await chrome.storage.session.set({ [TAB_CACHE_KEY]: cache })
			}
			return entry
		})

		if (tab && isSafeWebUrl(tab.url)) {
			await db.recenttabs.add(tab)
		}
	})
})
