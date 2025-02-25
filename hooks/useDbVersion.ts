import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

export function useDbVersion() {
	const db = useSQLiteContext();
	const [dbVersion, setDbVersion] = useState("Checking...");
	useEffect(() => {
		async function checkDbVersion() {
			let result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
			if (result) {
				console.log("db version", result.user_version);
				setDbVersion(result.user_version.toString());
			} else {
				console.log("db version not found");
				setDbVersion("Not found");
			}
		}
		checkDbVersion();
	}, []);

	return dbVersion;
}
