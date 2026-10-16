/**
 * Deadline date math. Local getters throughout — toISOString() is UTC and
 * shifts the day.
 */

/** Next full hour, so "Today" is never already past. 23:xx clamps to 23:59. */
export function defaultTime(now: Date) {
	const h = now.getHours()
	return h === 23 ? { h: 23, m: 59 } : { h: h + 1, m: 0 }
}

/** `day`'s date with the time kept from `current`, or the default time. */
export function withDate(day: Date, current: Date | undefined, now: Date) {
	const { h, m } = current
		? { h: current.getHours(), m: current.getMinutes() }
		: defaultTime(now)
	return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m)
}

/** `current`'s date (or today) at "HH:MM". Returns `current` on bad input. */
export function withTime(current: Date | undefined, hhmm: string, now: Date) {
	const match = /^(\d{2}):(\d{2})$/.exec(hhmm)
	if (!match) return current
	const day = current ?? now
	return new Date(
		day.getFullYear(),
		day.getMonth(),
		day.getDate(),
		Number(match[1]),
		Number(match[2]),
	)
}

/** "HH:MM" for <input type="time">. */
export function toTimeValue(date: Date | undefined) {
	if (!date) return ""
	const pad = (n: number) => String(n).padStart(2, "0")
	return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function addDays(date: Date, days: number) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function sameDay(a: Date | undefined, b: Date) {
	return (
		!!a &&
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	)
}
