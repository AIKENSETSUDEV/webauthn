import type {
	CreateUserUseCase,
	GeneratePasskeyAuthOptionsUseCase,
	GeneratePasskeyRegistrationOptionsUseCase,
	GetByIDUseCase,
	LoginWithPasswordUseCase,
	VerifyPasskeyAuthUseCase,
	VerifyPasskeyRegistrationUseCase,
} from "@/app/core/features/webauthn/application/UserUseCases";

/**
 * Application API surface for this vertical slice.
 * Presentation depends on this shape; composition supplies the instances.
 */
export interface UserApplication {
	createUser: CreateUserUseCase;
	loginWithPassword: LoginWithPasswordUseCase;
	getById: GetByIDUseCase;
	generatePasskeyRegOptions: GeneratePasskeyRegistrationOptionsUseCase;
	verifyPasskeyReg: VerifyPasskeyRegistrationUseCase;
	generatePasskeyAuthOptions: GeneratePasskeyAuthOptionsUseCase;
	verifyPasskeyAuth: VerifyPasskeyAuthUseCase;
}
