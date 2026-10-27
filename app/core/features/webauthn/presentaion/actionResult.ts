export type ActionSuccess<T extends object = object> = { success: true } & T;
export type ActionFailure = { success: false; error: string };
export type ActionResult<T extends object = object> =
	| ActionSuccess<T>
	| ActionFailure;

export function toErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	return String(error);
}
