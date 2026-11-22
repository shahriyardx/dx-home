import { useEffect, useState } from "react"

/** Re-render on a slow tick so badges and groups follow the clock. */
export function useNow(ms = 30_000) {
	const [now, setNow] = useState(() => new Date())
	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), ms)
		return () => clearInterval(id)
	}, [ms])
	return now
}
