"use server";
import { UserContainer } from "@/app/core/features/webauthn/implementation/UserContainer";
import { UserRepository } from "@/app/core/features/webauthn/implementation/UserRepository";
import { WebAuthnService } from "@/app/core/features/webauthn/implementation/WebauthnService";
import { UserController } from "@/app/core/features/webauthn/presentaion/UserController";

// Composition Root Singletons
const userRepo = new UserRepository();
const webAuthnService = new WebAuthnService();
const userContainer = new UserContainer(userRepo, webAuthnService);
const userController = new UserController(userContainer);

const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const expectedRPID = process.env.NEXT_PUBLIC_APP_URL || "localhost";

export async function registerUserAction(username: string, password: string) {
	try {
		const user = await userController.createUser({ username, password });
		return { success: true, userId: user.id };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function loginWithPasswordAction(
	username: string,
	password: string,
) {
	try {
		const user = await userController.loginWithPassword({
			username,
			password,
		});
		return { success: true, userId: user.id };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function generatePasskeyRegistrationOptionsAction(userId: string) {
	try {
		const options = await userController.generatePasskeyRegOptions(userId);
		return { success: true, options };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function verifyPasskeyRegistrationAction(
	userId: string,
	responseJson: string,
) {
	try {
		const response =
			typeof responseJson === "string"
				? JSON.parse(responseJson)
				: responseJson;

		const verified = await userController.verifyPasskeyReg(
			userId,
			response,
			expectedOrigin,
			expectedRPID,
		);
		return { success: verified };
	} catch (error: any) {
		console.error("WEBFAUTHN_VERIFY_ERROR:", error.message);
		return { success: false, error: error.message };
	}
}

export async function generatePasskeyAuthOptionsAction(username: string) {
	try {
		const result = await userController.generatePasskeyAuthOptions(username);
		console.log(
			"WEBAUTHN_AUTH_OPTIONS:",
			JSON.stringify(result.options, null, 2),
		);
		return { success: true, options: result.options, userId: result.userId };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

export async function verifyPasskeyAuthAction(
	userId: string,
	responseJson: string,
) {
	try {
		const response =
			typeof responseJson === "string"
				? JSON.parse(responseJson)
				: responseJson;

		const verified = await userController.verifyPasskeyAuth(
			userId,
			response,
			expectedOrigin,
			expectedRPID,
		);
		return { success: verified };
	} catch (error: any) {
		console.error("WEBFAUTHN_AUTH_VERIFY_ERROR:", error.message);
		return { success: false, error: error.message };
	}
}
