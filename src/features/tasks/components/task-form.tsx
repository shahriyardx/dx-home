import { useCallback } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { taskSchema, type TaskType } from "@/features/tasks/schema"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/shared/ui/calendar"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { fieldClass, TextField } from "@/shared/ui/text-field"
import { useTasksContext } from "@/features/tasks/tasks-context"

type Props = {
	onSuccess: () => void
	defaultValues?: TaskType
	onSubmit?: (values: TaskType) => Promise<void>
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
const AMPM = ["AM", "PM"] as const

const TaskForm = ({ onSuccess, defaultValues, onSubmit }: Props) => {
	const { addTask } = useTasksContext()

	const form = useForm({
		resolver: zodResolver(taskSchema),
		defaultValues: defaultValues ?? {
			title: "",
			description: "",
			deadline: undefined,
		},
	})

	const handleSubmit = useCallback(
		async (values: TaskType) => {
			if (onSubmit) {
				await onSubmit(values)
			} else {
				await addTask(values)
			}
			form.reset({
				title: "",
				description: "",
				deadline: undefined,
			})
			onSuccess()
		},
		[addTask, form, onSuccess, onSubmit],
	)

	function handleDateSelect(date: Date | undefined) {
		if (date) {
			form.setValue("deadline", date)
		}
	}

	function handleTimeChange(type: "hour" | "minute" | "ampm", value: string) {
		const currentDate = form.getValues("deadline") || new Date()
		const newDate = new Date(currentDate)

		if (type === "hour") {
			const hour12 = parseInt(value, 10)
			const currentHour = newDate.getHours()
			const isPM = currentHour >= 12
			if (hour12 === 12) {
				newDate.setHours(isPM ? 12 : 0)
			} else {
				newDate.setHours(isPM ? hour12 + 12 : hour12)
			}
		} else if (type === "minute") {
			newDate.setMinutes(parseInt(value, 10))
		} else if (type === "ampm") {
			const hours = newDate.getHours()
			if (value === "AM" && hours >= 12) {
				newDate.setHours(hours - 12)
			} else if (value === "PM" && hours < 12) {
				newDate.setHours(hours + 12)
			}
		}

		newDate.setSeconds(0)
		newDate.setMilliseconds(0)
		form.setValue("deadline", newDate)
	}

	const deadlineValue = form.watch("deadline")

	const timeButton = (active: boolean | undefined) =>
		cn(
			"pressable h-9 w-12 shrink-0 rounded-field text-sm font-medium",
			active ? "bg-primary text-on-primary" : "hover:bg-field",
		)

	return (
		<form
			onSubmit={form.handleSubmit(handleSubmit)}
			className="flex flex-col gap-4"
		>
			<Controller
				name="title"
				control={form.control}
				render={({ field, fieldState }) => (
					<TextField
						{...field}
						label="Title"
						placeholder="What needs to be done?"
						error={fieldState.error?.message}
					/>
				)}
			/>

			<Controller
				name="description"
				control={form.control}
				render={({ field }) => (
					<TextField
						{...field}
						multiline
						label="Description"
						placeholder="Optional"
					/>
				)}
			/>

			<Controller
				name="deadline"
				control={form.control}
				render={({ field }) => (
					<div className="flex flex-col gap-1.5">
						<span className="text-[13px] font-semibold text-muted">
							Deadline
						</span>
						<Popover>
							<PopoverTrigger
								className={cn(
									fieldClass,
									"flex h-11 items-center text-left",
									!field.value && "text-muted",
								)}
							>
								{field.value
									? format(field.value, "MMM d, yyyy · h:mm aa")
									: "No deadline"}
								<CalendarIcon className="ml-auto size-4 text-muted" />
							</PopoverTrigger>
							<PopoverContent className="w-auto">
								<div className="flex">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={handleDateSelect}
										autoFocus
									/>
									<div className="flex h-[19rem] gap-1 py-3 pe-3">
										<ScrollArea className="h-full">
											<div className="flex flex-col gap-0.5">
												{HOURS.toReversed().map((hour) => (
													<button
														type="button"
														key={hour}
														className={timeButton(
															deadlineValue &&
																deadlineValue.getHours() % 12 === hour % 12,
														)}
														onClick={() =>
															handleTimeChange("hour", hour.toString())
														}
													>
														{hour}
													</button>
												))}
											</div>
										</ScrollArea>
										<ScrollArea className="h-full">
											<div className="flex flex-col gap-0.5">
												{MINUTES.map((minute) => (
													<button
														type="button"
														key={minute}
														className={timeButton(
															deadlineValue?.getMinutes() === minute,
														)}
														onClick={() =>
															handleTimeChange("minute", minute.toString())
														}
													>
														{minute.toString().padStart(2, "0")}
													</button>
												))}
											</div>
										</ScrollArea>
										<div className="flex flex-col gap-0.5">
											{AMPM.map((ampm) => (
												<button
													type="button"
													key={ampm}
													className={timeButton(
														deadlineValue &&
															(ampm === "AM") === deadlineValue.getHours() < 12,
													)}
													onClick={() => handleTimeChange("ampm", ampm)}
												>
													{ampm}
												</button>
											))}
										</div>
									</div>
								</div>
								<div className="p-2 pt-0">
									<Button
										variant="ghost"
										size="sm"
										className="w-full"
										onClick={() => form.setValue("deadline", undefined)}
									>
										Clear deadline
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				)}
			/>

			<div className="flex justify-end pt-1">
				<Button type="submit" variant="primary">
					{defaultValues ? "Save" : "Add task"}
				</Button>
			</div>
		</form>
	)
}

export default TaskForm
