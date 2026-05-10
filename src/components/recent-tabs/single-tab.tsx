import type { RecentlyClosedTabs } from "@/lib/db";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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

type Props = {
  tab: RecentlyClosedTabs;
};

const SingleTab = ({ tab }: Props) => {
  return (
    <div className="flex gap-2 border border-border/50 bg-secondary/30 px-3 py-2 hover:bg-secondary/60 transition-colors group min-w-0">
      {tab.icon && (
        <img
          src={tab.icon}
          alt=""
          className="w-8 h-8 object-cover shrink-0"
        />
      )}

      <a href={tab.url} className="min-w-0 flex-1" title={tab.title}>
        <p className="text-xs text-foreground/80 truncate">{tab.title}</p>
        <p className="text-[10px] text-muted-foreground/50 truncate">
          {formatUrl(tab.url)}
        </p>
      </a>

      <Button
        variant="ghost"
        size="icon"
        className="size-6 opacity-0 group-hover:opacity-100 shrink-0"
        onClick={() => window.open(tab.url)}
      >
        <ExternalLink size={12} />
      </Button>
    </div>
  );
};

export default SingleTab;
