import { useEffect, useMemo, useState } from "react"
import { getDomain } from "tldts"

type Props = {
	url: string
	size?: number
	className?: string
}

/** Network fallbacks, for Firefox and for sites Chrome has no icon for. */
function networkCandidates(url: string) {
	try {
		const parsed = new URL(url)
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return []

		const domain = getDomain(parsed.hostname) ?? parsed.hostname

		return [
			`${parsed.origin}/favicon.ico`,
			`https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`,
		]
	} catch {
		return []
	}
}

/**
 * Chrome keeps the icon of every site the profile has visited in its own
 * favicon store, on disk. `_favicon/` (with the warning-free "favicon"
 * permission) reads it straight from there: no network, instant, and still
 * there after a restart — the icon is effectively saved once and reused.
 */
const chromeIcon = (pageUrl: string, size: number) =>
	`${chrome.runtime.getURL("/_favicon/")}?pageUrl=${encodeURIComponent(pageUrl)}&size=${size}`

/**
 * For a site it has never seen, Chrome returns a generic globe instead of an
 * error. Compare against that globe once, so those sites can fall back to the
 * network instead of all showing the same icon.
 */
let globe: Promise<string> | undefined
const bytesOf = async (src: string) => {
	const buf = await (await fetch(src)).arrayBuffer()
	return new Uint8Array(buf).join(",")
}

async function resolveChromeIcon(url: string, size: number) {
	const src = chromeIcon(url, size)
	globe ??= bytesOf(chromeIcon("https://example.invalid/", size))
	const [mine, generic] = await Promise.all([bytesOf(src), globe])
	return mine === generic ? null : src
}

export function Favicon({ url, size = 16, className }: Props) {
	// Ask for 2× so icons stay sharp on high-DPI screens; Chrome caps at 64.
	const px = Math.min(size * 2, 64)
	const [sources, setSources] = useState<string[] | null>(
		import.meta.env.FIREFOX ? networkCandidates(url) : null,
	)
	const [index, setIndex] = useState(0)

	const network = useMemo(() => networkCandidates(url), [url])

	useEffect(() => {
		setIndex(0)
		if (import.meta.env.FIREFOX) {
			setSources(network)
			return
		}
		let active = true
		resolveChromeIcon(url, px)
			.then((src) => active && setSources(src ? [src] : network))
			.catch(() => active && setSources(network))
		return () => {
			active = false
		}
	}, [url, px, network])

	const placeholder = (
		<div
			className={className}
			style={{
				width: size,
				height: size,
				borderRadius: 4,
				background: "rgba(127,127,127,0.15)",
				flexShrink: 0,
			}}
		/>
	)

	// null: still asking Chrome's store (a local read, a few ms).
	if (!sources || index >= sources.length) return placeholder

	return (
		<img
			key={sources[index]}
			src={sources[index]}
			alt=""
			width={size}
			height={size}
			decoding="async"
			draggable={false}
			referrerPolicy="no-referrer"
			className={className}
			style={{
				width: size,
				height: size,
				objectFit: "contain",
				flexShrink: 0,
			}}
			onError={() => {
				setIndex((i) => i + 1)
			}}
		/>
	)
}
