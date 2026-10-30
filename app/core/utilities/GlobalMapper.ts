/**
 * Transforms a type by filtering out all method/function properties,
 * leaving only the raw data properties.
 */


export type Plain<T> = {
	[K in keyof T as T[K] extends Function ? never : K]: T[K];
};

/**
 * Strip domain entity methods so server actions can return serializable data
 * without hand-writing a DTO per entity.
 */
export class GlobalMapper {
	static toPlain<T extends object>(entity: T): Plain<T> {
		const plainRecord: Record<string, unknown> = {};
		for (const key of Object.keys(entity)) {
			plainRecord[key] = (entity as Record<string, unknown>)[key];
		}
		return plainRecord as Plain<T>;
	}

	toPlainList<T extends object>(entities: T[]): Plain<T>[] {
		return entities.map((entity) => GlobalMapper.toPlain(entity));
	}
}
