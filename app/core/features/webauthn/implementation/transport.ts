const AUTHENTICATOR_TRANSPORTS = new Set<string>([
	"usb",
	"ble",
	"nfc",
	"internal",
	"hybrid",
]);

/** Narrow unknown transport strings from libraries to DOM AuthenticatorTransport. */
export function toAuthenticatorTransports(
	transports?: readonly string[],
): AuthenticatorTransport[] | undefined {
	if (!transports?.length) return undefined;
	const filtered = transports.filter((t): t is AuthenticatorTransport =>
		AUTHENTICATOR_TRANSPORTS.has(t),
	);
	return filtered.length ? filtered : undefined;
}
