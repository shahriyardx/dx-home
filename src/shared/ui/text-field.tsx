import { Field } from "@base-ui/react/field"
import type { ComponentProps } from "react"
import { cn } from "@/shared/lib/utils"

/** Filled field: the control is a well one tone above its container. */
export const fieldClass =
	"w-full rounded-field bg-field px-3.5 text-sm text-fg outline-none transition-colors placeholder:text-muted/70 hover:bg-field-hover focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary data-invalid:outline-2 data-invalid:outline-danger"

type Props = Omit<ComponentProps<typeof Field.Control>, "className"> & {
	label: string
	error?: string
	multiline?: boolean
}

export function TextField({ label, error, multiline, ...props }: Props) {
	return (
		<Field.Root invalid={!!error} className="flex flex-col gap-1.5">
			<Field.Label className="text-[13px] font-semibold text-muted">
				{label}
			</Field.Label>
			<Field.Control
				className={cn(fieldClass, multiline ? "min-h-20 py-2.5" : "h-11")}
				render={multiline ? <textarea /> : undefined}
				{...props}
			/>
			{error && (
				<Field.Error match className="text-xs text-danger">
					{error}
				</Field.Error>
			)}
		</Field.Root>
	)
}
