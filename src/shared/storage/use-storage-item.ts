import { useCallback, useEffect, useState } from "react"
import type { StorageItem } from "./item"

export interface UseStorageItem<T> {
	value: T
	setValue: (next: T) => Promise<void>
	/** False until the first read resolves, so callers can avoid flashing the fallback. */
	loaded: boolean
}

/**
 * Subscribes a component to a StorageItem. The value stays in step with writes
 * from any other context — a second new tab, the sidepanel, the service worker
 * — because it re-renders from the storage change event rather than from local
 * state alone.
 */
export function useStorageItem<T>(item: StorageItem<T>): UseStorageItem<T> {
	const [value, setValue] = useState<T>(item.fallback)
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		let active = true

		item.get().then((stored) => {
			if (!active) return
			setValue(stored)
			setLoaded(true)
		})

		const unwatch = item.watch((next) => {
			if (active) setValue(next)
		})

		return () => {
			active = false
			unwatch()
		}
	}, [item])

	const update = useCallback(
		async (next: T) => {
			// Optimistic: the watcher would deliver this anyway, but not until the
			// write round-trips, which shows as input lag on toggles.
			setValue(next)
			await item.set(next)
		},
		[item],
	)

	return { value, setValue: update, loaded }
}
