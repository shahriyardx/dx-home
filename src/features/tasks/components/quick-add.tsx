import { ArrowUp, Plus } from "lucide-react"
import {
	type FormEvent,
	type KeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react"
import { useTasksContext } from "@/features/tasks/tasks-context"
import { cn } from "@/shared/lib/utils"
import { DateChip, TimeChip } from "./deadline-picker"

/** The date popover renders in a portal; clicks and keys inside it are ours. */
const inPopover = (target: EventTarget | null) =>
	target instanceof Element && !!target.closest('[role="dialog"]')

/**
 * A one-line "Add a task" field that grows in place into name, note, and
 * deadline. It is one element the whole time, so opening is a morph, not a
 * swap. Enter adds and stays open for the next one; Esc closes. A click
 * outside closes it only while nothing has been typed, so a stray click never
 * throws work away.
 */
export function QuickAdd() {
	const { addTask } = useTasksContext()
	const [open, setOpen] = useState(false)
	const [title, setTitle] = useState("")
	const [note, setNote] = useState("")
	const [deadline, setDeadline] = useState<Date>()
	const formRef = useRef<HTMLFormElement>(null)
	const titleRef = useRef<HTMLInputElement>(null)

	const empty = !title.trim() && !note.trim() && !deadline

	const close = () => {
		setTitle("")
		setNote("")
		setDeadline(undefined)
		setOpen(false)
		titleRef.current?.blur()
	}

	useEffect(() => {
		if (!open || !empty) return
		const onDown = (e: PointerEvent) => {
			if (formRef.current?.contains(e.target as Node) || inPopover(e.target))
				return
			setOpen(false)
			titleRef.current?.blur()
		}
		document.addEventListener("pointerdown", onDown)
		return () => document.removeEventListener("pointerdown", onDown)
	}, [open, empty])

	const submit = async (e: FormEvent) => {
		e.preventDefault()
		const t = title.trim()
		if (!t) return
		await addTask({ title: t, description: note.trim() || undefined, deadline })
		setTitle("")
		setNote("")
		setDeadline(undefined)
		titleRef.current?.focus()
	}

	const onKeyDown = (e: KeyboardEvent) => {
		// React bubbles portal events through the tree: Esc in the date popover
		// would otherwise close this box too.
		if (e.key === "Escape" && !inPopover(e.target)) close()
	}

	return (
		<form
			ref={formRef}
			onSubmit={submit}
			onKeyDown={onKeyDown}
			onClick={() => {
				if (open) return
				setOpen(true)
				titleRef.current?.focus()
			}}
			className={cn(
				"bg-field transition-[border-radius,background-color] duration-300",
				open
					? "rounded-[1.375rem]"
					: "cursor-text rounded-[1rem] hover:bg-field-hover",
			)}
		>
			<div
				className={cn(
					"flex items-center transition-[padding,height] duration-300",
					open ? "h-11 px-4 pt-1" : "h-12 px-3.5",
				)}
			>
				<Plus
					aria-hidden="true"
					className={cn(
						"shrink-0 text-primary transition-[width,margin,opacity] duration-300",
						open ? "me-0 w-0 opacity-0" : "me-2.5 w-[1.125rem] opacity-100",
					)}
				/>
				<input
					ref={titleRef}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					onFocus={() => setOpen(true)}
					placeholder={open ? "Task name" : "Add a task"}
					aria-label="Task name"
					className="w-full min-w-0 bg-transparent text-[15px] font-semibold text-fg outline-none placeholder:font-normal placeholder:text-muted/80"
				/>
			</div>

			<div className={cn("collapsible", open && "expanded")} inert={!open}>
				<div className="min-h-0 overflow-hidden">
					<div className="px-4 pb-3">
						<input
							value={note}
							onChange={(e) => setNote(e.target.value)}
							placeholder="Note"
							aria-label="Note"
							className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted/70"
						/>
						<div className="mt-3.5 flex items-center gap-1.5">
							<DateChip value={deadline} onChange={setDeadline} />
							{/* A time means nothing without a day, so it waits for one. */}
							{deadline && (
								<span className="pop-in">
									<TimeChip value={deadline} onChange={setDeadline} />
								</span>
							)}
							<button
								type="submit"
								title="Add task"
								disabled={!title.trim()}
								className="pressable ms-auto grid size-9 place-items-center rounded-[0.875rem] bg-primary text-on-primary transition-[opacity,scale] duration-300 disabled:scale-90 disabled:opacity-40"
							>
								<ArrowUp className="size-[1.125rem]" strokeWidth={2.4} />
							</button>
						</div>
					</div>
				</div>
			</div>
		</form>
	)
}
