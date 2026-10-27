import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
	IWebAuthnService,
	RegistrationOptionsParams,
} from "@/app/core/features/webauthn/application/IwebAuthnService";

export class WebAuthnService implements IWebAuthnService {
	async generateRegistrationOptions(params: RegistrationOptionsParams) {
		return await generateRegistrationOptions({
			rpName: "SimpleWebAuthN",
			rpID: "localhost",
			userID: new TextEncoder().encode(params.userId),
			userName: params.username,
			userDisplayName: `${params.username} (WebAuthn Demo)`,
			excludeCredentials: params.existingAuthenticators.map((auth) => ({
				id: auth.credentialID,
				...(auth.transports?.length
					? { transports: auth.transports as any }
					: {}),
			})),
			authenticatorSelection: {
				residentKey: "required",
				userVerification: "preferred",
			},
		});
	}

	async verifyRegistration(
		response: any,
		expectedChallenge: string,
		expectedOrigin: string | string[],
		expectedRPID: string,
	) {
		const normalizedResponse = {
			id: response.id,
			rawId: response.rawId,
			type: response.type || "public-key",
			clientExtensionResults: response.clientExtensionResults || {},
			authenticatorAttachment: response.authenticatorAttachment,
			response: {
				clientDataJSON: response.response?.clientDataJSON,
				attestationObject: response.response?.attestationObject,
				transports: response.response?.transports,
			},
		};

		return await verifyRegistrationResponse({
			response: normalizedResponse as any,
			expectedChallenge: String(expectedChallenge),
			expectedOrigin,
			expectedRPID,
		});
	}

	async generateAuthenticationOptions() {
		return await generateAuthenticationOptions({
			rpID: "localhost",
			allowCredentials: [],
			userVerification: "preferred",
		});
	}

	async verifyAuthentication(
		response: any,
		expectedChallenge: string,
		expectedOrigin: string,
		expectedRPID: string,
		authenticator: {
			credentialID: string;
			credentialPublicKey: string;
			counter: number;
			transports?: string[];
		},
	) {
		return await verifyAuthenticationResponse({
			response,
			expectedChallenge,
			expectedOrigin,
			expectedRPID,
			credential: {
				id: authenticator.credentialID,
				publicKey: Buffer.from(
					authenticator.credentialPublicKey,
					"base64url",
				),
				counter: authenticator.counter,
				transports: authenticator.transports as any,
			},
		});
	}
}
