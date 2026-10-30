/**
 * Strict Discriminated Union Result Type
 * @template E - Error type
 * @template T - Data type
 */
export type Result<E, T> =
	| { readonly success: false; readonly error: E; readonly data: null }
	| { readonly success: true; readonly error: null; readonly data: T };

/**
 * Awaits a promise and captures thrown errors as Result.
 * Prefer: `await SafeExecute(useCase.execute(input))`
 */
export async function SafeExecute<T, E extends Error = Error>(
	operation: Promise<T>,
	errorMapper?: (err: unknown) => E,
): Promise<Result<E, T>> {
	try {
		const data = await operation;
		return { success: true as const, error: null, data };
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		const mapped = errorMapper ? errorMapper(err) : (err as E);
		return { success: false as const, error: mapped, data: null };
	}
}

/**
 * Next.js serializes thrown/returned Errors as plain `{ message, name, ... }`,
 * so `instanceof Error` is unreliable on the client.
 */
export function isErrorResult(value: unknown): value is Error {
	if (value instanceof Error) return true;
	if (typeof value !== "object" || value === null || !("message" in value)) {
		return false;
	}
	const keys = Object.keys(value);
	return keys.every((k) =>
		["message", "name", "stack", "cause"].includes(k),
	);
}
