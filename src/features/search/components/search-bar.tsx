import { Search, Check } from "lucide-react"
import { Input } from "@base-ui/react/input"
import { openExternal } from "@/shared/lib/utils"
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
			<Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-muted" />
			{/* Half-height radius, not rounded-full, so it can tighten on focus. */}
			<Input
				placeholder="Search, calculate, or enter address"
				className="h-14 w-full rounded-surface bg-surface pr-5 pl-14 text-[15px] text-fg outline-none transition-[background-color,border-radius] placeholder:text-muted hover:bg-surface-hover focus:rounded-[1.25rem] focus:bg-surface-hover"
				value={value}
				onValueChange={setValue}
				onKeyDown={handleKeyDown}
				spellCheck={false}
				autoComplete="off"
			/>

			{action?.kind === "calc" && (
				<div className="pointer-events-none absolute top-1/2 right-5 flex -translate-y-1/2 items-center gap-2">
					<span className="font-mono text-sm tabular-nums text-fg">
						= {action.result}
					</span>
					<span className="text-xs text-muted">
						{copied ? <Check className="size-3.5 text-primary" /> : action.hint}
					</span>
				</div>
			)}

			{action?.kind === "bang-list" && action.matches.length > 0 && (
				<div className="elevated fade-in absolute top-full right-0 left-0 z-20 mt-2 rounded-menu bg-overlay p-1.5">
					{action.matches.map((bang) => (
						<button
							type="button"
							key={bang.key}
							onMouseDown={() => setValue(`!${bang.key} `)}
							className="flex h-9 w-full items-center gap-3 rounded-field px-3 text-left hover:bg-field"
						>
							<span className="shrink-0 font-mono text-[13px] text-fg">
								!{bang.key}
							</span>
							<span className="truncate text-[13px] text-muted">
								{bang.name}
							</span>
						</button>
					))}
				</div>
			)}

			{(action?.kind === "open" || action?.kind === "search") && (
				<p className="on-wallpaper absolute top-full left-5 mt-2 max-w-full truncate text-xs font-medium text-white">
					{action.hint}
				</p>
			)}
		</div>
	)
}

export default SearchBar
