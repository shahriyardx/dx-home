import z from "zod"

export const taskSchema = z.object({
	title: z.string().min(5, "title is too short"),
	deadline: z.date("please select deadline"),
})

export type TaskType = z.infer<typeof taskSchema>
