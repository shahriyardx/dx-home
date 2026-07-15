import { useCallback, useEffect, useRef, useState } from "react"
import {
	discoverDevServers,
	hasLocalhostAccess,
	requestLocalhostAccess,
	type DevServer,
} from "./probe"

const POLL_MS = 5000

const sameServers = (a: DevServer[], b: DevServer[]) =>
	a.length === b.length &&
	a.every((s, i) => s.url === b[i].url && s.label === b[i].label)

export function useDevServers() {
	const [servers, setServers] = useState<DevServer[]>([])
	const [granted, setGranted] = useState<boolean | null>(null)
	const [scanning, setScanning] = useState(false)
	const inFlight = useRef(false)

	const scan = useCallback(async () => {
		// A sweep can outlast the interval on a slow port; overlapping sweeps would
		// double the request rate for no gain.
		if (inFlight.current) return
		inFlight.current = true
		setScanning(true)
		try {
			const found = await discoverDevServers()
			// Only swap state when something actually changed — otherwise every poll
			// re-renders the list with identical data.
			setServers((prev) => (sameServers(prev, found) ? prev : found))
		} finally {
			inFlight.current = false
			setScanning(false)
		}
	}, [])

	useEffect(() => {
		let active = true
		hasLocalhostAccess().then((ok) => {
			if (!active) return
			setGranted(ok)
			if (ok) scan()
		})
		return () => {
			active = false
		}
	}, [scan])

	useEffect(() => {
		if (!granted) return

		let id: number | undefined
		const start = () => {
			if (id === undefined) id = window.setInterval(scan, POLL_MS)
		}
		const stop = () => {
			if (id !== undefined) {
				clearInterval(id)
				id = undefined
			}
		}

		// Paused while the tab is hidden. A new tab often sits in the background
		// for hours, and polling it there would spend requests — and fill the
		// user's dev server logs — with nobody watching. Coming back re-scans
		// immediately, so the list is current the moment it is looked at.
		const onVisibility = () => {
			if (document.hidden) {
				stop()
			} else {
				scan()
				start()
			}
		}

		if (!document.hidden) start()
		document.addEventListener("visibilitychange", onVisibility)

		return () => {
			stop()
			document.removeEventListener("visibilitychange", onVisibility)
		}
	}, [granted, scan])

	/** Must be reached from a user gesture — Chrome rejects the prompt otherwise. */
	const enable = useCallback(async () => {
		const ok = await requestLocalhostAccess()
		setGranted(ok)
		if (ok) await scan()
		return ok
	}, [scan])

	return { servers, granted, scanning, enable, rescan: scan }
}
