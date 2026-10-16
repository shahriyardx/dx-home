import { Switch as BaseSwitch } from "@base-ui/react/switch"
import type { ComponentProps } from "react"

/** M3 switch: the thumb grows when on, so state reads without colour. */
export function Switch(props: ComponentProps<typeof BaseSwitch.Root>) {
	return (
		<BaseSwitch.Root
			className="flex h-8 w-13 shrink-0 items-center rounded-[1rem] bg-field p-1 transition-colors data-checked:bg-primary"
			{...props}
		>
			<BaseSwitch.Thumb className="ms-1 size-4 rounded-full bg-muted transition-[margin,width,height,background-color] duration-200 data-checked:ms-5 data-checked:size-6 data-checked:bg-on-primary" />
		</BaseSwitch.Root>
	)
}
