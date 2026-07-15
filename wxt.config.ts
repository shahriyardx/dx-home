import { defineConfig } from "wxt"
import tailwindcss from "@tailwindcss/vite"

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		name: "DxHome",
		description: "Minimal newtab ui screen for your browser",
		permissions: [
			"topSites",
			"tabs",
			"storage",
			"sidePanel",
			"contextMenus",
			"search",
		],
		// Optional, not required: this would otherwise add a host permission
		// warning to the install prompt for every user, including the ones who
		// never run a dev server. Requested in-context when the feature is turned
		// on. Match patterns ignore ports, so these cover every loopback port and
		// nothing else.
		optional_host_permissions: ["http://localhost/*", "http://127.0.0.1/*"],
		key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqRsUIiMr3ZBeJBLSY0FOoZFVsbvtDjiUWTjyJ7tJ7di6PviqKPRSv8/hCZ4XQc3xa/vNHCMQEQo+/4yoRH+idcUp8g0KwfbiGYeiW4RAPL4hWJBBtLZJl7/UcVjd1AIaDpTIpDibpEysAZFSxMlRty8Ranz9ic7+m2rI51GoPK+ueLqyq9dqID5V8numSL9wo8vyYaHLuQBf/xSH7npDyzKJa7AzKTZSP0d25jGqXbKJEN5Hu2NYheZo7Y+RgoT/5g8OxoKOqFa4FLM5vbYqO8dqrhDz/sNAQe95FAVWLANmtCrzeBhzJMxHYT2kA/xbSGZJEjXZX2g58zyiR2Rk8QIDAQAB",
	},
	modules: ["@wxt-dev/module-react"],
	// No `resolve.alias` here: WXT already maps @ to srcDir, which is what
	// tsconfig's "@/*": ["./src/*"] expects. Pointing @ at the project root
	// instead — as this did — only ever worked because WXT's own alias won.
	vite: () => ({
		plugins: [tailwindcss()],
	}),
	srcDir: "src",
})
