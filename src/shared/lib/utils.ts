import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Schemes that are safe to navigate to. Anything else — `javascript:` above all —
 * inherits the extension's origin when opened from an extension page, which would
 * hand the caller our `tabs`/`topSites`/`storage` permissions.
 */
export function isSafeWebUrl(url: string) {
	try {
		const { protocol } = new URL(url)
		return protocol === "http:" || protocol === "https:"
	} catch {
		return false
	}
}

/** As isSafeWebUrl, plus inline images, for values used only as an image source. */
export function isSafeImageUrl(url: string) {
	try {
		const { protocol } = new URL(url)
		if (protocol === "http:" || protocol === "https:") return true
		return protocol === "data:" && url.startsWith("data:image/")
	} catch {
		return false
	}
}

/** Opens a URL in a new tab, dropping any scheme that isSafeWebUrl rejects. */
export function openExternal(url: string) {
	if (!isSafeWebUrl(url)) return
	window.open(url, "_blank", "noopener,noreferrer")
}

/**
 * Escapes a URL for interpolation into a CSS `url("…")` token. Chrome leaves `)`
 * and `,` unescaped in a query string, so an unquoted url() can be broken out of
 * to append a second, attacker-chosen fetch.
 */
export function cssUrl(url: string) {
	return `url("${url.replace(/["\\]/g, "\\$&")}")`
}
