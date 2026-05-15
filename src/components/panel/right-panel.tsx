import type { ReactNode } from "react"
import {
	RightPanelProvider,
	useRightPanelContext,
} from "@/contexts/right-panel-context"
import { TasksProvider } from "@/contexts/tasks-context"
import TaskListView from "@/components/tasks/task-list-view"
import CalendarView from "@/components/tasks/calendar-view"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SectionConfig {
	component: (props: { onNavigate: (section: string) => void }) => ReactNode
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
		<div className="h-full bg-secondary/10 backdrop-blur-xl">
			<div className="h-full border-l">
				<TasksProvider>
					<ScrollArea className="h-screen overflow-hidden">
						{SectionComponent ? (
							<SectionComponent onNavigate={setActiveSection} />
						) : null}
					</ScrollArea>
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
