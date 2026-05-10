import useRecentTabs from "@/hooks/useRecentTabs";
import { ExternalLink, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";

function formatUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const hasExtra =
      parsed.pathname !== "/" || parsed.search !== "" || parsed.hash !== "";
    return hasExtra ? `${parsed.hostname}/...` : parsed.hostname;
  } catch {
    return url;
  }
}

const TabsDialog = ({ maxTabs }: { maxTabs: number }) => {
  const { allTabs, deleteTab } = useRecentTabs({ max: maxTabs });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          View All
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recently Closed Tabs</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-75">
          <div className="space-y-2">
            {allTabs.map((tab) => (
              <div
                key={tab.id}
                className="flex items-center gap-3 border border-border/50 bg-secondary/20 p-3"
              >
                {tab.icon && (
                  <img src={tab.icon} alt="" className="w-5 h-5 object-cover" />
                )}

                <div className="min-w-0">
                  <p className="text-sm truncate">{tab.title}</p>
                  <p className="text-[11px] text-muted-foreground/50 truncate">
                    {formatUrl(tab.url)}
                  </p>
                </div>

                <div className="flex gap-1 items-center shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground/60 hover:text-destructive"
                    onClick={() => deleteTab(tab.id)}
                  >
                    <Trash size={13} />
                  </Button>

                  <DialogClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground/60"
                      onClick={() => window.open(tab.url)}
                    >
                      <ExternalLink size={13} />
                    </Button>
                  </DialogClose>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar />
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TabsDialog;
