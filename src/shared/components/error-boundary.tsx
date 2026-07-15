import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
	children: ReactNode
	/** Shown instead of the children. Receives a reset to retry the render. */
	fallback?: (error: Error, reset: () => void) => ReactNode
	label?: string
}

interface State {
	error: Error | null
}

/**
 * Stops one broken component from blanking the new tab.
 *
 * This page replaces chrome://newtab, so an uncaught render error is not a
 * broken screen the user can navigate away from — it is a blank page on every
 * tab they open, which reads as the browser being broken rather than us.
 *
 * Must be a class: there is still no hook equivalent of componentDidCatch.
 */
export function SectionBoundary({
	label,
	children,
}: {
	label: string
	children: ReactNode
}) {
	return (
		<ErrorBoundary
			label={label}
			fallback={(_error, reset) => (
				<button
					type="button"
					onClick={reset}
					title="Click to retry"
					className="w-full cursor-pointer rounded-md border border-dashed border-border/60 px-3 py-2 text-left text-[10px] text-muted-foreground/60 transition-colors hover:text-muted-foreground"
				>
					{label} failed to load — retry
				</button>
			)}
		>
			{children}
		</ErrorBoundary>
	)
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { error: null }

	static getDerivedStateFromError(error: Error): State {
		return { error }
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error(
			`[dx-home] ${this.props.label ?? "render"} failed`,
			error,
			info.componentStack,
		)
	}

	reset = () => this.setState({ error: null })

	render() {
		const { error } = this.state
		if (!error) return this.props.children

		if (this.props.fallback) return this.props.fallback(error, this.reset)

		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
				<p className="text-sm text-foreground/80">Something went wrong.</p>
				<p className="max-w-md font-mono text-xs text-muted-foreground">
					{error.message}
				</p>
				<button
					type="button"
					onClick={this.reset}
					className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-ring"
				>
					Try again
				</button>
			</div>
		)
	}
}
