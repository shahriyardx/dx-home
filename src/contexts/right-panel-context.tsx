import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	type ReactNode,
} from "react"

const STORAGE_KEY = "dx-right-panel-section"
const DEFAULT_SECTION = "tasks"

interface RightPanelContextValue {
	activeSection: string
	setActiveSection: (section: string) => void
}

const RightPanelContext = createContext<RightPanelContextValue | null>(null)

export function RightPanelProvider({ children }: { children: ReactNode }) {
	const [activeSection, setActiveSectionState] = useState(DEFAULT_SECTION)

	useEffect(() => {
		chrome.storage.local.get(STORAGE_KEY).then((res) => {
			const val = res[STORAGE_KEY] as string | undefined
			if (val) setActiveSectionState(val)
		})

		const handler = (changes: Record<string, chrome.storage.StorageChange>) => {
			if (changes[STORAGE_KEY]) {
				const val = changes[STORAGE_KEY].newValue
				if (typeof val === "string") setActiveSectionState(val)
			}
		}

		chrome.storage.onChanged.addListener(handler)
		return () => chrome.storage.onChanged.removeListener(handler)
	}, [])

	const setActiveSection = useCallback((section: string) => {
		setActiveSectionState(section)
		chrome.storage.local.set({ [STORAGE_KEY]: section })
	}, [])

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
