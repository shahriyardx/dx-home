import { useEffect } from "react"
import { useStorageItem } from "@/shared/storage"
import {
	detectPlace,
	fetchForecast,
	samePlace,
	today,
	weather,
} from "./weather"
import { pickCurrent } from "./lib"

/**
 * Keeps the saved place and forecast fresh, at most one call of each per day:
 *   - IP lookup when no place is saved, or the place was detected on an
 *     earlier day (so it follows the user when they travel).
 *   - Forecast when there is none for this place, or it was fetched on an
 *     earlier day.
 * A failed call keeps the last good data, or shows nothing.
 */
export function useWeather() {
	const { value, loaded } = useStorageItem(weather)
	const { place, auto, locatedOn, off, forecast } = value

	useEffect(() => {
		if (!loaded || off) return
		if (place && (!auto || locatedOn === today())) return

		let cancelled = false
		detectPlace()
			.then(async (found) => {
				const current = await weather.get()
				// The user may have typed a city meanwhile; that wins.
				if (cancelled || !current.auto || current.off) return
				await weather.set({
					...current,
					place: found ?? current.place,
					locatedOn: today(),
					forecast: samePlace(found, current.place) ? current.forecast : null,
				})
			})
			.catch(async () => {
				// Rate-limited or offline: still counts as today's try, so a
				// failing lookup is not repeated on every new tab.
				const current = await weather.get()
				if (!cancelled && current.auto)
					await weather.set({ ...current, locatedOn: today() })
			})
		return () => {
			cancelled = true
		}
	}, [loaded, off, place, auto, locatedOn])

	useEffect(() => {
		if (!loaded || off || !place) return
		if (forecast && forecast.fetchedOn === today()) return

		let cancelled = false
		fetchForecast(place)
			.then(async (next) => {
				const current = await weather.get()
				// The place may have moved while this was in flight; writing now
				// would attach this forecast to the wrong city.
				if (cancelled || !samePlace(current.place, place)) return
				await weather.set({ ...current, forecast: next })
			})
			.catch(() => {})
		return () => {
			cancelled = true
		}
	}, [loaded, off, place, forecast])

	if (off || !place || !forecast) return null
	return pickCurrent(forecast.hours, Date.now())
}
