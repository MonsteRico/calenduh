import * as React from "react";

export const IsConnected = React.createContext({
	value: false,
});

export function useIsConnected() {
	const value = React.useContext(IsConnected);
	if (process.env.NODE_ENV !== "production") {
		if (!value) {
			throw new Error("useIsConnected must be wrapped in a <IsConnectedProvider />");
		}
	}

	return value.value
}
