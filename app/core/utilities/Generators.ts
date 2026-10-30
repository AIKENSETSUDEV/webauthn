/**
 * This is single source of truth for the system time
 * Contains invokable generate() function
 * @returns Date when generate() function is invoked.
 * This interface can be implemented at core of the system
 */

import { nanoid } from "nanoid";

export interface ITimeGenerator {
    generate(): Date;
}


/**
 * This is single source of truth for the ids
 * Contains invokable generate() function
 * @returns string when generate() function is invoked.
 * This interface can be implemented at core of the system
 */

export interface IIDGenerator {
    generate(): string;
}


/**
 * This is single source of truth for the system time
 * Contains invokable generate() function
 * @returns Date when generate() function is invoked.
 
 */
export class SystemTimeGenerator implements ITimeGenerator {
    generate(): Date {
        return new Date();
    }
}

/**
 * This is single source of truth for the ids
 * Contains invokable generate() function with optional prefix
 * @returns string when generate() function is invoked.
 */

export class NanoIDGenerator implements IIDGenerator {
    constructor(private readonly prefix?: string) { }
    generate(): string {
        return this.prefix ? `${this.prefix}-${nanoid()}` : nanoid();
    }
}
