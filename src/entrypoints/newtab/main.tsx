import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "@/assets/tailwind.css"
import { ThemeProvider } from "next-themes"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ThemeProvider attribute="class">
			<App />
		</ThemeProvider>
	</React.StrictMode>,
)
