import { Terminal, RefreshCw } from "lucide-react"
import { SectionHeader } from "@/shared/components/section-header"
import { LinkCard } from "@/shared/components/link-card"
import { cn } from "@/shared/lib/utils"
import { useDevServers } from "../use-dev-servers"

export function DevServers() {
	const { servers, granted, scanning, rescan } = useDevServers()

	// Renders only when there is something to show. Not while permission is
	// still being checked, not without access, and not when nothing is running.
	//
	// Nothing here ever asks for the localhost permission: this section is on by
	// default, so a prompt would greet every user on every new tab — including
	// everyone who never runs a dev server. Granting happens in settings, where
	// the toggle is a deliberate act.
	if (!granted || servers.length === 0) return null

	return (
		<div>
			<SectionHeader
				icon={Terminal}
				action={
					<button
						type="button"
						onClick={rescan}
						title="Rescan"
						className="cursor-pointer rounded p-0.5 text-white/30 transition-colors hover:text-white/70"
					>
						<RefreshCw className={cn("size-3", scanning && "animate-spin")} />
					</button>
				}
			>
				Dev Servers
			</SectionHeader>

			<div className="flex flex-wrap items-center gap-1.5">
				{servers.map((server) => (
					<LinkCard
						key={server.port}
						icon={<Terminal className="size-3.5 text-white/50" />}
						title={server.label}
						url={server.url}
						description={`localhost:${server.port}`}
					/>
				))}
			</div>
		</div>
	)
}
