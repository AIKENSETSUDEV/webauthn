import type { UserApplication } from "@/app/core/features/webauthn/application/UserApplication";
import {
	CreateUserUseCase,
	GeneratePasskeyAuthOptionsUseCase,
	GeneratePasskeyRegistrationOptionsUseCase,
	GetByIDUseCase,
	LoginWithPasswordUseCase,
	VerifyPasskeyAuthUseCase,
	VerifyPasskeyRegistrationUseCase,
} from "@/app/core/features/webauthn/application/UserUseCases";
import { UserRepository } from "@/app/core/features/webauthn/implementation/UserRepository";
import { WebAuthnService } from "@/app/core/features/webauthn/implementation/WebauthnService";

/**
 * Feature-slice composition root.
 * Only this module may construct concrete infrastructure adapters.
 */
export function createWebauthnModule(): UserApplication {
	const userRepo = new UserRepository();
	const webAuthnService = new WebAuthnService();

	return {
		createUser: new CreateUserUseCase(userRepo),
		loginWithPassword: new LoginWithPasswordUseCase(userRepo),
		getById: new GetByIDUseCase(userRepo),
		generatePasskeyRegOptions: new GeneratePasskeyRegistrationOptionsUseCase(
			userRepo,
			webAuthnService,
		),
		verifyPasskeyReg: new VerifyPasskeyRegistrationUseCase(
			userRepo,
			webAuthnService,
		),
		generatePasskeyAuthOptions: new GeneratePasskeyAuthOptionsUseCase(
			userRepo,
			webAuthnService,
		),
		verifyPasskeyAuth: new VerifyPasskeyAuthUseCase(
			userRepo,
			webAuthnService,
		),
	};
}
