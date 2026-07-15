import { Search, Check } from "lucide-react"
import { Input } from "@/shared/ui/input"
import { cn, openExternal } from "@/shared/lib/utils"
import { resolveAction, type SearchAction } from "@/features/search/lib/actions"
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
				className={cn(
					// dark:bg-glass is not redundant: Input ships dark:bg-input/30, and
					// `.dark .x` outranks a plain utility, so .glass's tint loses.
					"glass h-11 rounded-xl pr-10 pl-4 dark:bg-glass",
					"text-sm text-white/90 placeholder:text-white/45",
					"transition-[border-color,background-color] duration-200",
					"hover:border-glass-border-lit",
					"focus-visible:border-glass-border-lit focus-visible:ring-0",
				)}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				spellCheck={false}
				autoComplete="off"
			/>
			<Search
				className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 cursor-pointer text-white/35 transition-colors hover:text-white/70"
				onClick={() => run(action)}
			/>

			{action?.kind === "calc" && (
				<div className="pointer-events-none absolute top-1/2 right-10 flex -translate-y-1/2 items-center gap-2">
					<span className="font-mono text-sm tabular-nums text-white/90">
						= {action.result}
					</span>
					<span className="text-[10px] tracking-wide text-white/35">
						{copied ? <Check className="size-3 text-white/80" /> : action.hint}
					</span>
				</div>
			)}

			{action?.kind === "bang-list" && action.matches.length > 0 && (
				<div className="glass-overlay absolute top-full right-0 left-0 z-20 mt-2 rounded-xl p-1.5">
					{action.matches.map((bang) => (
						<button
							type="button"
							key={bang.key}
							onMouseDown={() => setValue(`!${bang.key} `)}
							className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-white/8"
						>
							<span className="shrink-0 font-mono text-xs text-white/90">
								!{bang.key}
							</span>
							<span className="truncate text-xs text-white/45">
								{bang.name}
							</span>
						</button>
					))}
				</div>
			)}

			{(action?.kind === "open" || action?.kind === "search") && (
				<p className="absolute top-full left-1 mt-1.5 max-w-full truncate text-[10px] tracking-wide text-white/35">
					{action.hint}
				</p>
			)}
		</div>
	)
}

export default SearchBar
