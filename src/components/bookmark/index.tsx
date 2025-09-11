import z from "zod"

export const bookmarkSchema = z.object({
	label: z.string().min(1),
	url: z.url(),
})

export type BookmarkType = z.infer<typeof bookmarkSchema>
