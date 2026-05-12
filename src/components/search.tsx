import { Search } from "lucide-react"
import { Input } from "./ui/input"
import { useState } from "react"

const SearchBar = () => {
	const [value, setValue] = useState("")

	const handleSearch = () => {
		const trimmed = value.trim()
		if (!trimmed) return

		const isUrl = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(trimmed)

		if (isUrl) {
			const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
			window.open(url, "_blank")
		} else {
			chrome.search.query({ text: trimmed, disposition: "NEW_TAB" })
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleSearch()
	}

	return (
		<div className="relative">
			<Input
				placeholder="Search or Enter address"
				className="pr-9 placeholder:text-muted-foreground/50"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
			/>
			<Search
				className="absolute top-1/2 -translate-y-1/2 right-3 size-4 text-muted-foreground/40 cursor-pointer"
				onClick={handleSearch}
			/>
		</div>
	)
}

export default SearchBar
