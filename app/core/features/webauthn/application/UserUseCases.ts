// //application/UserUseCases.ts
import { User, type UserProps } from "../domain/User";
import type { CreateUserDTO, IUser, LoginUserDTO } from "./IUser";
import type { IWebAuthnService } from "./IwebAuthnService";

export type UseCase<T, O> = {
	execute(input: T): Promise<O>;
};

export class CreateUserUseCase implements UseCase<CreateUserDTO, User> {
	constructor(private readonly iuser: IUser) {}
	async execute(input: CreateUserDTO): Promise<User> {
		const existing = await this.iuser.getByUsername(input.username);
		if (existing) {
			throw new Error("Username already exists");
		}

		const data: UserProps = {
			id: crypto.randomUUID(),
			username: input.username,
			password: input.password,
			authenticators: [],
		};
		return this.iuser.create(new User(data));
	}
}

export class LoginWithPasswordUseCase implements UseCase<LoginUserDTO, User> {
	constructor(private readonly iuser: IUser) {}
	async execute(input: LoginUserDTO): Promise<User> {
		const user = await this.iuser.getByUsername(input.username);
		if (!user || user.password !== input.password) {
			throw new Error("Invalid username or password");
		}
		return user;
	}
}

export class GetByIDUseCase implements UseCase<string, User> {
	constructor(private readonly iuser: IUser) {}
	execute(input: string): Promise<User> {
		return this.iuser.getById(input);
	}
}

export class SaveUserUseCase implements UseCase<User, User> {
	constructor(private readonly iuser: IUser) {}
	execute(input: User): Promise<User> {
		return this.iuser.save(input);
	}
}

export class GeneratePasskeyRegistrationOptionsUseCase
	implements UseCase<string, any>
{
	constructor(
		private readonly iuser: IUser,
		private readonly webAuthnService: IWebAuthnService,
	) {}

	async execute(userId: string): Promise<any> {
		const user = await this.iuser.getById(userId);
		if (!user) throw new Error("User not found");

		const options = await this.webAuthnService.generateRegistrationOptions({
			userId: user.id,
			username: user.username,
			existingAuthenticators: user.authenticators,
		});

		const updated = user.updateChallenge(options.challenge);
		await this.iuser.save(updated);

		return options;
	}
}

export interface VerifyPasskeyRegInput {
	userId: string;
	response: any;
	expectedOrigin: string;
	expectedRPID: string;
}

export class VerifyPasskeyRegistrationUseCase
	implements UseCase<VerifyPasskeyRegInput, boolean>
{
	constructor(
		private readonly iuser: IUser,
		private readonly webAuthnService: IWebAuthnService,
	) {}

	async execute(input: VerifyPasskeyRegInput): Promise<boolean> {
		const user = await this.iuser.getById(input.userId);
		if (!user || !user.challenge)
			throw new Error("User or challenge not found");

		const verification = await this.webAuthnService.verifyRegistration(
			input.response,
			user.challenge,
			input.expectedOrigin,
			input.expectedRPID,
		);

		if (verification.verified && verification.registrationInfo) {
			const { credential } = verification.registrationInfo;

			const newAuthenticator = {
				// SimpleWebAuthn v13+ returns credential.id as base64url — keep as-is
				credentialID: credential.id,
				credentialPublicKey: Buffer.from(credential.publicKey).toString(
					"base64url",
				),
				counter: credential.counter,
				transports: credential.transports,
				authenticatorAttachment: input.response.authenticatorAttachment,
			};

			const updated = user.addAuthenticator(newAuthenticator);
			await this.iuser.save(updated);
			return true;
		}

		return false;
	}
}

export class GeneratePasskeyAuthOptionsUseCase
	implements UseCase<string, { options: any; userId: string }>
{
	constructor(
		private readonly iuser: IUser,
		private readonly webAuthnService: IWebAuthnService,
	) {}

	async execute(username: string): Promise<{ options: any; userId: string }> {
		const user = await this.iuser.getByUsername(username);
		if (!user) throw new Error("User not found");
		if (!user.authenticators.length) {
			throw new Error("No passkey registered for this user");
		}

		const options = await this.webAuthnService.generateAuthenticationOptions();

		const updated = user.updateChallenge(options.challenge);
		await this.iuser.save(updated);

		return { options, userId: user.id };
	}
}

export interface VerifyPasskeyAuthInput {
	userId: string;
	response: any;
	expectedOrigin: string;
	expectedRPID: string;
}

export class VerifyPasskeyAuthUseCase
	implements UseCase<VerifyPasskeyAuthInput, boolean>
{
	constructor(
		private readonly iuser: IUser,
		private readonly webAuthnService: IWebAuthnService,
	) {}

	async execute(input: VerifyPasskeyAuthInput): Promise<boolean> {
		const user = await this.iuser.getById(input.userId);
		if (!user || !user.challenge)
			throw new Error("User or challenge not found");

		const userHandle = input.response.response?.userHandle;
		if (
			userHandle &&
			Buffer.from(userHandle, "base64url").toString() !== user.id
		) {
			throw new Error(
				`The selected passkey belongs to another account or app on this domain. Choose the "${user.username}" passkey for this app, or delete old localhost passkeys in your OS passkey settings.`,
			);
		}

		const authenticator = user.authenticators.find(
			(auth) => auth.credentialID === input.response.id,
		);
		if (!authenticator) {
			throw new Error("This passkey is not registered to this account");
		}

		const verification = await this.webAuthnService.verifyAuthentication(
			input.response,
			user.challenge,
			input.expectedOrigin,
			input.expectedRPID,
			authenticator,
		);

		if (verification.verified && verification.authenticationInfo) {
			authenticator.counter = verification.authenticationInfo.newCounter;
			const updated = user.updateChallenge("");
			await this.iuser.save(updated);
			return true;
		}

		return false;
	}
}
