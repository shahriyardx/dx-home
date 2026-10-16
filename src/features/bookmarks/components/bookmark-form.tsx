import { Controller, type UseFormReturn } from "react-hook-form"
import type { BookmarkType } from "@/features/bookmarks/schema"
import { TextField } from "@/shared/ui/text-field"

const BookmarkForm = ({
	form,
	handleSubmit,
}: {
	form: UseFormReturn<BookmarkType>
	handleSubmit: (values: BookmarkType) => void
}) => {
	return (
		<form
			onSubmit={form.handleSubmit(handleSubmit)}
			className="flex flex-col gap-4"
		>
			<Controller
				name="label"
				control={form.control}
				render={({ field, fieldState }) => (
					<TextField
						{...field}
						label="Name"
						placeholder="Example"
						error={fieldState.error?.message}
					/>
				)}
			/>
			<Controller
				name="url"
				control={form.control}
				render={({ field, fieldState }) => (
					<TextField
						{...field}
						label="URL"
						placeholder="https://example.com"
						error={fieldState.error?.message}
					/>
				)}
			/>
		</form>
	)
}

export default BookmarkForm
