"use client";
import {
	startAuthentication,
	startRegistration,
} from "@simplewebauthn/browser";
import { useState } from "react";
import {
	generatePasskeyAuthOptionsAction,
	generatePasskeyRegistrationOptionsAction,
	loginWithPasswordAction,
	registerUserAction,
	verifyPasskeyAuthAction,
	verifyPasskeyRegistrationAction,
} from "@/app/core/features/webauthn/presentaion/UserActions";

export default function PasskeyDemoPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [userId, setUserId] = useState<string | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [statusMessage, setStatusMessage] = useState("");

	async function handleRegister() {
		setStatusMessage("Registering user...");
		const result = await registerUserAction(username, password);
		if (result.success) {
			setUserId(result.userId);
			setIsLoggedIn(true);
			setStatusMessage("Registered and logged in successfully!");
		} else {
			setStatusMessage(`Registration failed: ${result.error}`);
		}
	}

	async function handleTraditionalLogin() {
		setStatusMessage("Logging in with password...");
		const result = await loginWithPasswordAction(username, password);
		if (result.success) {
			setUserId(result.userId);
			setIsLoggedIn(true);
			setStatusMessage("Logged in with username/password!");
		} else {
			setStatusMessage(`Login failed: ${result.error}`);
		}
	}

	async function handleAddPasskey() {
		if (!userId) {
			setStatusMessage("Error: You must be logged in to add a passkey.");
			return;
		}

		try {
			setStatusMessage("Generating passkey registration options...");
			const optResult = await generatePasskeyRegistrationOptionsAction(userId);
			if (!optResult.success) {
				throw new Error(optResult.error);
			}

			setStatusMessage(
				"Choose a passkey provider (Windows Hello, Google Password Manager, security key, phone…)",
			);
			const attResp = await startRegistration({
				optionsJSON: optResult.options as Parameters<
					typeof startRegistration
				>[0]["optionsJSON"],
			});

			setStatusMessage("Verifying passkey on server...");
			const verificationResult = await verifyPasskeyRegistrationAction(
				userId,
				JSON.stringify(attResp),
			);

			if (verificationResult.success) {
				const transports =
					attResp.response?.transports?.join(", ") || "unknown";
				const attachment = attResp.authenticatorAttachment || "unknown";
				setStatusMessage(
					`Passkey added (${attachment}; transports: ${transports}). Use that same provider when logging in.`,
				);
			} else {
				const message = verificationResult.error
					? verificationResult.error
					: "";
				setStatusMessage(`Passkey verification failed${message}`);
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			setStatusMessage(`Passkey registration error: ${message}`);
		}
	}

	async function handlePasskeyLogin() {
		try {
			if (!username.trim()) {
				setStatusMessage("Enter your username before passkey login.");
				return;
			}

			setStatusMessage("Fetching authentication options...");
			const optResult = await generatePasskeyAuthOptionsAction(username);
			if (!optResult.success) {
				throw new Error(optResult.error);
			}

			setUserId(optResult.userId);

			setStatusMessage("Prompting passkey…");
			const assertResp = await startAuthentication({
				optionsJSON: optResult.options as Parameters<
					typeof startAuthentication
				>[0]["optionsJSON"],
			});

			setStatusMessage("Verifying passkey login...");
			const verificationResult = await verifyPasskeyAuthAction(
				optResult.userId,
				JSON.stringify(assertResp),
			);

			if (verificationResult.success) {
				setIsLoggedIn(true);
				setStatusMessage(
					"Logged in successfully using Passkey without a password!",
				);
			} else {
				const message = verificationResult.error
					? verificationResult.error
					: "";

				setStatusMessage(`Passkey login verification failed ${message}`);
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			const name =
				error instanceof Error && error.name ? ` (${error.name})` : "";
			setStatusMessage(`Passkey login error${name}: ${message}`);
		}
	}

	function handleLogout() {
		setUserId(null);
		setIsLoggedIn(false);
		setUsername("");
		setPassword("");
		setStatusMessage("Logged out.");
	}

	return (
		<main className="max-w-md mx-auto p-6 space-y-6 font-sans">
			<h1 className="text-2xl font-bold">WebAuthn Clean Architecture Demo</h1>

			<div className="p-3 bg-gray-100 border rounded text-sm text-gray-700 min-h-[50px]">
				<strong>Status:</strong> {statusMessage || "Ready"}
			</div>

			{!isLoggedIn ? (
				<div className="space-y-4 border p-4 rounded shadow-sm">
					<h2 className="text-lg font-semibold">
						Authentication / Registration
					</h2>

					<div>
						<label className="block text-sm font-medium" htmlFor="username">
							Username
						</label>
						<input
							type="text"
							name="username"
							autoComplete="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full border p-2 rounded mt-1"
							placeholder="johndoe"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium" htmlFor="password">
							Password
						</label>
						<input
							type="password"
							name="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full border p-2 rounded mt-1"
							placeholder="••••••••"
						/>
					</div>

					<div className="flex gap-2 pt-2">
						<button
							type="button"
							onClick={handleRegister}
							className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
						>
							Register
						</button>
						<button
							type="button"
							onClick={handleTraditionalLogin}
							className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
						>
							Login (Password)
						</button>
					</div>

					<hr className="my-2" />

					<div>
						<button
							type="button"
							onClick={handlePasskeyLogin}
							className="w-full bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700 font-medium"
						>
							Login with Passkey (No Password)
						</button>
					</div>
				</div>
			) : (
				<div className="space-y-4 border p-4 rounded shadow-sm bg-green-50">
					<h2 className="text-lg font-semibold text-green-800">
						Welcome, {username}!
					</h2>
					<p className="text-xs text-gray-500 break-all">
						Session User ID: {userId}
					</p>

					<div className="space-y-2 pt-2">
						<button
							type="button"
							onClick={handleAddPasskey}
							className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
						>
							Add Passkey to Account
						</button>

						<button
							type="button"
							onClick={handleLogout}
							className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
						>
							Logout
						</button>
					</div>
				</div>
			)}
		</main>
	);
}
