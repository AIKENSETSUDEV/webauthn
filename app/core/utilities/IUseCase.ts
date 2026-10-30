export type UseCase<T, O> = {
    execute(input: T): Promise<O>;
};
