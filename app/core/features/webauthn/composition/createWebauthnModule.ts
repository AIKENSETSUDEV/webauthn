import {
	CreateUserUseCase,
	GeneratePasskeyAuthOptionsUseCase,
	GeneratePasskeyRegistrationOptionsUseCase,
	LoginWithPasswordUseCase,
	type UserApplication,
	VerifyPasskeyAuthUseCase,
	VerifyPasskeyRegistrationUseCase,
} from "@/app/core/features/webauthn/application/UserUseCases";
import { UserRepository } from "@/app/core/features/webauthn/implementation/UserRepository";
import { WebAuthnService } from "@/app/core/features/webauthn/implementation/WebauthnService";
import {
	NanoIDGenerator,
	SystemTimeGenerator,
} from "@/app/core/utilities/Generators";

let moduleInstance: UserApplication | null = null;

/**
 * Feature-slice composition root.
 * Only place that constructs concrete adapters and use cases.
 */
export function createWebauthnModule(): UserApplication {
	if (moduleInstance) return moduleInstance;

	const users = new UserRepository();
	const webauthn = new WebAuthnService({
		rpName: "SimpleWebAuthN",
		rpID: process.env.NEXT_PUBLIC_RP_ID || "localhost",
		origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	});
	const ids = new NanoIDGenerator("user");
	const time = new SystemTimeGenerator();

	moduleInstance = {
		createUser: new CreateUserUseCase(users, ids, time),
		loginWithPassword: new LoginWithPasswordUseCase(users, time),
		generatePasskeyRegOptions: new GeneratePasskeyRegistrationOptionsUseCase(
			users,
			webauthn,
		),
		verifyPasskeyReg: new VerifyPasskeyRegistrationUseCase(users, webauthn),
		generatePasskeyAuthOptions: new GeneratePasskeyAuthOptionsUseCase(
			users,
			webauthn,
		),
		verifyPasskeyAuth: new VerifyPasskeyAuthUseCase(users, webauthn, time),
	};

	return moduleInstance;
}
