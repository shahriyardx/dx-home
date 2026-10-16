import { useCallback } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { taskSchema, type TaskType } from "@/features/tasks/schema"
import { Button } from "@/shared/ui/button"
import { TextField } from "@/shared/ui/text-field"
import { DeadlinePicker } from "./deadline-picker"
import { useTasksContext } from "@/features/tasks/tasks-context"

type Props = {
	onSuccess: () => void
	defaultValues?: TaskType
	onSubmit?: (values: TaskType) => Promise<void>
}

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
					<DeadlinePicker value={field.value} onChange={field.onChange} />
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
