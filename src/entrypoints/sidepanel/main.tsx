import React from "react"
import ReactDOM from "react-dom/client"
import { ErrorBoundary } from "@/shared/components/error-boundary"
import App from "./app.tsx"
import "@/assets/tailwind.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ErrorBoundary label="sidepanel">
			<App />
		</ErrorBoundary>
	</React.StrictMode>,
)
