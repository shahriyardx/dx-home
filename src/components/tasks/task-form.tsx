import { useCallback } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
	Field,
	FieldContent,
	FieldLabel,
	FieldError,
} from "@/components/ui/field"
import { taskSchema, type TaskType } from "."
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "../ui/calendar"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { useTasks } from "@/hooks/useTasks"

type Props = {
	onSuccess: () => void
	defaultValues?: TaskType
	onSubmit?: (values: TaskType) => Promise<void>
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
const AMPM = ["AM", "PM"] as const

const TaskForm = ({ onSuccess, defaultValues, onSubmit }: Props) => {
	const { addTask } = useTasks()

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

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
			<Controller
				name="title"
				control={form.control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor={field.name}>Title</FieldLabel>
						<FieldContent>
							<Input
								{...field}
								id={field.name}
								placeholder="What needs to be done?"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</FieldContent>
					</Field>
				)}
			/>

			<Controller
				name="description"
				control={form.control}
				render={({ field }) => (
					<Field>
						<FieldLabel htmlFor={field.name}>Description</FieldLabel>
						<FieldContent>
							<Textarea
								{...field}
								id={field.name}
								placeholder="Optional details..."
							/>
						</FieldContent>
					</Field>
				)}
			/>

			<Controller
				name="deadline"
				control={form.control}
				render={({ field }) => (
					<Field>
						<FieldLabel htmlFor={field.name}>Deadline</FieldLabel>
						<FieldContent>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full pl-3 text-left font-normal",
											!field.value && "text-muted-foreground",
										)}
									>
										{field.value ? (
											format(field.value, "MM/dd/yyyy hh:mm aa")
										) : (
											<span>No deadline</span>
										)}
										<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<div className="sm:flex">
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={handleDateSelect}
											autoFocus
										/>
										<div className="flex flex-col sm:flex-row sm:h-75 divide-y sm:divide-y-0 sm:divide-x">
											<ScrollArea className="w-64 sm:w-auto">
												<div className="flex sm:flex-col p-2">
													{HOURS.toReversed().map((hour) => (
														<Button
															key={hour}
															size="icon"
															variant={
																deadlineValue &&
																deadlineValue.getHours() % 12 === hour % 12
																	? "default"
																	: "ghost"
															}
															className="sm:w-full shrink-0 aspect-square"
															onClick={() =>
																handleTimeChange("hour", hour.toString())
															}
														>
															{hour}
														</Button>
													))}
												</div>
												<ScrollBar
													orientation="horizontal"
													className="sm:hidden"
												/>
											</ScrollArea>
											<ScrollArea className="w-64 sm:w-auto">
												<div className="flex sm:flex-col p-2">
													{MINUTES.map((minute) => (
														<Button
															key={minute}
															size="icon"
															variant={
																deadlineValue &&
																deadlineValue.getMinutes() === minute
																	? "default"
																	: "ghost"
															}
															className="sm:w-full shrink-0 aspect-square"
															onClick={() =>
																handleTimeChange("minute", minute.toString())
															}
														>
															{minute.toString().padStart(2, "0")}
														</Button>
													))}
												</div>
												<ScrollBar
													orientation="horizontal"
													className="sm:hidden"
												/>
											</ScrollArea>
											<ScrollArea>
												<div className="flex sm:flex-col p-2">
													{AMPM.map((ampm) => (
														<Button
															key={ampm}
															size="icon"
															variant={
																deadlineValue &&
																((ampm === "AM" &&
																	deadlineValue.getHours() < 12) ||
																	(ampm === "PM" &&
																		deadlineValue.getHours() >= 12))
																	? "default"
																	: "ghost"
															}
															className="sm:w-full shrink-0 aspect-square"
															onClick={() => handleTimeChange("ampm", ampm)}
														>
															{ampm}
														</Button>
													))}
												</div>
											</ScrollArea>
										</div>
									</div>
									<div className="border-t border-border p-2">
										<Button
											variant="ghost"
											size="sm"
											className="w-full text-xs text-muted-foreground"
											onClick={() => form.setValue("deadline", undefined)}
										>
											Clear deadline
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						</FieldContent>
					</Field>
				)}
			/>

			<div className="pt-2">
				<Button type="submit">{defaultValues ? "Save" : "Submit"}</Button>
			</div>
		</form>
	)
}

export default TaskForm
