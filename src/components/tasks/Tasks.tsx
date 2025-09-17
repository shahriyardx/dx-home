import { useTasks } from "@/hooks/useTasks"
import { Button } from "../ui/button"
import SingleTask from "./single-task"
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog"
import { DialogTrigger } from "@radix-ui/react-dialog"
import TaskForm from "./task-form"

const Tasks = () => {
	const { tasks } = useTasks()

	return (
		<div>
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Tasks</h1>
				<Dialog>
					<DialogTrigger>
						<Button className="cursor-pointer">Add Task</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>New task</DialogHeader>

						<TaskForm />
					</DialogContent>
				</Dialog>
			</div>

			<div className="mt-2 space-y-2">
				{tasks.map((task) => (
					<SingleTask key={task.id} task={task} />
				))}
			</div>
		</div>
	)
}

export default Tasks
