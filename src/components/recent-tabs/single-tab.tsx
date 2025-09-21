import type { RecentlyClosedTabs } from "@/lib/db"
import { ExternalLink } from "lucide-react"

type Props = {
	tab: RecentlyClosedTabs
}

const SingleTab = ({ tab }: Props) => {
	return (
		<div
			key={tab.url}
			className="flex items-center gap-2 p-3 rounded-md border hover:border-primary/50 transition-all group"
		>
			<a href={tab.url} className="flex gap-2">
				{tab.icon && (
					<img
						src={tab.icon}
						alt={tab.title}
						className="w-5 h-5 object-cover"
					/>
				)}
				<p>{tab.title}</p>
			</a>

			<ExternalLink
				size={15}
				className="ml-2 cursor-pointer"
				onClick={() => window.open(tab.url)}
			/>
		</div>
	)
}

export default SingleTab
