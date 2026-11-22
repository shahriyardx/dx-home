import { defineStorageItem } from "@/shared/storage"

/**
 * Open-Meteo and GeoJS are free, need no key, and send
 * `Access-Control-Allow-Origin: *`, so extension pages can fetch them without a
 * host permission (and without a new install warning).
 */
const GEOCODE = "https://geocoding-api.open-meteo.com/v1/search"
const FORECAST = "https://api.open-meteo.com/v1/forecast"
const IP_LOOKUP = "https://get.geojs.io/v1/ip/geo.json"

export interface Place {
	name: string
	lat: number
	lon: number
}

export interface Hour {
	/** Epoch seconds at the start of the hour. */
	t: number
	temp: number
	code: number
	isDay: boolean
}

/**
 * Two days of hourly data from one call. The page picks the current hour
 * itself, so the API is hit once a day, not on every new tab.
 */
export interface Forecast {
	/** `Date.toDateString()` of the fetch, in the user's local time. */
	fetchedOn: string
	hours: Hour[]
}

export interface WeatherState {
	place: Place | null
	/** The place came from the IP address and is re-checked once a day. */
	auto: boolean
	/** `Date.toDateString()` of the last IP lookup. */
	locatedOn?: string
	/** The user cleared the city: weather is off and detection must not run. */
	off: boolean
	/** Belongs to `place`; cleared whenever the place moves. */
	forecast: Forecast | null
}

export const weather = defineStorageItem<WeatherState>("local", "dx-weather", {
	place: null,
	auto: true,
	off: false,
	forecast: null,
})

/** Local calendar day. toDateString uses local getters, unlike toISOString. */
export const today = () => new Date().toDateString()

export const samePlace = (a: Place | null, b: Place | null) =>
	a?.lat === b?.lat && a?.lon === b?.lon

export async function findPlace(query: string): Promise<Place | null> {
	const url = `${GEOCODE}?count=1&language=en&format=json&name=${encodeURIComponent(query)}`
	const res = await fetch(url)
	if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`)
	const hit = (await res.json()).results?.[0]
	if (!hit) return null
	return {
		name: [hit.name, hit.country].filter(Boolean).join(", "),
		lat: hit.latitude,
		lon: hit.longitude,
	}
}

/**
 * City-level location from the IP address: no setup and no "detect your
 * location" permission. Wrong behind a VPN; typing a city in settings
 * overrides it. GeoJS has no published rate limit (ipapi.co was tried and
 * answers non-browser-looking clients with a Cloudflare challenge).
 */
export async function detectPlace(): Promise<Place | null> {
	const res = await fetch(IP_LOOKUP)
	if (!res.ok) throw new Error(`IP lookup failed: ${res.status}`)
	const data = await res.json()
	// GeoJS returns coordinates as strings.
	const lat = Number.parseFloat(data.latitude)
	const lon = Number.parseFloat(data.longitude)
	if (Number.isNaN(lat) || Number.isNaN(lon)) return null
	return {
		name: [data.city, data.country].filter(Boolean).join(", "),
		lat,
		lon,
	}
}

export async function fetchForecast(place: Place): Promise<Forecast> {
	const url =
		`${FORECAST}?latitude=${place.lat}&longitude=${place.lon}` +
		"&hourly=temperature_2m,weather_code,is_day" +
		"&timezone=auto&timeformat=unixtime&forecast_days=2"
	const res = await fetch(url)
	if (!res.ok) throw new Error(`Forecast failed: ${res.status}`)
	const { hourly } = await res.json()
	return {
		fetchedOn: today(),
		hours: hourly.time.map((t: number, i: number) => ({
			t,
			// Raw °C; rounded at display so °F is not rounded twice.
			temp: hourly.temperature_2m[i],
			code: hourly.weather_code[i],
			isDay: hourly.is_day[i] === 1,
		})),
	}
}
