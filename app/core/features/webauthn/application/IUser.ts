import type { User } from "@/app/core/features/webauthn/domain/User";

export interface CredentialsDTO {
	username: string;
	password: string;
}

export interface IUser {
	create(data: User): Promise<User>;
	getById(id: string): Promise<User>;
	getByUsername(username: string): Promise<User | null>;
	save(data: User): Promise<User>;
}
