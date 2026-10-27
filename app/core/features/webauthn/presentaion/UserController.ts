// //presentation/UserController.ts
import type { CreateUserDTO, LoginUserDTO } from "../application/IUser";
import type { User } from "../domain/User";
import type { UserContainer } from "../implementation/UserContainer";

export class UserController {
    constructor(private readonly userContainer: UserContainer) {}

    async createUser(data: CreateUserDTO): Promise<User> {
        return this.userContainer.createUser().execute(data);
    }

    async loginWithPassword(data: LoginUserDTO): Promise<User> {
        return this.userContainer.loginWithPassword().execute(data);
    }

    async getUserById(id: string): Promise<User> {
        return this.userContainer.findByIdUseCase().execute(id);
    }

    async generatePasskeyRegOptions(userId: string): Promise<any> {
        return this.userContainer.generatePasskeyRegOptions().execute(userId);
    }

    async verifyPasskeyReg(userId: string, response: any, origin: string, rpid: string): Promise<boolean> {
        return this.userContainer.verifyPasskeyReg().execute({
            userId,
            response,
            expectedOrigin: origin,
            expectedRPID: rpid,
        });
    }

    async generatePasskeyAuthOptions(username: string): Promise<{ options: any; userId: string }> {
        return this.userContainer.generatePasskeyAuthOptions().execute(username);
    }

    async verifyPasskeyAuth(userId: string, response: any, origin: string, rpid: string): Promise<boolean> {
        return this.userContainer.verifyPasskeyAuth().execute({
            userId,
            response,
            expectedOrigin: origin,
            expectedRPID: rpid,
        });
    }
}