/** biome-ignore-all assist/source/organizeImports: <explanation> */
import type { AuthenticatorDevice } from "@/app/core/features/webauthn/domain/User";
import type {
	AuthenticationVerificationResult,
	PasskeyAuthenticationOptionsDto,
	PasskeyAuthenticationResponseDto,
	PasskeyRegistrationOptionsDto,
	PasskeyRegistrationResponseDto,
	RegistrationVerificationResult,
} from "@/app/core/features/webauthn/application/dto/passkey.dto";

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
		expectedOrigin: string | string[],
		expectedRPID: string,
	): Promise<RegistrationVerificationResult>;

	generateAuthenticationOptions(): Promise<PasskeyAuthenticationOptionsDto>;

	verifyAuthentication(
		response: PasskeyAuthenticationResponseDto,
		expectedChallenge: string,
		expectedOrigin: string,
		expectedRPID: string,
		authenticator: Pick<
			AuthenticatorDevice,
			"credentialID" | "credentialPublicKey" | "counter" | "transports"
		>,
	): Promise<AuthenticationVerificationResult>;
}
