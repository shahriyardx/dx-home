import { Input } from "@/components/ui/input"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
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
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<div className="space-y-4">
					<FormField
						control={form.control}
						name="label"
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
						name="url"
						render={({ field }) => (
							<FormItem>
								<FormLabel>URL</FormLabel>
								<FormControl>
									<Input placeholder="https://example.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</form>
		</Form>
	)
}

export default BookmarkForm
