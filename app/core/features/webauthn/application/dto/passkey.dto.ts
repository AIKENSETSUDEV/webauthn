/** Browser create() options — owned shape; adapter maps library → this. */
export type PasskeyRegistrationOptionsDto = {
	challenge: Base64URLString;
	rp: PublicKeyCredentialRpEntity;
	user: PublicKeyCredentialUserEntityJSON;
	pubKeyCredParams: PublicKeyCredentialParameters[];
	timeout?: number;
	excludeCredentials?: PublicKeyCredentialDescriptorJSON[];
	authenticatorSelection?: AuthenticatorSelectionCriteria;
	attestation?: AttestationConveyancePreference;
	extensions?: AuthenticationExtensionsClientInputsJSON;
	hints?: string[];
};

/** Browser get() options — owned shape; adapter maps library → this. */
export type PasskeyAuthenticationOptionsDto = {
	challenge: Base64URLString;
	timeout?: number;
	rpId?: string;
	allowCredentials?: PublicKeyCredentialDescriptorJSON[];
	userVerification?: UserVerificationRequirement;
	extensions?: AuthenticationExtensionsClientInputsJSON;
	hints?: string[];
};

/** Client → server attestation payload. */
export type PasskeyRegistrationResponseDto = {
	id: Base64URLString;
	rawId: Base64URLString;
	type: PublicKeyCredentialType;
	authenticatorAttachment?: AuthenticatorAttachment;
	clientExtensionResults?: AuthenticationExtensionsClientOutputs;
	response: {
		clientDataJSON: Base64URLString;
		attestationObject: Base64URLString;
		transports?: AuthenticatorTransport[];
		authenticatorData?: Base64URLString;
		publicKeyAlgorithm?: COSEAlgorithmIdentifier;
		publicKey?: Base64URLString;
	};
};

/** Client → server assertion payload. */
export type PasskeyAuthenticationResponseDto = {
	id: Base64URLString;
	rawId: Base64URLString;
	type: PublicKeyCredentialType;
	authenticatorAttachment?: AuthenticatorAttachment;
	clientExtensionResults?: AuthenticationExtensionsClientOutputs;
	response: {
		clientDataJSON: Base64URLString;
		authenticatorData: Base64URLString;
		signature: Base64URLString;
		userHandle?: Base64URLString;
	};
};

export type RegistrationVerificationResult =
	| { verified: false; registrationInfo?: undefined }
	| {
			verified: true;
			registrationInfo: {
				credential: {
					id: string;
					publicKey: Uint8Array;
					counter: number;
					transports?: AuthenticatorTransport[];
				};
			};
	  };

export type AuthenticationVerificationResult =
	| { verified: false; authenticationInfo?: undefined }
	| {
			verified: true;
			authenticationInfo: {
				newCounter: number;
			};
	  };
