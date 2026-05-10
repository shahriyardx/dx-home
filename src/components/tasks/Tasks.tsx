import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "../ui/button";
import SingleTask from "./single-task";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import TaskForm from "./task-form";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const Tasks = () => {
  const { tasks } = useTasks();
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="p-6 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Tasks</CardTitle>
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
                + New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>New task</DialogHeader>
              <TaskForm onSuccess={() => setAddTaskOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 px-6 pb-6">
        <div className="space-y-3 min-h-0">
          {tasks.length === 0 && (
            <p className="text-xs text-muted-foreground/60 px-2">
              No tasks yet.
            </p>
          )}
          {tasks.map((task) => (
            <SingleTask key={task.id} task={task} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Tasks;
