import useRecentTabs from "@/hooks/useRecentTabs"
import { ExternalLink } from "lucide-react"

const RecentTabs = () => {
	const { tabs } = useRecentTabs()

	return (
		<>
			{tabs.length > 0 && (
				<div>
					<h1 className="text-lg font-bold">Recent Tabs</h1>
					<div className="mt-2 flex items-center gap-2 flex-wrap">
						{tabs.map((tab) => (
							<div
								key={tab.url}
								className="flex items-center gap-2 p-3 rounded-md border"
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
						))}
					</div>
				</div>
			)}
		</>
	)
}

export default RecentTabs
