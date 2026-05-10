import useRecentTabs from "@/hooks/useRecentTabs";
import SingleTab from "./single-tab";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { Trash2Icon } from "lucide-react";

const MAX_TABS = 10;

const RecentTabs = () => {
  const { tabs, deleteTab } = useRecentTabs({ max: MAX_TABS });

  return (
    <>
      {tabs.length > 0 && (
        <div>
          <p className="font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Recent Tabs
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {tabs.map((tab) => (
              <ContextMenu key={tab.id}>
                <ContextMenuTrigger>
                  <SingleTab tab={tab} />
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    variant="destructive"
                    onMouseDown={() => deleteTab(tab.id)}
                  >
                    <Trash2Icon className="size-3.5" /> Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default RecentTabs;
