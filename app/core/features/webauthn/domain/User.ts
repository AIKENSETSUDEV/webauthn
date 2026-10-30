export interface AuthenticatorDevice {
	credentialID: string;
	credentialPublicKey: string;
	counter: number;
	transports?: AuthenticatorTransport[];
	authenticatorAttachment?: AuthenticatorAttachment;
}

export interface UserProps {
	id: string;
	username: string;
	password: string;
	createdAt: Date;
	lastLoggedIn?: Date;
	challenge?: string;
	authenticators?: AuthenticatorDevice[];
}

export class User {
	public readonly id: string;
	public readonly username: string;
	public readonly password: string;
	public readonly createdAt: Date;
	public lastLoggedIn?: Date;
	public challenge?: string;
	public authenticators: AuthenticatorDevice[] = [];

	constructor(props: UserProps) {
		this.id = props.id;
		this.username = props.username;
		this.password = props.password;
		this.createdAt = props.createdAt;
		this.lastLoggedIn = props.lastLoggedIn;
		this.challenge = props.challenge;
		this.authenticators = props.authenticators || [];

		if (!this.username || this.username.trim() === "") {
			throw new Error("Username is required to create a user");
		}
		if (!this.password || this.password.trim() === "") {
			throw new Error("Password is required to create user");
		}
	}

	updateChallenge(challenge: string | undefined): User {
		return new User({
			...this,
			challenge,
		});
	}

	clearChallenge(): User {
		return this.updateChallenge(undefined);
	}

	updateLastLoggedIn(at: Date): User {
		return new User({
			...this,
			lastLoggedIn: at,
		});
	}

	addAuthenticator(authenticator: AuthenticatorDevice): User {
		return new User({
			...this,
			authenticators: [...this.authenticators, authenticator],
			challenge: undefined,
		});
	}

	updateAuthenticatorCounter(credentialID: string, counter: number): User {
		const authenticators = this.authenticators.map((auth) =>
			auth.credentialID === credentialID ? { ...auth, counter } : auth,
		);
		return new User({
			...this,
			authenticators,
		});
	}
}
