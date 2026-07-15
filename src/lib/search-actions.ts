import { calculate } from "./calc"

export type Bang = {
	key: string
	name: string
	home: string
	search: (query: string) => string
}

const q = (s: string) => encodeURIComponent(s)

/** Bangs are !-prefixed so they can't shadow a real search: "so what is this". */
export const BANGS: Bang[] = [
	{
		key: "g",
		name: "Google",
		home: "https://www.google.com",
		search: (s) => `https://www.google.com/search?q=${q(s)}`,
	},
	{
		key: "gh",
		name: "GitHub",
		home: "https://github.com",
		search: (s) => `https://github.com/search?q=${q(s)}`,
	},
	{
		key: "npm",
		name: "npm",
		home: "https://www.npmjs.com",
		search: (s) => `https://www.npmjs.com/search?q=${q(s)}`,
	},
	{
		key: "mdn",
		name: "MDN",
		home: "https://developer.mozilla.org",
		search: (s) => `https://developer.mozilla.org/en-US/search?q=${q(s)}`,
	},
	{
		key: "so",
		name: "Stack Overflow",
		home: "https://stackoverflow.com",
		search: (s) => `https://stackoverflow.com/search?q=${q(s)}`,
	},
	{
		key: "yt",
		name: "YouTube",
		home: "https://www.youtube.com",
		search: (s) => `https://www.youtube.com/results?search_query=${q(s)}`,
	},
	{
		key: "w",
		name: "Wikipedia",
		home: "https://en.wikipedia.org",
		search: (s) => `https://en.wikipedia.org/w/index.php?search=${q(s)}`,
	},
	{
		key: "r",
		name: "Reddit",
		home: "https://www.reddit.com",
		search: (s) => `https://www.reddit.com/search/?q=${q(s)}`,
	},
]

export type SearchAction =
	| { kind: "calc"; result: string; hint: string }
	| { kind: "open"; url: string; hint: string }
	| { kind: "search"; text: string; hint: string }
	| { kind: "bang-list"; matches: Bang[]; hint: string }

// Requires a real TLD, so "1.5+2" is arithmetic and "5" is a search rather than
// both being read as hostnames.
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[a-zA-Z]{2,}(:\d+)?([/?#]|$)/
const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?([/?#].*)?$/
const LOCALHOST_RE = /^localhost(:\d+)?([/?#].*)?$/i
const PORT_RE = /^:(\d{1,5})([/?#].*)?$/

export function resolveAction(raw: string): SearchAction | null {
	const input = raw.trim()
	if (!input) return null

	// !bang — list on a bare "!" or an unmatched prefix, otherwise dispatch.
	if (input.startsWith("!")) {
		const [word, ...rest] = input.slice(1).split(/\s+/)
		const query = rest.join(" ").trim()
		const key = word.toLowerCase()
		const bang = BANGS.find((b) => b.key === key)

		if (bang) {
			return query
				? { kind: "open", url: bang.search(query), hint: `${bang.name} search` }
				: { kind: "open", url: bang.home, hint: `Open ${bang.name}` }
		}

		const matches = key
			? BANGS.filter((b) => b.key.startsWith(key))
			: [...BANGS]
		return {
			kind: "bang-list",
			matches,
			hint: matches.length ? "Shortcuts" : "No matching shortcut",
		}
	}

	// :3000 -> the dev server you already have running
	const port = input.match(PORT_RE)
	if (port) {
		const url = `http://localhost:${port[1]}${port[2] ?? ""}`
		return { kind: "open", url, hint: `Open ${url.replace("http://", "")}` }
	}

	// localhost and raw IPs: http, since these rarely have TLS
	if (LOCALHOST_RE.test(input) || IPV4_RE.test(input)) {
		return { kind: "open", url: `http://${input}`, hint: `Open ${input}` }
	}

	if (URL_RE.test(input)) {
		const url = /^https?:\/\//i.test(input) ? input : `https://${input}`
		return { kind: "open", url, hint: `Open ${input}` }
	}

	const result = calculate(input)
	if (result !== null) {
		return { kind: "calc", result, hint: "Enter to copy" }
	}

	return { kind: "search", text: input, hint: "Search the web" }
}
