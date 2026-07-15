import { Check } from "lucide-react"
import { cn, cssUrl } from "@/shared/lib/utils"
import { useBackground, PRESETS } from "../use-background"

function Preview({ value }: { value: string }) {
	return (
		<div
			className="w-full h-full bg-cover bg-center rounded-md"
			style={{ backgroundImage: cssUrl(value) }}
		/>
	)
}

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
						className={cn(
							"relative aspect-video rounded-lg border-2 overflow-hidden transition-all hover:ring-2 hover:ring-ring",
							isActive ? "border-ring ring-2 ring-ring" : "border-border",
						)}
					>
						<Preview value={preset.value} />
						{isActive && (
							<div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
								<Check className="size-3" />
							</div>
						)}
						<div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/60 to-transparent p-1.5">
							<span className="text-[11px] text-white font-medium">
								{preset.name}
							</span>
						</div>
					</button>
				)
			})}
		</div>
	)
}
