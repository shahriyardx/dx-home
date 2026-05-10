import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
	Field,
	FieldContent,
	FieldLabel,
	FieldError,
} from "@/components/ui/field"
import type { UseFormReturn } from "react-hook-form"
import type { BookmarkType } from "."

const BookmarkForm = ({
	form,
	handleSubmit,
}: {
	form: UseFormReturn<BookmarkType>
	handleSubmit: (values: BookmarkType) => void
}) => {
	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
			<Controller
				name="label"
				control={form.control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor={field.name}>Name</FieldLabel>
						<FieldContent>
							<Input {...field} id={field.name} placeholder="Example" />
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</FieldContent>
					</Field>
				)}
			/>

			<Controller
				name="url"
				control={form.control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor={field.name}>URL</FieldLabel>
						<FieldContent>
							<Input
								{...field}
								id={field.name}
								placeholder="https://example.com"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</FieldContent>
					</Field>
				)}
			/>
		</form>
	)
}

export default BookmarkForm
