import { Button as BaseButton } from "@base-ui/react/button"
import type { ComponentProps } from "react"
import { cn } from "@/shared/lib/utils"

const VARIANTS = {
	// One colour for "what can I click": the main action on a screen.
	primary: "bg-primary text-on-primary hover:bg-primary/90",
	tonal: "bg-tonal text-on-tonal hover:bg-tonal/85",
	neutral: "bg-field text-fg hover:bg-field-hover",
	ghost: "text-muted hover:bg-field hover:text-fg",
	danger:
		"bg-danger-container text-on-danger-container hover:bg-danger-container/85",
}

// Pills use half their height, not rounded-full: an infinite radius cannot
// interpolate into the press shape.
const SIZES = {
	sm: "h-8 gap-1.5 rounded-[1rem] px-3 text-[13px]",
	md: "h-10 gap-2 rounded-[1.25rem] px-4 text-sm",
	"icon-sm": "size-8 rounded-[1rem]",
	icon: "size-10 rounded-[1.25rem]",
}

export type ButtonProps = ComponentProps<typeof BaseButton> & {
	variant?: keyof typeof VARIANTS
	size?: keyof typeof SIZES
	className?: string
}

export function buttonClass(
	variant: keyof typeof VARIANTS = "neutral",
	size: keyof typeof SIZES = "md",
) {
	return cn(
		"pressable inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap select-none",
		"disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
		VARIANTS[variant],
		SIZES[size],
	)
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
	return (
		<BaseButton
			className={cn(buttonClass(variant, size), className)}
			{...props}
		/>
	)
}
