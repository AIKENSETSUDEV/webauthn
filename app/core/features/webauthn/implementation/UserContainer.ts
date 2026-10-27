import type { IUser } from "../application/IUser";
import type { IWebAuthnService } from "../application/IwebAuthnService";

import {
	CreateUserUseCase,
	GeneratePasskeyAuthOptionsUseCase,
	GeneratePasskeyRegistrationOptionsUseCase,
	GetByIDUseCase,
	LoginWithPasswordUseCase,
	SaveUserUseCase,
	VerifyPasskeyAuthUseCase,
	VerifyPasskeyRegistrationUseCase,
} from "../application/UserUseCases";

export class UserContainer {
	constructor(
		private readonly iuser: IUser,
		private readonly webAuthnService: IWebAuthnService,
	) {}

	createUser(): CreateUserUseCase {
		return new CreateUserUseCase(this.iuser);
	}

	loginWithPassword(): LoginWithPasswordUseCase {
		return new LoginWithPasswordUseCase(this.iuser);
	}

	findByIdUseCase(): GetByIDUseCase {
		return new GetByIDUseCase(this.iuser);
	}

	updateUserUseCase(): SaveUserUseCase {
		return new SaveUserUseCase(this.iuser);
	}

	generatePasskeyRegOptions(): GeneratePasskeyRegistrationOptionsUseCase {
		return new GeneratePasskeyRegistrationOptionsUseCase(
			this.iuser,
			this.webAuthnService,
		);
	}

	verifyPasskeyReg(): VerifyPasskeyRegistrationUseCase {
		return new VerifyPasskeyRegistrationUseCase(
			this.iuser,
			this.webAuthnService,
		);
	}

	generatePasskeyAuthOptions(): GeneratePasskeyAuthOptionsUseCase {
		return new GeneratePasskeyAuthOptionsUseCase(
			this.iuser,
			this.webAuthnService,
		);
	}

	verifyPasskeyAuth(): VerifyPasskeyAuthUseCase {
		return new VerifyPasskeyAuthUseCase(this.iuser, this.webAuthnService);
	}
}
