/**
 * Crash Reporter
 * 
 * Centralized error reporting utility for unhandled exceptions.
 * Implements Constitution Principle V (Observability & Quality).
 * 
 * In a real production environment, this would initialize and call
 * Sentry, Crashlytics, Datadog, or another error tracking service.
 */

export interface ErrorContext {
    userId?: string;
    action?: string;
    route?: string;
    requestId?: string;
    [key: string]: any;
}

/**
 * Report an error to the configured crash reporting service
 */
export function reportError(error: unknown, context?: ErrorContext): void {
    // In production: Sentry.captureException(error, { extra: context });

    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;

    console.error(`[CRASH REPORT] ${timestamp}`);
    console.error(`Error: ${errorMessage}`);
    if (context) {
        console.error(`Context: ${JSON.stringify(context, null, 2)}`);
    }
    if (stackTrace) {
        console.error(`Stack: ${stackTrace}`);
    }
}
