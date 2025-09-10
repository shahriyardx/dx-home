import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { DialogProps } from "@radix-ui/react-dialog"
import { useForm } from "react-hook-form"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import z from "zod"
import { Bookmark, db } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"

export function BookmarkDialog({ children }: DialogProps) {
	const [open, setOpen] = useState(false)

	const bookmarkSchema = z.object({
		label: z.string().min(1),
		url: z.url(),
	})

	const form = useForm({
		resolver: zodResolver(bookmarkSchema),
	})

	const handleSubmit = async (values: z.infer<typeof bookmarkSchema>) => {
		await db.bookmarks.add(values)
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={(val) => setOpen(val)}>
			<Form {...form}>
				<form>
					<DialogTrigger asChild>{children}</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Add Bookmark</DialogTitle>
						</DialogHeader>
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
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								onClick={async () => {
									await form.trigger()
									if (form.formState.isValid) {
										handleSubmit(form.getValues())
									}
								}}
								className="cursor-pointer"
							>
								Save changes
							</Button>
						</DialogFooter>
					</DialogContent>
				</form>
			</Form>
		</Dialog>
	)
}
