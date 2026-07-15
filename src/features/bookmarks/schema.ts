import z from "zod"

export const bookmarkSchema = z.object({
	label: z.string().min(1),
	// Bare z.url() accepts any scheme, javascript: and data: included. Constrain
	// the protocol only — z.httpUrl() would also pin the hostname to a dotted
	// domain and reject localhost and IP addresses.
	url: z.url({ protocol: /^https?$/ }),
})

export type BookmarkType = z.infer<typeof bookmarkSchema>
