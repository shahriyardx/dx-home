import { db } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"
import { useTheme } from "next-themes"

type Theme = "light" | "dark" | "system"

export const useSettings = () => {
	const { theme, setTheme } = useTheme()

	const currentSettings = useLiveQuery(() => db.settings.get("main")) || {
		background: "#1abc9c",
	}

	const updateBg = async (newBg: string) => {
		await db.settings.put({
			key: "main",
			background: newBg,
		})
	}

	return {
		...currentSettings,
		theme: theme as Theme,
		setTheme,
		updateBg,
	}
}
