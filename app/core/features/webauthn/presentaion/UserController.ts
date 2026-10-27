import type {
	CreateUserDTO,
	LoginUserDTO,
} from "@/app/core/features/webauthn/application/IUser";
import type { UserApplication } from "@/app/core/features/webauthn/application/UserApplication";
import type { PasskeyAuthOptionsResult } from "@/app/core/features/webauthn/application/UserUseCases";
import type {
	PasskeyAuthenticationResponseDto,
	PasskeyRegistrationOptionsDto,
	PasskeyRegistrationResponseDto,
} from "@/app/core/features/webauthn/application/dto/passkey.dto";
import type { User } from "@/app/core/features/webauthn/domain/User";

/**
 * Delivery façade over application use cases.
 * Depends on UserApplication (application API), never on infrastructure.
 */
export class UserController {
	constructor(private readonly app: UserApplication) {}

	async createUser(data: CreateUserDTO): Promise<User> {
		return this.app.createUser.execute(data);
	}

	async loginWithPassword(data: LoginUserDTO): Promise<User> {
		return this.app.loginWithPassword.execute(data);
	}

	async getUserById(id: string): Promise<User> {
		return this.app.getById.execute(id);
	}

	async generatePasskeyRegOptions(
		userId: string,
	): Promise<PasskeyRegistrationOptionsDto> {
		return this.app.generatePasskeyRegOptions.execute(userId);
	}

	async verifyPasskeyReg(
		userId: string,
		response: PasskeyRegistrationResponseDto,
		origin: string,
		rpid: string,
	): Promise<boolean> {
		return this.app.verifyPasskeyReg.execute({
			userId,
			response,
			expectedOrigin: origin,
			expectedRPID: rpid,
		});
	}

	async generatePasskeyAuthOptions(
		username: string,
	): Promise<PasskeyAuthOptionsResult> {
		return this.app.generatePasskeyAuthOptions.execute(username);
	}

	async verifyPasskeyAuth(
		userId: string,
		response: PasskeyAuthenticationResponseDto,
		origin: string,
		rpid: string,
	): Promise<boolean> {
		return this.app.verifyPasskeyAuth.execute({
			userId,
			response,
			expectedOrigin: origin,
			expectedRPID: rpid,
		});
	}
}
