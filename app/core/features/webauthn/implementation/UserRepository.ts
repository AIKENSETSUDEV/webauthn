import type { IUser } from "../application/IUser";
import type { User } from "../domain/User";

export class UserRepository implements IUser {
	private userdata: User[] = [];

	async create(data: User): Promise<User> {
		this.userdata.push(data);
		return data;
	}

	async getById(id: string): Promise<User> {
		const found = this.userdata.find((u) => u.id === id);
		if (!found) {
			throw new Error("User not found");
		}
		return found;
	}

	async getByUsername(username: string): Promise<User | null> {
		const found = this.userdata.find((u) => u.username === username);
		return found || null;
	}

	async save(data: User): Promise<User> {
		const foundIndex = this.userdata.findIndex((u) => u.id === data.id);
		if (foundIndex === -1) {
			throw new Error("User not found for save");
		}
		this.userdata[foundIndex] = data;
		return data;
	}
}
