import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function getRandomItem<T>(arr: T[]): T {
	const randomIndex = Math.floor(Math.random() * arr.length)
	return arr[randomIndex]
}
