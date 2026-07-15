import { Search, Check } from "lucide-react"
import { Input } from "./ui/input"
import { openExternal } from "@/lib/utils"
import { resolveAction, type SearchAction } from "@/lib/search-actions"
import { useMemo, useState } from "react"

const SearchBar = () => {
	const [value, setValue] = useState("")
	const [copied, setCopied] = useState(false)

	const action = useMemo(() => resolveAction(value), [value])

	const run = async (current: SearchAction | null) => {
		if (!current) return

		switch (current.kind) {
			case "calc":
				await navigator.clipboard.writeText(current.result)
				setCopied(true)
				setTimeout(() => setCopied(false), 1200)
				return
			case "open":
				openExternal(current.url)
				setValue("")
				return
			case "search":
				chrome.search.query({ text: current.text, disposition: "NEW_TAB" })
				setValue("")
				return
			case "bang-list":
				// Nothing to run until a shortcut is picked.
				return
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") run(action)
		if (e.key === "Escape") setValue("")
	}

	return (
		<div className="relative">
			<Input
				placeholder="Search, calculate, or enter address"
				className="pr-9 placeholder:text-muted-foreground/50"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				spellCheck={false}
				autoComplete="off"
			/>
			<Search
				className="absolute top-1/2 -translate-y-1/2 right-3 size-4 text-muted-foreground/40 cursor-pointer"
				onClick={() => run(action)}
			/>

			{action && action.kind === "calc" && (
				<div className="absolute right-9 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
					<span className="text-xs font-mono text-foreground/80 tabular-nums">
						= {action.result}
					</span>
					<span className="text-[10px] text-muted-foreground/50">
						{copied ? (
							<Check className="size-3 text-primary" />
						) : (
							action.hint
						)}
					</span>
				</div>
			)}

			{action && action.kind === "bang-list" && action.matches.length > 0 && (
				<div className="absolute top-full left-0 right-0 mt-1.5 z-10 rounded-md border bg-popover/95 backdrop-blur-sm p-1 shadow-md">
					{action.matches.map((bang) => (
						<button
							type="button"
							key={bang.key}
							onMouseDown={() => setValue(`!${bang.key} `)}
							className="w-full flex items-center gap-2 rounded px-2 py-1 text-left hover:bg-accent cursor-pointer"
						>
							<span className="text-xs font-mono text-primary shrink-0">
								!{bang.key}
							</span>
							<span className="text-xs text-muted-foreground truncate">
								{bang.name}
							</span>
						</button>
					))}
				</div>
			)}

			{action && (action.kind === "open" || action.kind === "search") && (
				<p className="absolute top-full left-0 mt-1 text-[10px] text-muted-foreground/50 truncate max-w-full">
					{action.hint}
				</p>
			)}
		</div>
	)
}

export default SearchBar
