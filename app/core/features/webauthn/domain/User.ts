
export interface AuthenticatorDevice {
    credentialID: string;
    credentialPublicKey: string;
    counter: number;
    transports?: string[];
    /** "platform" (Windows Hello) | "cross-platform" (USB key) */
    authenticatorAttachment?: string;
}

export interface UserProps {
    id: string;
    username: string;
    password: string;
    challenge?: string;
    authenticators?: AuthenticatorDevice[];
}

export class User {
    public readonly id: string;
    public readonly username: string;
    public readonly password: string;
    public challenge?: string;
    public authenticators: AuthenticatorDevice[] = [];

    constructor(props: UserProps) {
        this.id = props.id;
        this.username = props.username;
        this.password = props.password;
        this.challenge = props.challenge;
        this.authenticators = props.authenticators || [];

        if (!this.username || this.username.trim() === "") {
            throw new Error("Username is required to create a user");
        }
        if (!this.password || this.password.trim() === "") {
            throw new Error("Password is required to create user");
        }
    }

    updateChallenge(challenge: string): User {
        return new User({
            ...this,
            challenge,
        });
    }

    addAuthenticator(authenticator: AuthenticatorDevice): User {
        return new User({
            ...this,
            authenticators: [...this.authenticators, authenticator],
            challenge: undefined, 
        });
    }
}