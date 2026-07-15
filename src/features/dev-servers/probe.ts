import { DEV_PORTS, labelFor } from "./ports"

export interface DevServer {
	port: number
	url: string
	label: string
}

export interface ProbeOptions {
	/** Injectable for tests. */
	fetchImpl?: typeof fetch
	/**
	 * Postgres and friends accept the TCP connection and then never send an HTTP
	 * response, so a probe without a deadline hangs rather than failing. Short
	 * enough that 20 ports resolve fast; long enough for a cold dev server.
	 */
	timeoutMs?: number
}

const TITLE_RE = /<title[^>]*>([^<]{1,120})<\/title>/i

/**
 * Probes one port.
 *
 * The HTTP-vs-database question answers itself: fetch only resolves if
 * something completed an HTTP response. Postgres, MongoDB, Redis and MySQL
 * speak their own binary protocols, so the request errors and they can never
 * show up here — no port-to-protocol table needed.
 *
 * Any status counts, including 404 and 500: a dev server throwing an error is
 * still a dev server that is running.
 */
export async function probePort(
	port: number,
	{ fetchImpl = fetch, timeoutMs = 700 }: ProbeOptions = {},
): Promise<DevServer | null> {
	const url = `http://localhost:${port}`

	try {
		const res = await fetchImpl(url, {
			signal: AbortSignal.timeout(timeoutMs),
			// No cookies: this is a liveness probe, it should not carry a session
			// into whatever is listening.
			credentials: "omit",
			cache: "no-store",
			redirect: "follow",
		})

		let title: string | undefined
		const type = res.headers.get("content-type") ?? ""
		if (type.includes("text/html")) {
			// Only the head is needed, and a dev server can stream a large page.
			const body = (await res.text()).slice(0, 4000)
			title = TITLE_RE.exec(body)?.[1]?.trim() || undefined
		}

		return {
			port,
			url,
			label: labelFor(
				port,
				title,
				res.headers.get("x-powered-by") ?? undefined,
			),
		}
	} catch {
		// Nothing listening, not HTTP, or too slow. All three mean "do not show".
		return null
	}
}

/** Probes every candidate port at once; the whole sweep costs one timeout. */
export async function discoverDevServers(
	options: ProbeOptions = {},
): Promise<DevServer[]> {
	const results = await Promise.all(
		DEV_PORTS.map((port) => probePort(port, options)),
	)
	return results.filter((server): server is DevServer => server !== null)
}

const LOCALHOST_ORIGINS = ["http://localhost/*", "http://127.0.0.1/*"]

/**
 * Match patterns ignore ports, so these two cover every port on the loopback
 * interface and nothing beyond it.
 */
export function hasLocalhostAccess(): Promise<boolean> {
	return chrome.permissions.contains({ origins: LOCALHOST_ORIGINS })
}

/** Must be called from a user gesture — Chrome rejects it otherwise. */
export function requestLocalhostAccess(): Promise<boolean> {
	return chrome.permissions.request({ origins: LOCALHOST_ORIGINS })
}

export function revokeLocalhostAccess(): Promise<boolean> {
	return chrome.permissions.remove({ origins: LOCALHOST_ORIGINS })
}
