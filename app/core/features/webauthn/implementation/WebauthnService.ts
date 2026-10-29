import type {
	AuthenticationResponseJSON,
	RegistrationResponseJSON,
} from "@simplewebauthn/server";
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
	AuthenticationVerificationResult,
	PasskeyAuthenticationOptionsDto,
	PasskeyAuthenticationResponseDto,
	PasskeyRegistrationOptionsDto,
	PasskeyRegistrationResponseDto,
	RegistrationVerificationResult,
} from "@/app/core/features/webauthn/application/dto/passkey.dto";
import type {
	IWebAuthnService,
	RegistrationOptionsParams,
} from "@/app/core/features/webauthn/application/IwebAuthnService";
import type { AuthenticatorDevice } from "@/app/core/features/webauthn/domain/User";
import { toAuthenticatorTransports } from "@/app/core/features/webauthn/implementation/transport";

export class WebAuthnService implements IWebAuthnService {
	async generateRegistrationOptions(
		params: RegistrationOptionsParams,
	): Promise<PasskeyRegistrationOptionsDto> {
		const options = await generateRegistrationOptions({
			rpName: "SimpleWebAuthN",
			rpID: "localhost",
			userID: new TextEncoder().encode(params.userId),
			userName: params.username,
			userDisplayName: `${params.username} (WebAuthn Demo)`,
			excludeCredentials: params.existingAuthenticators.map((auth) => ({
				id: auth.credentialID,
				...(auth.transports?.length ? { transports: auth.transports } : {}),
			})),
			authenticatorSelection: {
				residentKey: "required",
				userVerification: "preferred",
			},
		});

		return options as unknown as PasskeyRegistrationOptionsDto;
	}

	async verifyRegistration(
		response: PasskeyRegistrationResponseDto,
		expectedChallenge: string,
		expectedOrigin: string | string[],
		expectedRPID: string,
	): Promise<RegistrationVerificationResult> {
		const verification = await verifyRegistrationResponse({
			response: response as RegistrationResponseJSON,
			expectedChallenge: String(expectedChallenge),
			expectedOrigin,
			expectedRPID,
		});

		if (!verification.verified || !verification.registrationInfo) {
			return { verified: false };
		}

		const { credential } = verification.registrationInfo;
		return {
			verified: true,
			registrationInfo: {
				credential: {
					id: credential.id,
					publicKey: credential.publicKey,
					counter: credential.counter,
					transports: toAuthenticatorTransports(credential.transports),
				},
			},
		};
	}

	async generateAuthenticationOptions(): Promise<PasskeyAuthenticationOptionsDto> {
		const options = await generateAuthenticationOptions({
			rpID: "localhost",
			allowCredentials: [],
			userVerification: "preferred",
		});

		return options as unknown as PasskeyAuthenticationOptionsDto;
	}

	async verifyAuthentication(
		response: PasskeyAuthenticationResponseDto,
		expectedChallenge: string,
		expectedOrigin: string,
		expectedRPID: string,
		authenticator: Pick<
			AuthenticatorDevice,
			"credentialID" | "credentialPublicKey" | "counter" | "transports"
		>,
	): Promise<AuthenticationVerificationResult> {
		const verification = await verifyAuthenticationResponse({
			response: response as AuthenticationResponseJSON,
			expectedChallenge,
			expectedOrigin,
			expectedRPID,
			credential: {
				id: authenticator.credentialID,
				publicKey: Buffer.from(authenticator.credentialPublicKey, "base64url"),
				counter: authenticator.counter,
				transports: authenticator.transports,
			},
		});

		if (!verification.verified || !verification.authenticationInfo) {
			return { verified: false };
		}

		return {
			verified: true,
			authenticationInfo: {
				newCounter: verification.authenticationInfo.newCounter,
			},
		};
	}
}
