/**
 * A small arithmetic evaluator for the search bar.
 *
 * Hand-written rather than eval()/new Function(): MV3's default CSP is
 * script-src 'self', which blocks both, and evaluating user input as code in a
 * page holding tabs/topSites/storage would be a poor trade for a calculator.
 *
 * Grammar (lowest to highest precedence):
 *   expr    := term (('+' | '-') term)*
 *   term    := unary (('*' | '/' | '%') unary)*
 *   unary   := ('-' | '+') unary | power
 *   power   := primary ('^' unary)?        // right associative
 *   primary := number | constant | func '(' args ')' | '(' expr ')'
 */

type Token =
	| { t: "num"; v: number }
	| { t: "op"; v: string }
	| { t: "name"; v: string }

const CONSTANTS: Record<string, number> = {
	pi: Math.PI,
	e: Math.E,
}

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
	sqrt: Math.sqrt,
	cbrt: Math.cbrt,
	abs: Math.abs,
	round: Math.round,
	floor: Math.floor,
	ceil: Math.ceil,
	min: Math.min,
	max: Math.max,
	log: Math.log10,
	ln: Math.log,
	sin: Math.sin,
	cos: Math.cos,
	tan: Math.tan,
	pow: Math.pow,
}

function tokenize(src: string): Token[] | null {
	const tokens: Token[] = []
	let i = 0

	while (i < src.length) {
		const c = src[i]

		if (c === " " || c === "\t") {
			i++
			continue
		}

		if (c >= "0" && c <= "9") {
			let j = i
			while (j < src.length && /[0-9]/.test(src[j])) j++
			if (src[j] === ".") {
				j++
				while (j < src.length && /[0-9]/.test(src[j])) j++
			}
			const n = Number(src.slice(i, j))
			if (!Number.isFinite(n)) return null
			tokens.push({ t: "num", v: n })
			i = j
			continue
		}

		// A leading "." as in ".5"
		if (c === "." && /[0-9]/.test(src[i + 1] ?? "")) {
			let j = i + 1
			while (j < src.length && /[0-9]/.test(src[j])) j++
			tokens.push({ t: "num", v: Number(src.slice(i, j)) })
			i = j
			continue
		}

		if (/[a-zA-Z_]/.test(c)) {
			let j = i
			while (j < src.length && /[a-zA-Z_0-9]/.test(src[j])) j++
			tokens.push({ t: "name", v: src.slice(i, j).toLowerCase() })
			i = j
			continue
		}

		if ("+-*/%^(),".includes(c)) {
			tokens.push({ t: "op", v: c })
			i++
			continue
		}

		return null // anything else means this isn't arithmetic
	}

	return tokens
}

function parse(tokens: Token[]): number | null {
	let pos = 0

	const peek = () => tokens[pos]
	const eat = (v: string) => {
		const t = peek()
		if (t?.t === "op" && t.v === v) {
			pos++
			return true
		}
		return false
	}

	function expr(): number | null {
		let left = term()
		if (left === null) return null
		for (;;) {
			if (eat("+")) {
				const right = term()
				if (right === null) return null
				left += right
			} else if (eat("-")) {
				const right = term()
				if (right === null) return null
				left -= right
			} else {
				return left
			}
		}
	}

	function term(): number | null {
		let left = unary()
		if (left === null) return null
		for (;;) {
			if (eat("*")) {
				const right = unary()
				if (right === null) return null
				left *= right
			} else if (eat("/")) {
				const right = unary()
				if (right === null) return null
				left /= right
			} else if (eat("%")) {
				const right = unary()
				if (right === null) return null
				left %= right
			} else {
				return left
			}
		}
	}

	function unary(): number | null {
		if (eat("-")) {
			const v = unary()
			return v === null ? null : -v
		}
		if (eat("+")) return unary()
		return power()
	}

	function power(): number | null {
		const base = primary()
		if (base === null) return null
		// Right associative, and binds tighter than unary minus: -2^2 is -4.
		if (eat("^")) {
			const exp = unary()
			if (exp === null) return null
			return base ** exp
		}
		return base
	}

	function primary(): number | null {
		const t = peek()
		if (!t) return null

		if (t.t === "num") {
			pos++
			return t.v
		}

		if (t.t === "op" && t.v === "(") {
			pos++
			const v = expr()
			if (v === null) return null
			return eat(")") ? v : null
		}

		if (t.t === "name") {
			pos++
			// hasOwn, not `in`/direct index: both reach Object.prototype, where
			// "constructor" would resolve to the Object constructor itself.
			if (Object.hasOwn(CONSTANTS, t.v)) return CONSTANTS[t.v]

			if (!Object.hasOwn(FUNCTIONS, t.v)) return null
			const fn = FUNCTIONS[t.v]
			if (!eat("(")) return null

			const args: number[] = []
			if (!eat(")")) {
				for (;;) {
					const a = expr()
					if (a === null) return null
					args.push(a)
					if (eat(",")) continue
					if (eat(")")) break
					return null
				}
			}
			return fn(...args)
		}

		return null
	}

	const value = expr()
	// Trailing junk means the whole input wasn't an expression.
	if (value === null || pos !== tokens.length) return null
	return value
}

/** Trims binary float noise: 0.1 + 0.2 reads as 0.3, not 0.30000000000000004. */
function format(n: number): string {
	const rounded = Math.round(n * 1e10) / 1e10
	if (Object.is(rounded, -0)) return "0"
	return String(rounded)
}

/**
 * Evaluates `input` as arithmetic, or returns null if it isn't arithmetic.
 * Bare numbers return null — "5" is a search, not a calculation.
 */
export function calculate(input: string): string | null {
	const trimmed = input.trim()
	if (!trimmed) return null

	// A date would otherwise parse as subtraction: 2024-01-15 -> 2008.
	if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) return null

	const tokens = tokenize(trimmed)
	if (!tokens || tokens.length === 0) return null

	const hasOperation = tokens.some(
		(t) =>
			(t.t === "op" && "+-*/%^".includes(t.v)) ||
			(t.t === "name" && t.v in FUNCTIONS),
	)
	if (!hasOperation) return null

	const value = parse(tokens)
	if (value === null || !Number.isFinite(value)) return null

	return format(value)
}
