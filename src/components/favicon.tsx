import { useEffect, useMemo, useState } from "react"
import { getDomain } from "tldts"

type Props = {
	url: string
	size?: number
	className?: string
}

function faviconCandidates(url: string) {
	try {
		const parsed = new URL(url)

		const domain = getDomain(parsed.hostname) ?? parsed.hostname

		return [
			`${parsed.origin}/favicon.ico`,
			`https://icons.duckduckgo.com/ip3/${domain}.ico`,
		]
	} catch {
		return []
	}
}

export function Favicon({ url, size = 16, className }: Props) {
	const [index, setIndex] = useState(0)

	const sources = useMemo(() => faviconCandidates(url), [url])

	// biome-ignore lint/correctness/useExhaustiveDependencies: required
	useEffect(() => {
		setIndex(0)
	}, [sources])

	const exhausted = index >= sources.length

	if (sources.length === 0 || exhausted) {
		return (
			<div
				className={className}
				style={{
					width: size,
					height: size,
					borderRadius: 4,
					background: "rgba(127,127,127,0.15)",
					flexShrink: 0,
				}}
			/>
		)
	}

	return (
		<img
			key={sources[index]}
			src={sources[index]}
			alt=""
			width={size}
			height={size}
			loading="lazy"
			decoding="async"
			draggable={false}
			referrerPolicy="no-referrer"
			className={className}
			style={{
				width: size,
				height: size,
				objectFit: "contain",
				flexShrink: 0,
			}}
			onError={() => {
				setIndex((i) => i + 1)
			}}
		/>
	)
}
