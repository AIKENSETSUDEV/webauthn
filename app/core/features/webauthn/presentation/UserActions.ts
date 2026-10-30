"use server";

import { z } from "zod";
import type {
	PasskeyAuthenticationOptionsDto,
	PasskeyAuthenticationResponseDto,
	PasskeyRegistrationOptionsDto,
	PasskeyRegistrationResponseDto,
} from "@/app/core/features/webauthn/application/dto/passkey.dto";
import { createWebauthnModule } from "@/app/core/features/webauthn/composition/createWebauthnModule";
import type { User } from "@/app/core/features/webauthn/domain/User";
import { SafeExecute } from "@/app/core/utilities/ErrorHandler";
import { GlobalMapper } from "@/app/core/utilities/GlobalMapper";
import { ZodParser } from "@/app/core/utilities/Validator";

const app = createWebauthnModule();

const credentials = new ZodParser(
	z.object({
		username: z.string().trim().min(1, "Username is required"),
		password: z.string().min(1, "Password is required"),
	}),
);
const userIdInput = new ZodParser(
	z.object({ userId: z.string().trim().min(1, "User id is required") }),
);
const usernameInput = new ZodParser(
	z.object({ username: z.string().trim().min(1, "Username is required") }),
);

function parsePasskeyJson<T>(
	json: string,
): { success: true; data: T } | { success: false; error: Error } {
	try {
		const data = JSON.parse(json) as unknown;
		if (
			!data ||
			typeof data !== "object" ||
			typeof (data as { id?: unknown }).id !== "string" ||
			!(data as { response?: unknown }).response
		) {
			return { success: false, error: new Error("Invalid passkey payload") };
		}
		return { success: true, data: data as T };
	} catch {
		return { success: false, error: new Error("Invalid passkey JSON") };
	}
}

export type PublicUser = {
	id: string;
	username: string;
	createdAt: string;
	lastLoggedIn?: string;
};

function toPublicUser(user: User): PublicUser {
	const plain = GlobalMapper.toPlain(user);
	return {
		id: plain.id,
		username: plain.username,
		createdAt: plain.createdAt.toISOString(),
		...(plain.lastLoggedIn
			? { lastLoggedIn: plain.lastLoggedIn.toISOString() }
			: {}),
	};
}

export async function registerUserAction(
	username: string,
	password: string,
): Promise<PublicUser | Error> {
	const parsed = credentials.parse({ username, password });
	if (!parsed.success) return parsed.error;

	const value = await SafeExecute(app.createUser.execute(parsed.data));
	if (value.error) return value.error;
	return toPublicUser(value.data);
}

export async function loginWithPasswordAction(
	username: string,
	password: string,
): Promise<PublicUser | Error> {
	const parsed = credentials.parse({ username, password });
	if (!parsed.success) return parsed.error;

	const value = await SafeExecute(app.loginWithPassword.execute(parsed.data));
	if (value.error) return value.error;
	return toPublicUser(value.data);
}

export async function generatePasskeyRegistrationOptionsAction(
	userId: string,
): Promise<{ options: PasskeyRegistrationOptionsDto } | Error> {
	const parsed = userIdInput.parse({ userId });
	if (!parsed.success) return parsed.error;

	const value = await SafeExecute(
		app.generatePasskeyRegOptions.execute(parsed.data.userId),
	);
	if (value.error) return value.error;
	return { options: value.data };
}

export async function verifyPasskeyRegistrationAction(
	userId: string,
	responseJson: string,
): Promise<{ verified: true } | Error> {
	const idParsed = userIdInput.parse({ userId });
	if (!idParsed.success) return idParsed.error;

	const body = parsePasskeyJson<PasskeyRegistrationResponseDto>(responseJson);
	if (!body.success) return body.error;

	const value = await SafeExecute(
		app.verifyPasskeyReg.execute({
			userId: idParsed.data.userId,
			response: body.data,
		}),
	);
	if (value.error) return value.error;
	return { verified: true };
}

export async function generatePasskeyAuthOptionsAction(
	username: string,
): Promise<
	{ options: PasskeyAuthenticationOptionsDto; userId: string } | Error
> {
	const parsed = usernameInput.parse({ username });
	if (!parsed.success) return parsed.error;

	const value = await SafeExecute(
		app.generatePasskeyAuthOptions.execute(parsed.data.username),
	);
	if (value.error) return value.error;
	return value.data;
}

export async function verifyPasskeyAuthAction(
	userId: string,
	responseJson: string,
): Promise<{ verified: true } | Error> {
	const idParsed = userIdInput.parse({ userId });
	if (!idParsed.success) return idParsed.error;

	const body = parsePasskeyJson<PasskeyAuthenticationResponseDto>(responseJson);
	if (!body.success) return body.error;

	const value = await SafeExecute(
		app.verifyPasskeyAuth.execute({
			userId: idParsed.data.userId,
			response: body.data,
		}),
	);
	if (value.error) return value.error;
	return { verified: true };
}
