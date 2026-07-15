import type { RightPanelSection } from "@/entrypoints/newtab/right-panel-context"
import { useState } from "react"
import { useTasksContext } from "@/features/tasks/tasks-context"
import { Button } from "@/shared/ui/button"
import SingleTask from "./single-task"
import { Dialog, DialogContent, DialogHeader } from "@/shared/ui/dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
import TaskForm from "./task-form"
import { Plus, CalendarDays } from "lucide-react"

type Props = {
	onNavigate: (section: RightPanelSection) => void
}

const TaskListView = ({ onNavigate }: Props) => {
	const { tasks } = useTasksContext()
	const [addTaskOpen, setAddTaskOpen] = useState(false)

	return (
		<div className="flex flex-col h-full pb-20">
			<div className="p-6 pb-4 shrink-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => onNavigate("calendar")}
							className="p-1 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
							title="Show Calendar"
						>
							<CalendarDays size={20} />
						</button>
						<h1 className="text-lg font-semibold">Tasks</h1>
					</div>
					<Dialog
						open={addTaskOpen}
						onOpenChange={(val) => setAddTaskOpen(val)}
					>
						<DialogTrigger>
							<Button
								size="sm"
								variant="outline"
								className="text-xs h-7 px-2 cursor-pointer text-muted-foreground hover:text-foreground"
							>
								<Plus /> New
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>New task</DialogHeader>
							<TaskForm onSuccess={() => setAddTaskOpen(false)} />
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="space-y-3 min-h-0 px-6">
				{tasks.length === 0 && (
					<p className="text-xs text-muted-foreground/60">No tasks yet.</p>
				)}
				{tasks.map((task) => (
					<SingleTask key={task.id} task={task} />
				))}
			</div>
		</div>
	)
}

export default TaskListView
