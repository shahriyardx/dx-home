import { type KeyboardEvent, type PointerEvent, useRef, useState } from "react"
import {
	DIAL_SIZE,
	hourAt,
	hourHand,
	INNER_R,
	minuteAt,
	OUTER_R,
	onRing,
	polar,
} from "@/features/tasks/lib/dial"
import { cn } from "@/shared/lib/utils"

type Time = { h: number; m: number }

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const HOURS_INNER = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)
const pad = (n: number) => String(n).padStart(2, "0")

/**
 * Material-style clock face: big hour and minute boxes on top, a dial below.
 * Pick the hour, it moves on to minutes. Click or drag on the face; the dial
 * is also a slider for the keyboard (arrows step 1 hour or 1 minute).
 */
export function TimeDial({
	value,
	onChange,
	use24h,
}: {
	value: Time
	onChange: (value: Time) => void
	use24h: boolean
}) {
	const [mode, setMode] = useState<"hour" | "minute">("hour")
	const [dragging, setDragging] = useState(false)
	const pm = value.h >= 12

	const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
		const box = e.currentTarget.getBoundingClientRect()
		const { deg, dist } = polar(
			((e.clientX - box.left) / box.width) * DIAL_SIZE,
			((e.clientY - box.top) / box.height) * DIAL_SIZE,
		)
		if (mode === "hour")
			onChange({ ...value, h: hourAt(deg, dist, { use24h, pm }) })
		else onChange({ ...value, m: minuteAt(deg) })
	}

	const onKeyDown = (e: KeyboardEvent) => {
		const step =
			e.key === "ArrowUp" || e.key === "ArrowRight"
				? 1
				: e.key === "ArrowDown" || e.key === "ArrowLeft"
					? -1
					: 0
		if (!step) return
		e.preventDefault()
		if (mode === "hour") onChange({ ...value, h: (value.h + step + 24) % 24 })
		else onChange({ ...value, m: (value.m + step + 60) % 60 })
	}

	// Hand: angle and length to the selected value.
	const hand =
		mode === "hour"
			? hourHand(value.h, use24h)
			: { deg: value.m * 6, r: OUTER_R }

	// Unwrapped angle, so the hand takes the short way round: 330° → 0° turns
	// 30° forward, not 330° back. Updated during render on purpose — it is
	// derived state, and a second render computes the same value.
	const angleRef = useRef(hand.deg)
	const delta = ((((hand.deg - angleRef.current) % 360) + 540) % 360) - 180
	angleRef.current += delta
	const angle = angleRef.current

	// Between the 5-minute labels there is no number to show in the bubble.
	const offLabel = mode === "minute" && value.m % 5 !== 0
	const bubbleText =
		mode === "minute"
			? pad(value.m)
			: use24h && (value.h === 0 || value.h > 12)
				? pad(value.h)
				: String(value.h % 12 || 12)

	const shownHour = use24h ? pad(value.h) : String(value.h % 12 || 12)

	const labels =
		mode === "hour"
			? [
					...HOURS_12.map((n, i) => ({
						n,
						text: String(n),
						r: OUTER_R,
						deg: i * 30,
					})),
					...(use24h
						? HOURS_INNER.map((n, i) => ({
								n,
								text: pad(n),
								r: INNER_R,
								deg: i * 30,
							}))
						: []),
				]
			: MINUTES.map((n, i) => ({ n, text: pad(n), r: OUTER_R, deg: i * 30 }))

	// While dragging the hand follows the pointer 1:1; easing would lag it.
	const motion = dragging
		? ""
		: "transition-[rotate,height] duration-300 ease-expressive"

	const box = (on: boolean) =>
		cn(
			"pressable h-[4.5rem] w-24 rounded-[0.875rem] text-[3.25rem] font-semibold leading-none tabular-nums transition-colors duration-200",
			on ? "bg-tonal text-on-tonal" : "bg-field-hover text-fg",
		)

	return (
		<div className="flex flex-col items-center gap-5">
			<div className="flex items-center gap-1.5">
				<button
					type="button"
					className={box(mode === "hour")}
					onClick={() => setMode("hour")}
					aria-label="Hour"
				>
					{shownHour}
				</button>
				<span className="text-[3.25rem] font-semibold leading-none text-muted">
					:
				</span>
				<button
					type="button"
					className={box(mode === "minute")}
					onClick={() => setMode("minute")}
					aria-label="Minute"
				>
					{pad(value.m)}
				</button>
				{!use24h && (
					<div className="ms-2 flex h-[4.5rem] flex-col gap-1">
						{(["AM", "PM"] as const).map((half) => {
							const on = (half === "PM") === pm
							return (
								<button
									type="button"
									key={half}
									aria-pressed={on}
									onClick={() =>
										on || onChange({ ...value, h: (value.h + 12) % 24 })
									}
									className={cn(
										"pressable flex-1 rounded-[0.625rem] px-3 text-sm font-bold transition-colors duration-200",
										on
											? "bg-tonal text-on-tonal"
											: "bg-field-hover text-muted hover:text-fg",
									)}
								>
									{half}
								</button>
							)
						})}
					</div>
				)}
			</div>

			<div
				role="slider"
				tabIndex={0}
				aria-label={mode === "hour" ? "Hour" : "Minute"}
				aria-valuemin={0}
				aria-valuemax={mode === "hour" ? 23 : 59}
				aria-valuenow={mode === "hour" ? value.h : value.m}
				onKeyDown={onKeyDown}
				onPointerDown={(e) => {
					e.currentTarget.setPointerCapture(e.pointerId)
					setDragging(true)
					fromPointer(e)
				}}
				onPointerMove={(e) => dragging && fromPointer(e)}
				onPointerUp={() => {
					setDragging(false)
					if (mode === "hour") setMode("minute")
				}}
				className="relative size-64 shrink-0 touch-none select-none rounded-full bg-field-hover outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
			>
				{/* Keyed by mode: hours and minutes trade places with a fade. */}
				<div key={mode} className="pop-in absolute inset-0">
					{labels.map((l) => {
						const p = onRing(l.deg, l.r)
						return (
							<span
								key={`${l.r}-${l.n}`}
								style={{ left: p.x, top: p.y }}
								className={cn(
									"pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-medium tabular-nums",
									l.r === INNER_R ? "text-xs text-muted" : "text-sm text-fg",
								)}
							>
								{l.text}
							</span>
						)
					})}
				</div>

				<span
					aria-hidden="true"
					className="absolute top-1/2 left-1/2 size-2 -translate-1/2 rounded-full bg-primary"
				/>
				{/*
				 * The hand grows up from the centre and rotates about its foot.
				 * The selected value rides in the bubble at its tip, counter-
				 * rotated to stay upright, so no label has to change colour.
				 */}
				<div
					aria-hidden="true"
					style={{ height: hand.r, rotate: `${angle}deg` }}
					className={cn(
						"pointer-events-none absolute bottom-1/2 left-1/2 -ms-px w-0.5 origin-bottom bg-primary",
						motion,
					)}
				>
					<span className="absolute top-0 left-1/2 grid size-10 -translate-1/2 place-items-center rounded-full bg-primary">
						<span
							style={{ rotate: `${-angle}deg` }}
							className={cn(
								"font-bold tabular-nums text-on-primary",
								labelSize(mode, value.h, use24h),
								motion,
							)}
						>
							{offLabel ? (
								<span className="block size-1.5 rounded-full bg-on-primary" />
							) : (
								bubbleText
							)}
						</span>
					</span>
				</div>
			</div>
		</div>
	)
}

/** Inner-ring hours are set smaller, like their labels. */
function labelSize(mode: "hour" | "minute", h: number, use24h: boolean) {
	return mode === "hour" && use24h && (h === 0 || h > 12)
		? "text-xs"
		: "text-sm"
}
