import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
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
}

const TaskForm = ({ onSuccess }: Props) => {
	const { addTask } = useTasks()

	const form = useForm({
		resolver: zodResolver(taskSchema),
	})

	const handleSubmit = (values: TaskType) => {
		addTask(values)
		form.reset({
			title: "",
			deadline: new Date(),
		})
		onSuccess()
	}

	function handleDateSelect(date: Date | undefined) {
		if (date) {
			form.setValue("deadline", date)
		}
	}

	function handleTimeChange(type: "hour" | "minute" | "ampm", value: string) {
		const currentDate = form.getValues("deadline") || new Date()
		const newDate = new Date(currentDate)

		if (type === "hour") {
			const hour = parseInt(value, 10)
			newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour)
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

		form.setValue("deadline", newDate)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<div className="space-y-4">
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input placeholder="Example" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="deadline"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Deadline</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={"outline"}
												className={cn(
													"w-full pl-3 text-left font-normal",
													!field.value && "text-muted-foreground",
												)}
											>
												{field.value ? (
													format(field.value, "MM/dd/yyyy hh:mm aa")
												) : (
													<span>MM/DD/YYYY hh:mm aa</span>
												)}
												<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<div className="sm:flex">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={handleDateSelect}
												initialFocus
											/>
											<div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
												<ScrollArea className="w-64 sm:w-auto">
													<div className="flex sm:flex-col p-2">
														{Array.from({ length: 12 }, (_, i) => i + 1)
															.reverse()
															.map((hour) => (
																<Button
																	key={hour}
																	size="icon"
																	variant={
																		field.value &&
																		field.value.getHours() % 12 === hour % 12
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
														{Array.from({ length: 60 }, (_, i) => i).map(
															(minute) => (
																<Button
																	key={minute}
																	size="icon"
																	variant={
																		field.value &&
																		field.value.getMinutes() === minute
																			? "default"
																			: "ghost"
																	}
																	className="sm:w-full shrink-0 aspect-square"
																	onClick={() =>
																		handleTimeChange(
																			"minute",
																			minute.toString(),
																		)
																	}
																>
																	{minute.toString().padStart(2, "0")}
																</Button>
															),
														)}
													</div>
													<ScrollBar
														orientation="horizontal"
														className="sm:hidden"
													/>
												</ScrollArea>
												<ScrollArea className="">
													<div className="flex sm:flex-col p-2">
														{["AM", "PM"].map((ampm) => (
															<Button
																key={ampm}
																size="icon"
																variant={
																	field.value &&
																	((ampm === "AM" &&
																		field.value.getHours() < 12) ||
																		(ampm === "PM" &&
																			field.value.getHours() >= 12))
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
									</PopoverContent>
								</Popover>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="mt-5">
					<Button type="submit">Submit</Button>
				</div>
			</form>
		</Form>
	)
}

export default TaskForm
