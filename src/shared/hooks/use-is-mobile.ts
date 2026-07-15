import { useState, useEffect } from "react"

const QUERY = "(max-width: 1024px)"

export function useIsMobile() {
	const [isMobile, setIsMobile] = useState(() => {
		if (typeof window === "undefined") return false
		return window.matchMedia(QUERY).matches
	})

	useEffect(() => {
		const mql = window.matchMedia(QUERY)
		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
		mql.addEventListener("change", handler)
		return () => mql.removeEventListener("change", handler)
	}, [])

	return isMobile
}
