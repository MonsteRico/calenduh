import { openDatabaseAsync, useSQLiteContext } from "expo-sqlite";
import { Event, EventUpsert } from "@/types/event.types";
import server from "@/constants/serverAxiosClient";
import { Mutation, MutationTypes } from "@/types/mutation.types";


export async function addMutationToQueue(mutation: MutationTypes, parameters: any, calendarId?: string) {
	const db = await openDatabaseAsync("local.db");
	try {
        if (calendarId) {
            await db.runAsync(
                "INSERT INTO mutations (mutation, timestamp, parameters, calendar_id) VALUES (?, ?, ?, ?)",
                [mutation, Date.now(), JSON.stringify(parameters), calendarId]
            );
        } else {
            await db.runAsync(
                "INSERT INTO mutations (mutation, timestamp, parameters) VALUES (?, ?, ?)",
                [mutation, Date.now(), JSON.stringify(parameters)]
            );
        }
	} catch (error) {
		console.error("Error inserting mutation:", error);
		throw error;
	}
}

// Get all mutations from the local database
export const getMutationsFromDB = async (): Promise<Mutation[]> => {
	const db = await openDatabaseAsync("local.db");

	try {
		const mutations = await db.getAllAsync<any>("SELECT * FROM mutations");
		return mutations;
	} catch (error) {
		console.error("Error fetching mutations:", error);
		throw error;
	}
};

export const removeMutationFromQueue = async (mutationNumber: number) => {
	const db = await openDatabaseAsync("local.db");
	try {
		await db.runAsync("DELETE FROM mutations WHERE number = ?", mutationNumber);
	} catch (error) {
		console.error("Error deleting mutation:", error);
		throw error;
	}
};