/**
 * Ports worth probing for a local dev server.
 *
 * Curated rather than a range scan: sweeping 1–65535 is both slow and
 * indistinguishable from port scanning, and every probe is a real HTTP GET to
 * whatever is listening. These are the defaults of common HTTP dev servers, so
 * a GET is what the tool expects to receive anyway.
 */
export const DEV_PORTS = [
	1313, // Hugo
	3000, // Next.js, Create React App, Rails
	3001, // second Next.js instance
	3002,
	4000, // Phoenix, Gatsby
	4200, // Angular
	4321, // Astro
	5000, // Flask, .NET
	5001,
	5173, // Vite
	5174, // second Vite instance
	6006, // Storybook
	8000, // Django, FastAPI, python -m http.server
	8001,
	8080, // generic
	8081,
	8787, // Cloudflare Wrangler
	8888, // Jupyter
	9000, // generic, PHP
	11434, // Ollama
] as const

/**
 * Never probed. Databases and brokers are not HTTP, so a probe would either
 * hang until the timeout or write a junk HTTP request into their protocol
 * stream. Excluded by construction rather than filtered after the fact.
 *
 * Elasticsearch (9200) and CouchDB (5984) are the interesting cases: both DO
 * speak HTTP and would pass the probe, which is exactly why they are listed —
 * "it answered HTTP" is not the same as "it is a dev server".
 */
export const EXCLUDED_PORTS = [
	1433, // SQL Server
	3306, // MySQL / MariaDB
	5432, // PostgreSQL
	5672, // RabbitMQ
	5984, // CouchDB — speaks HTTP, still not a dev server
	6379, // Redis
	9042, // Cassandra
	9092, // Kafka
	9200, // Elasticsearch — speaks HTTP, still not a dev server
	11211, // Memcached
	27017, // MongoDB
] as const

/** Reads a friendlier name out of what the server tells us about itself. */
export function labelFor(port: number, title?: string, poweredBy?: string) {
	if (poweredBy?.toLowerCase().includes("next")) return title || "Next.js"
	if (title) return title
	if (port === 6006) return "Storybook"
	if (port === 8888) return "Jupyter"
	if (port === 11434) return "Ollama"
	return `localhost:${port}`
}
