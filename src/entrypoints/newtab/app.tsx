import { useBackground } from "@/hooks/use-background"
import { useNewtabSettings } from "@/hooks/use-newtab-settings"
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

	const bgStyle =
		bg.type === "image"
			? {
					backgroundImage: `url(${bg.value})`,
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

	return (
		<div className="min-h-screen bg-cover bg-center" style={bgStyle}>
			<ResizablePanelGroup
				orientation="horizontal"
				className="min-h-screen max-lg:flex-col"
				defaultLayout={savedLayout}
				onLayoutChange={(sizes) =>
					localStorage.setItem("dx-main-layout", JSON.stringify(sizes))
				}
			>
				<ResizablePanel className="max-lg:overflow-y-auto!">
					<LeftPanel />
				</ResizablePanel>

				{settings.showRightPanel && (
					<>
						<ResizableHandle className="max-lg:hidden" />
						<ResizablePanel
							defaultSize={33.3}
							minSize="300px"
							maxSize="700px"
							className="max-lg:hidden"
						>
							<RightPanel />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>
		</div>
	)
}

export default App
