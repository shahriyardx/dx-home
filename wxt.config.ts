import { defineConfig } from "wxt"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		name: "DxHome",
		description: "Minimal newtab ui screen for your browser",
		permissions: [
			"topSites",
			"tabs",
			"notifications",
			"alarms",
			"storage",
			"sidePanel",
			"contextMenus",
		],
		key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqRsUIiMr3ZBeJBLSY0FOoZFVsbvtDjiUWTjyJ7tJ7di6PviqKPRSv8/hCZ4XQc3xa/vNHCMQEQo+/4yoRH+idcUp8g0KwfbiGYeiW4RAPL4hWJBBtLZJl7/UcVjd1AIaDpTIpDibpEysAZFSxMlRty8Ranz9ic7+m2rI51GoPK+ueLqyq9dqID5V8numSL9wo8vyYaHLuQBf/xSH7npDyzKJa7AzKTZSP0d25jGqXbKJEN5Hu2NYheZo7Y+RgoT/5g8OxoKOqFa4FLM5vbYqO8dqrhDz/sNAQe95FAVWLANmtCrzeBhzJMxHYT2kA/xbSGZJEjXZX2g58zyiR2Rk8QIDAQAB",
	},
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./"),
			},
		},
	}),
	srcDir: "src",
})
