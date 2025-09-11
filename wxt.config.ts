import { defineConfig } from "wxt"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		name: "DxHome",
		description: "Minimal newtab ui screen for your browser",
	},
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./"), // or "./src" if using src directory
			},
		},
	}),
	srcDir: "src",
})
