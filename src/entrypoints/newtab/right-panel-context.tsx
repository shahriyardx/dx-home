import { createContext, useContext, type ReactNode } from "react"
import { defineStorageItem, useStorageItem } from "@/shared/storage"

export type RightPanelSection = "tasks" | "calendar"

export const rightPanelSection = defineStorageItem<RightPanelSection, unknown>(
	"local",
	"dx-right-panel-section",
	"tasks",
	{
		deserialize: (value) =>
			value === "calendar" || value === "tasks" ? value : "tasks",
	},
)

interface RightPanelContextValue {
	activeSection: RightPanelSection
	setActiveSection: (section: RightPanelSection) => void
}

const RightPanelContext = createContext<RightPanelContextValue | null>(null)

export function RightPanelProvider({ children }: { children: ReactNode }) {
	const { value: activeSection, setValue: setActiveSection } =
		useStorageItem(rightPanelSection)

	return (
		<RightPanelContext.Provider value={{ activeSection, setActiveSection }}>
			{children}
		</RightPanelContext.Provider>
	)
}

export function useRightPanelContext() {
	const ctx = useContext(RightPanelContext)
	if (!ctx)
		throw new Error(
			"useRightPanelContext must be used within RightPanelProvider",
		)
	return ctx
}
