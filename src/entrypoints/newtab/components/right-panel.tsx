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
		// The full-height sheet: same glass, but square and borderless except for
		// the lit left edge, so it reads as part of the window rather than as a
		// card floating in it.
		<div
			className="h-full border-0 border-l border-l-glass-border-lit"
			style={{
				backgroundColor: "var(--glass)",
				backdropFilter: "blur(var(--glass-blur-strong)) saturate(1.5)",
			}}
		>
			<TasksProvider>
				<SectionBoundary label="Tasks">
					<ScrollArea className="h-screen overflow-hidden">
						{SectionComponent ? (
							<SectionComponent onNavigate={setActiveSection} />
						) : null}
					</ScrollArea>
				</SectionBoundary>
			</TasksProvider>
		</div>
	)
}

const RightPanel = () => (
	<RightPanelProvider>
		<RightPanelInner />
	</RightPanelProvider>
)

export default RightPanel
