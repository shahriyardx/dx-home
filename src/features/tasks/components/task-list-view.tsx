import { CalendarDays, Plus } from "lucide-react"
import { useState } from "react"
import type { RightPanelSection } from "@/entrypoints/newtab/right-panel-context"
import { useTasksContext } from "@/features/tasks/tasks-context"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/dialog"
import SingleTask from "./single-task"
import TaskForm from "./task-form"

type Props = {
	onNavigate: (section: RightPanelSection) => void
}

const TaskListView = ({ onNavigate }: Props) => {
	const { tasks } = useTasksContext()
	const [addTaskOpen, setAddTaskOpen] = useState(false)

	return (
		<div className="flex flex-col p-5 pb-20">
			<div className="mb-5 flex items-center gap-1">
				<h1 className="flex-1 ps-1 text-2xl font-bold tracking-tight">Tasks</h1>
				<Button
					variant="ghost"
					size="icon"
					title="Calendar"
					onClick={() => onNavigate("calendar")}
				>
					<CalendarDays />
				</Button>
				<Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
					<DialogTrigger render={<Button variant="primary" />}>
						<Plus /> New
					</DialogTrigger>
					<DialogContent title="New task">
						<TaskForm onSuccess={() => setAddTaskOpen(false)} />
					</DialogContent>
				</Dialog>
			</div>

			<div className="flex flex-col gap-2">
				{tasks.length === 0 && (
					<p className="ps-1 text-sm text-muted">No tasks yet.</p>
				)}
				{tasks.map((task) => (
					<SingleTask key={task.id} task={task} />
				))}
			</div>
		</div>
	)
}

export default TaskListView
