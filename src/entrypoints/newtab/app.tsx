import { useBackground, useSeed } from "@/features/backgrounds"
import { useNewtabSettings } from "@/features/settings"
import { useIsMobile } from "@/shared/hooks/use-is-mobile"
import { cssUrl } from "@/shared/lib/utils"
import { defineStorageItem, useStorageItem } from "@/shared/storage"
import LeftPanel from "@/entrypoints/newtab/components/left-panel"
import RightPanel from "@/entrypoints/newtab/components/right-panel"
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/shared/ui/resizable"
import { useRef } from "react"

// Right panel width in pixels. A percent layout reopens at a different width
// whenever the window size differs from when it was saved (e.g. after the
// panel unmounts below the mobile breakpoint). Older installs stored a
// percent layout object; it fails the check and falls back to the default.
const mainLayout = defineStorageItem<number | undefined, unknown>(
	"local",
	"dx-main-layout",
	undefined,
	{
		deserialize: (value) =>
			typeof value === "number" && Number.isFinite(value) ? value : undefined,
	},
)

const App = () => {
	const { active: bg } = useBackground()
	const { settings } = useNewtabSettings()
	const isMobile = useIsMobile()
	useSeed()
	const {
		value: savedWidth,
		setValue: saveWidth,
		loaded,
	} = useStorageItem(mainLayout)
	const rightWidth = useRef(savedWidth)

	const bgStyle =
		bg.type === "image"
			? {
					backgroundImage: cssUrl(bg.value),
					backgroundSize: "cover" as const,
					backgroundPosition: "center" as const,
				}
			: {
					background: bg.value,
					backgroundSize: "cover" as const,
					backgroundPosition: "center" as const,
				}

	if (isMobile) {
		return (
			<div className="min-h-screen bg-cover bg-center" style={bgStyle}>
				<LeftPanel fullWidth />
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-cover bg-center" style={bgStyle}>
			{/* defaultSize is only read on mount, and chrome.storage reads are
			    async — mounting before it resolves would snap the panels from the
			    default to the saved size. */}
			{loaded && (
				<ResizablePanelGroup
					orientation="horizontal"
					className="min-h-screen"
					onLayoutChanged={() => {
						if (rightWidth.current !== undefined)
							void saveWidth(rightWidth.current)
					}}
				>
					<ResizablePanel>
						<LeftPanel fullWidth={!settings.showRightPanel} />
					</ResizablePanel>

					{settings.showRightPanel && (
						<>
							<ResizableHandle />
							<ResizablePanel
								defaultSize={`${savedWidth ?? 600}px`}
								minSize="500px"
								maxSize="900px"
								groupResizeBehavior="preserve-pixel-size"
								onResize={(size) => {
									rightWidth.current = size.inPixels
								}}
							>
								<RightPanel />
							</ResizablePanel>
						</>
					)}
				</ResizablePanelGroup>
			)}
		</div>
	)
}

export default App
