import type {
	AuthenticationVerificationResult,
	PasskeyAuthenticationOptionsDto,
	PasskeyAuthenticationResponseDto,
	PasskeyRegistrationOptionsDto,
	PasskeyRegistrationResponseDto,
	RegistrationVerificationResult,
} from "@/app/core/features/webauthn/application/dto/passkey.dto";
import type { AuthenticatorDevice } from "@/app/core/features/webauthn/domain/User";

export interface RegistrationOptionsParams {
	userId: string;
	username: string;
	existingAuthenticators: Array<
		Pick<AuthenticatorDevice, "credentialID" | "transports">
	>;
}

export interface IWebAuthnService {
	generateRegistrationOptions(
		params: RegistrationOptionsParams,
	): Promise<PasskeyRegistrationOptionsDto>;

	verifyRegistration(
		response: PasskeyRegistrationResponseDto,
		expectedChallenge: string,
	): Promise<RegistrationVerificationResult>;

	generateAuthenticationOptions(): Promise<PasskeyAuthenticationOptionsDto>;

	verifyAuthentication(
		response: PasskeyAuthenticationResponseDto,
		expectedChallenge: string,
		authenticator: Pick<
			AuthenticatorDevice,
			"credentialID" | "credentialPublicKey" | "counter" | "transports"
		>,
	): Promise<AuthenticationVerificationResult>;
}
