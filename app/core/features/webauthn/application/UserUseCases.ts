import type {
	PasskeyAuthenticationOptionsDto,
	PasskeyAuthenticationResponseDto,
	PasskeyRegistrationOptionsDto,
	PasskeyRegistrationResponseDto,
} from "@/app/core/features/webauthn/application/dto/passkey.dto";
import type {
	CredentialsDTO,
	IUser,
} from "@/app/core/features/webauthn/application/IUser";
import type { IWebAuthnService } from "@/app/core/features/webauthn/application/IwebAuthnService";
import {
	type AuthenticatorDevice,
	User,
	type UserProps,
} from "@/app/core/features/webauthn/domain/User";
import type { IIDGenerator, ITimeGenerator } from "@/app/core/utilities/Generators";
import type { UseCase } from "@/app/core/utilities/IUseCase";

export class CreateUserUseCase implements UseCase<CredentialsDTO, User> {
	constructor(
		private readonly iuser: IUser,
		private readonly idGenerator: IIDGenerator,
		private readonly timeGenerator: ITimeGenerator,
	) { }

	async execute(input: CredentialsDTO): Promise<User> {
		const existing = await this.iuser.getByUsername(input.username);
		if (existing) {
			throw new Error("Username already exists");
		}

		const now = this.timeGenerator.generate();
		const data: UserProps = {
			id: this.idGenerator.generate(),
			username: input.username,
			password: input.password,
			createdAt: now,
			lastLoggedIn: now,
			authenticators: [],
		};
		return this.iuser.create(new User(data));
	}
}

export class LoginWithPasswordUseCase implements UseCase<CredentialsDTO, User> {
	constructor(
		private readonly iuser: IUser,
		private readonly timeGenerator: ITimeGenerator,
	) { }

	async execute(input: CredentialsDTO): Promise<User> {
		const user = await this.iuser.getByUsername(input.username);
		if (!user || user.password !== input.password) {
			throw new Error("Invalid username or password");
		}

		const updated = user.updateLastLoggedIn(this.timeGenerator.generate());
		return this.iuser.save(updated);
	}
}

export class GeneratePasskeyRegistrationOptionsUseCase
	implements UseCase<string, PasskeyRegistrationOptionsDto> {
	constructor(
		private readonly iuser: IUser,
		private readonly webAuthnService: IWebAuthnService,
	) { }

	async execute(userId: string): Promise<PasskeyRegistrationOptionsDto> {
		const user = await this.iuser.getById(userId);

		const options = await this.webAuthnService.generateRegistrationOptions({
			userId: user.id,
			username: user.username,
			existingAuthenticators: user.authenticators,
		});

		await this.iuser.save(user.updateChallenge(options.challenge));
		return options;
	}
}

export interface VerifyPasskeyRegInput {
	userId: string;
	response: PasskeyRegistrationResponseDto;
}

export class VerifyPasskeyRegistrationUseCase
	implements UseCase<VerifyPasskeyRegInput, true> {
	constructor(
		private readonly iuser: IUser,
		private readonly webAuthnService: IWebAuthnService,
	) { }

	async execute(input: VerifyPasskeyRegInput): Promise<true> {
		const user = await this.iuser.getById(input.userId);
		if (!user.challenge) throw new Error("User or challenge not found");

		const verification = await this.webAuthnService.verifyRegistration(
			input.response,
			user.challenge,
		);

		if (!verification.verified || !verification.registrationInfo) {
			throw new Error("Passkey registration verification failed");
		}

		const { credential } = verification.registrationInfo;
		const newAuthenticator: AuthenticatorDevice = {
			credentialID: credential.id,
			credentialPublicKey: Buffer.from(credential.publicKey).toString(
				"base64url",
			),
			counter: credential.counter,
			transports: credential.transports,
			authenticatorAttachment: input.response.authenticatorAttachment,
		};

		await this.iuser.save(user.addAuthenticator(newAuthenticator));
		return true;
	}
}

export interface PasskeyAuthOptionsResult {
	options: PasskeyAuthenticationOptionsDto;
	userId: string;
}

export class GeneratePasskeyAuthOptionsUseCase
	implements UseCase<string, PasskeyAuthOptionsResult> {
	constructor(
		private readonly iuser: IUser,
		private readonly webAuthnService: IWebAuthnService,
	) { }

	async execute(username: string): Promise<PasskeyAuthOptionsResult> {
		const user = await this.iuser.getByUsername(username);
		if (!user) throw new Error("User not found");
		if (!user.authenticators.length) {
			throw new Error("No passkey registered for this user");
		}

		const options = await this.webAuthnService.generateAuthenticationOptions();
		await this.iuser.save(user.updateChallenge(options.challenge));

		return { options, userId: user.id };
	}
}

export interface VerifyPasskeyAuthInput {
	userId: string;
	response: PasskeyAuthenticationResponseDto;
}

export class VerifyPasskeyAuthUseCase
	implements UseCase<VerifyPasskeyAuthInput, true> {
	constructor(
		private readonly iuser: IUser,
		private readonly webAuthnService: IWebAuthnService,
		private readonly timeGenerator: ITimeGenerator,
	) { }

	async execute(input: VerifyPasskeyAuthInput): Promise<true> {
		const user = await this.iuser.getById(input.userId);
		if (!user.challenge) throw new Error("User or challenge not found");

		const userHandle = input.response.response.userHandle;
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
			authenticator,
		);

		if (!verification.verified || !verification.authenticationInfo) {
			throw new Error("Passkey authentication verification failed");
		}

		const updated = user
			.updateAuthenticatorCounter(
				authenticator.credentialID,
				verification.authenticationInfo.newCounter,
			)
			.clearChallenge()
			.updateLastLoggedIn(this.timeGenerator.generate());

		await this.iuser.save(updated);
		return true;
	}
}

export class GetUserByIdUseCase implements UseCase<string, User> {
	constructor(private readonly iuser: IUser) { }

	async execute(id: string): Promise<User> {
		return await this.iuser.getById(id);
	}
}


export interface UserApplication {
	createUser: CreateUserUseCase;
	loginWithPassword: LoginWithPasswordUseCase;
	generatePasskeyRegOptions: GeneratePasskeyRegistrationOptionsUseCase;
	verifyPasskeyReg: VerifyPasskeyRegistrationUseCase;
	generatePasskeyAuthOptions: GeneratePasskeyAuthOptionsUseCase;
	verifyPasskeyAuth: VerifyPasskeyAuthUseCase;
	getById: GetUserByIdUseCase;
}
