import z from "zod"

export const taskSchema = z.object({
	title: z.string().min(1, "title is required"),
	description: z.string().optional(),
	deadline: z.date().optional(),
})

export type TaskType = z.infer<typeof taskSchema>
