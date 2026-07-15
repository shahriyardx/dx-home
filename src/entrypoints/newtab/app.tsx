import { useBackground } from "@/features/backgrounds"
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
import type { Layout } from "react-resizable-panels"

// Was raw localStorage — the one store that never reached chrome.storage, so it
// could not be read by the worker or the sidepanel.
//
// Layout is a map of panel id -> flexGrow, not an array. The old code stored it
// through an untyped JSON.parse, so nothing checked the shape.
const mainLayout = defineStorageItem<Layout | undefined, unknown>(
	"local",
	"dx-main-layout",
	undefined,
	{
		deserialize: (value) =>
			value !== null &&
			typeof value === "object" &&
			!Array.isArray(value) &&
			Object.values(value).every((n) => typeof n === "number")
				? (value as Layout)
				: undefined,
	},
)

const App = () => {
	const { active: bg } = useBackground()
	const { settings } = useNewtabSettings()
	const isMobile = useIsMobile()
	const {
		value: savedLayout,
		setValue: saveLayout,
		loaded,
	} = useStorageItem(mainLayout)

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
				<LeftPanel />
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-cover bg-center" style={bgStyle}>
			{/* defaultLayout is only read on mount, and chrome.storage reads are
			    async — mounting before it resolves would snap the panels from the
			    default to the saved size. */}
			{loaded && (
				<ResizablePanelGroup
					orientation="horizontal"
					className="min-h-screen"
					defaultLayout={savedLayout}
					onLayoutChange={(sizes) => {
						void saveLayout(sizes)
					}}
				>
					<ResizablePanel>
						<LeftPanel />
					</ResizablePanel>

					{settings.showRightPanel && (
						<>
							<ResizableHandle />
							<ResizablePanel
								defaultSize="600px"
								minSize="500px"
								maxSize="900px"
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
