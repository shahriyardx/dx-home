import { type FormEvent, useEffect, useState } from "react"
import { useStorageItem } from "@/shared/storage"
import { TextField } from "@/shared/ui/text-field"
import { findPlace, weather } from "../weather"

/**
 * City field. Starts filled with the detected city. Enter or leaving the field
 * saves; a typed city stops auto-detection, and an empty field turns weather
 * off.
 */
export function WeatherSetting() {
	const { value, setValue } = useStorageItem(weather)
	const [query, setQuery] = useState("")
	const [error, setError] = useState<string>()
	const [busy, setBusy] = useState(false)

	const saved = value.off ? "" : (value.place?.name ?? "")

	// Show the saved place once storage has loaded, and when detection fills it.
	useEffect(() => {
		setQuery(saved)
	}, [saved])

	const save = async (e?: FormEvent) => {
		e?.preventDefault()
		const q = query.trim()
		if (q === saved) return

		setError(undefined)
		if (!q) {
			await setValue({ ...value, place: null, off: true, forecast: null })
			return
		}

		setBusy(true)
		try {
			const place = await findPlace(q)
			if (!place) {
				setError("City not found")
				return
			}
			await setValue({ place, auto: false, off: false, forecast: null })
		} catch {
			setError("Couldn't reach the weather service")
		} finally {
			setBusy(false)
		}
	}

	const detect = () =>
		setValue({ place: null, auto: true, off: false, forecast: null })

	return (
		<form onSubmit={save} className="flex flex-col gap-1.5 px-3 py-2.5">
			<TextField
				label="Weather"
				placeholder="City"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onBlur={() => save()}
				disabled={busy}
				error={error}
			/>
			{!value.auto && (
				<button
					type="button"
					onClick={detect}
					className="pressable self-start rounded-field px-2 py-1 text-xs font-semibold text-primary hover:bg-surface-hover"
				>
					Detect automatically
				</button>
			)}
		</form>
	)
}
