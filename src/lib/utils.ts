import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function urlToFavicon(url: string): string {
	const hostname = new URL(url).hostname
	return `https://www.google.com/s2/favicons?domain=${hostname}&sz=16`
}
