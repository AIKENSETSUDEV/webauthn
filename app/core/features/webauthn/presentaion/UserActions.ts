"use server";

import type {
	PasskeyAuthenticationOptionsDto,
	PasskeyAuthenticationResponseDto,
	PasskeyRegistrationOptionsDto,
	PasskeyRegistrationResponseDto,
} from "@/app/core/features/webauthn/application/dto/passkey.dto";
import { createWebauthnModule } from "@/app/core/features/webauthn/composition/createWebauthnModule";
import type { ActionResult } from "@/app/core/features/webauthn/presentaion/actionResult";
import { toErrorMessage } from "@/app/core/features/webauthn/presentaion/actionResult";
import { UserController } from "@/app/core/features/webauthn/presentaion/UserController";

/** Delivery entry: obtains the already-wired application API from the slice composition root. */
const userController = new UserController(createWebauthnModule());

const expectedOrigin =
	process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const expectedRPID = process.env.NEXT_PUBLIC_RP_ID || "localhost";

function parseJson<T>(value: string): T {
	return JSON.parse(value) as T;
}

export async function registerUserAction(
	username: string,
	password: string,
): Promise<ActionResult<{ userId: string }>> {
	try {
		const user = await userController.createUser({ username, password });
		return { success: true, userId: user.id };
	} catch (error: unknown) {
		return { success: false, error: toErrorMessage(error) };
	}
}

export async function loginWithPasswordAction(
	username: string,
	password: string,
): Promise<ActionResult<{ userId: string }>> {
	try {
		const user = await userController.loginWithPassword({
			username,
			password,
		});
		return { success: true, userId: user.id };
	} catch (error: unknown) {
		return { success: false, error: toErrorMessage(error) };
	}
}

export async function generatePasskeyRegistrationOptionsAction(
	userId: string,
): Promise<ActionResult<{ options: PasskeyRegistrationOptionsDto }>> {
	try {
		const options = await userController.generatePasskeyRegOptions(userId);
		return { success: true, options };
	} catch (error: unknown) {
		return { success: false, error: toErrorMessage(error) };
	}
}

export async function verifyPasskeyRegistrationAction(
	userId: string,
	responseJson: string,
): Promise<ActionResult> {
	try {
		const response = parseJson<PasskeyRegistrationResponseDto>(responseJson);
		const verified = await userController.verifyPasskeyReg(
			userId,
			response,
			expectedOrigin,
			expectedRPID,
		);
		return verified
			? { success: true }
			: { success: false, error: "Passkey registration verification failed" };
	} catch (error: unknown) {
		console.error("WEBFAUTHN_VERIFY_ERROR:", toErrorMessage(error));
		return { success: false, error: toErrorMessage(error) };
	}
}

export async function generatePasskeyAuthOptionsAction(
	username: string,
): Promise<
	ActionResult<{ options: PasskeyAuthenticationOptionsDto; userId: string }>
> {
	try {
		const result = await userController.generatePasskeyAuthOptions(username);
		console.log(
			"WEBAUTHN_AUTH_OPTIONS:",
			JSON.stringify(result.options, null, 2),
		);
		return { success: true, options: result.options, userId: result.userId };
	} catch (error: unknown) {
		return { success: false, error: toErrorMessage(error) };
	}
}

export async function verifyPasskeyAuthAction(
	userId: string,
	responseJson: string,
): Promise<ActionResult> {
	try {
		const response = parseJson<PasskeyAuthenticationResponseDto>(responseJson);
		const verified = await userController.verifyPasskeyAuth(
			userId,
			response,
			expectedOrigin,
			expectedRPID,
		);
		return verified
			? { success: true }
			: {
					success: false,
					error: "Passkey authentication verification failed",
				};
	} catch (error: unknown) {
		console.error("WEBFAUTHN_AUTH_VERIFY_ERROR:", toErrorMessage(error));
		return { success: false, error: toErrorMessage(error) };
	}
}
