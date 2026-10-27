export interface RegistrationOptionsParams {
	userId: string;
	username: string;
	existingAuthenticators: Array<{
		credentialID: string;
		transports?: string[];
	}>;
}

export interface IWebAuthnService {
	generateRegistrationOptions(params: RegistrationOptionsParams): Promise<any>;
	verifyRegistration(
		response: any,
		expectedChallenge: string,
		expectedOrigin: string,
		expectedRPID: string,
	): Promise<any>;
	generateAuthenticationOptions(): Promise<any>;
	verifyAuthentication(
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
	): Promise<any>;
}
