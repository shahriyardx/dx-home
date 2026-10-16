import type { ReactNode } from "react"
import {
	RightPanelProvider,
	useRightPanelContext,
	type RightPanelSection,
} from "@/entrypoints/newtab/right-panel-context"
import { TaskListView, CalendarView, TasksProvider } from "@/features/tasks"
import { SectionBoundary } from "@/shared/components/error-boundary"
import { ScrollArea } from "@/shared/ui/scroll-area"

interface SectionConfig {
	component: (props: {
		onNavigate: (section: RightPanelSection) => void
	}) => ReactNode
}

const SECTIONS: Record<string, SectionConfig> = {
	tasks: { component: TaskListView },
	calendar: { component: CalendarView },
}

const RightPanelInner = () => {
	const { activeSection, setActiveSection } = useRightPanelContext()
	const section = SECTIONS[activeSection]
	const SectionComponent = section?.component

	return (
		// Inset from the window edge so it reads as a sheet on the wallpaper.
		<div className="h-screen py-3 pr-3">
			<div className="h-full overflow-hidden rounded-sheet bg-surface">
				<TasksProvider>
					<SectionBoundary label="Tasks">
						<ScrollArea className="h-full">
							{SectionComponent ? (
								// Keyed so tasks <-> calendar fades rather than snaps.
								<div key={activeSection} className="fade-in">
									<SectionComponent onNavigate={setActiveSection} />
								</div>
							) : null}
						</ScrollArea>
					</SectionBoundary>
				</TasksProvider>
			</div>
		</div>
	)
}

const RightPanel = () => (
	<RightPanelProvider>
		<RightPanelInner />
	</RightPanelProvider>
)

export default RightPanel
