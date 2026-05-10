import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

function getMainDomain(url: string) {
	const hostname = new URL(url).hostname
	const parts = hostname.split(".")
	return parts.slice(-2).join(".")
}

export function urlToFavicon(url: string): string {
	const domain = getMainDomain(url)
	return `https://icons.duckduckgo.com/ip3/${domain}.ico`
}
