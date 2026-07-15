import { useBackground } from "@/hooks/use-background"
import { useNewtabSettings } from "@/hooks/use-newtab-settings"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { cssUrl } from "@/lib/utils"
import LeftPanel from "@/components/panel/left-panel"
import RightPanel from "@/components/panel/right-panel"
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable"

const App = () => {
	const { active: bg } = useBackground()
	const { settings } = useNewtabSettings()
	const isMobile = useIsMobile()

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

	const savedLayout = (() => {
		try {
			const s = localStorage.getItem("dx-main-layout")
			return s ? JSON.parse(s) : undefined
		} catch {
			return undefined
		}
	})()

	if (isMobile) {
		return (
			<div className="min-h-screen bg-cover bg-center" style={bgStyle}>
				<LeftPanel />
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-cover bg-center" style={bgStyle}>
			<ResizablePanelGroup
				orientation="horizontal"
				className="min-h-screen"
				defaultLayout={savedLayout}
				onLayoutChange={(sizes) =>
					localStorage.setItem("dx-main-layout", JSON.stringify(sizes))
				}
			>
				<ResizablePanel>
					<LeftPanel />
				</ResizablePanel>

				{settings.showRightPanel && (
					<>
						<ResizableHandle />
						<ResizablePanel defaultSize="600px" minSize="500px" maxSize="900px">
							<RightPanel />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>
		</div>
	)
}

export default App
