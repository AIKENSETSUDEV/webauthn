import z, { ZodType } from "zod";

export type ParseResult<T> =
    | { success: true; data: T }
    | { success: false; error: Error };

export interface IValidator<T> {
    parse(data: unknown): ParseResult<T>;
}

export class ZodParser<T> implements IValidator<T> {
    constructor(private schema: ZodType<T>) { }

    parse(data: unknown): ParseResult<T> {
        const result = this.schema.safeParse(data);

        if (!result.success) {
            return {
                success: false,
                error: new Error(z.prettifyError(result.error))
            };
        }

        return { success: true, data: result.data };
    }
}

