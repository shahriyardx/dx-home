import { Check } from "lucide-react"
import { cn, cssUrl } from "@/shared/lib/utils"
import { useBackground, PRESETS } from "../use-background"

export function BackgroundGrid() {
	const { active, setBackground } = useBackground()

	return (
		<div className="grid grid-cols-2 gap-2">
			{PRESETS.map((preset) => {
				const isActive = active.id === preset.id
				return (
					<button
						type="button"
						key={preset.id}
						onClick={() => setBackground(preset)}
						title={preset.name}
						// The selected one tightens its corners: shape, not an outline,
						// says which is active.
						className={cn(
							"pressable relative aspect-video overflow-hidden bg-cover bg-center",
							isActive ? "rounded-press" : "rounded-[1.25rem]",
						)}
						style={{ backgroundImage: cssUrl(preset.value) }}
					>
						{isActive && (
							<span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-primary text-on-primary">
								<Check className="size-3.5" />
							</span>
						)}
						<span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-2.5 pt-4 pb-2 text-left text-xs font-semibold text-white">
							{preset.name}
						</span>
					</button>
				)
			})}
		</div>
	)
}
