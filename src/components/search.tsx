import { Search } from "lucide-react"
import { Input } from "./ui/input"

const SearchBar = () => {
	return (
		<div className="relative">
			<Input
				placeholder="Search or Enter address"
				className="placeholder:text-muted-foreground/50"
			/>
			<Search className="absolute top-1/2 -translate-y-1/2 right-2 text-muted-foreground/20" />
		</div>
	)
}

export default SearchBar
