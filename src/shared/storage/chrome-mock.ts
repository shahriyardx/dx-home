/**
 * A minimal in-memory chrome.storage stand-in for tests.
 *
 * Models the parts the storage layer actually depends on: per-area isolation,
 * JSON round-tripping (so a Date written without a serializer comes back as a
 * string, exactly as the real API behaves), and onChanged carrying the area
 * name.
 */
type Listener = (
	changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
	area: string,
) => void

export function installChromeStorageMock() {
	const areas: Record<string, Map<string, string>> = {
		local: new Map(),
		sync: new Map(),
		session: new Map(),
	}
	const listeners = new Set<Listener>()

	const makeArea = (name: string) => ({
		async get(key: string) {
			const raw = areas[name].get(key)
			return raw === undefined ? {} : { [key]: JSON.parse(raw) }
		},
		async set(items: Record<string, unknown>) {
			const changes: Record<
				string,
				{ oldValue?: unknown; newValue?: unknown }
			> = {}
			for (const [key, value] of Object.entries(items)) {
				const before = areas[name].get(key)
				const encoded = JSON.stringify(value ?? null)
				areas[name].set(key, encoded)
				changes[key] = {
					oldValue: before === undefined ? undefined : JSON.parse(before),
					newValue: JSON.parse(encoded),
				}
			}
			for (const listener of listeners) listener(changes, name)
		},
		async remove(key: string) {
			const before = areas[name].get(key)
			areas[name].delete(key)
			for (const listener of listeners) {
				listener(
					{
						[key]: {
							oldValue: before === undefined ? undefined : JSON.parse(before),
							newValue: undefined,
						},
					},
					name,
				)
			}
		},
	})

	const storage = {
		local: makeArea("local"),
		sync: makeArea("sync"),
		session: makeArea("session"),
		onChanged: {
			addListener: (fn: Listener) => listeners.add(fn),
			removeListener: (fn: Listener) => listeners.delete(fn),
		},
	}

	;(globalThis as { chrome?: unknown }).chrome = { storage }

	return {
		listenerCount: () => listeners.size,
		reset: () => {
			for (const area of Object.values(areas)) area.clear()
			listeners.clear()
		},
	}
}
