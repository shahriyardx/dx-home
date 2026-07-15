/**
 * One typed accessor over chrome.storage, replacing the get + onChanged +
 * removeListener boilerplate that was repeated in every hook and context.
 *
 * Areas differ in kind, not just name:
 *   local   — this profile only, ~10MB. Settings, background choice.
 *   sync    — follows the user across devices, 8KB PER ITEM. Tasks.
 *   session — in memory, cleared when the service worker dies. Tab cache.
 */
export type StorageArea = "local" | "sync" | "session"

export interface StorageItemOptions<T, Raw> {
	/** Convert to a JSON-safe shape. chrome.storage does not preserve Dates. */
	serialize?: (value: T) => Raw
	/** Rebuild the runtime value, e.g. revive ISO strings into Dates. */
	deserialize?: (raw: Raw) => T
}

export interface StorageItem<T> {
	readonly key: string
	readonly area: StorageArea
	/** Used before the first read resolves, and whenever stored data is unusable. */
	readonly fallback: T
	get(): Promise<T>
	set(value: T): Promise<void>
	remove(): Promise<void>
	/** Fires on changes from any context — other tabs, the sidepanel, the worker. */
	watch(listener: (value: T) => void): () => void
}

export function defineStorageItem<T, Raw = T>(
	area: StorageArea,
	key: string,
	fallback: T,
	options: StorageItemOptions<T, Raw> = {},
): StorageItem<T> {
	const serialize = options.serialize ?? ((v: T) => v as unknown as Raw)
	const deserialize = options.deserialize ?? ((r: Raw) => r as unknown as T)

	const read = (raw: unknown): T => {
		if (raw === undefined || raw === null) return fallback
		try {
			return deserialize(raw as Raw)
		} catch {
			// Corrupt or stale data must not take the page down with it.
			return fallback
		}
	}

	return {
		key,
		area,
		fallback,

		async get() {
			const result = await chrome.storage[area].get(key)
			return read(result[key])
		},

		async set(value) {
			await chrome.storage[area].set({ [key]: serialize(value) })
		},

		async remove() {
			await chrome.storage[area].remove(key)
		},

		watch(listener) {
			const handler = (
				changes: Record<string, chrome.storage.StorageChange>,
				changedArea: string,
			) => {
				// Without the area check a `local` item would react to a `sync`
				// write of the same key.
				if (changedArea !== area) return
				if (!(key in changes)) return
				listener(read(changes[key].newValue))
			}

			chrome.storage.onChanged.addListener(handler)
			return () => chrome.storage.onChanged.removeListener(handler)
		},
	}
}
