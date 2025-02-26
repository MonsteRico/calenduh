import { type SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
	const DATABASE_VERSION = 2;
	let result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
	let currentDbVersion = result ? result.user_version : 0;
	if (currentDbVersion >= DATABASE_VERSION) {
		return;
	}
	if (currentDbVersion === 0) {
		console.log("CREATING TABLES");
		await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL
    );
  `);

		await db.execAsync(`
    CREATE TABLE IF NOT EXISTS calendars (
      calendar_id TEXT PRIMARY KEY,
      user_id TEXT,
      group_id TEXT,
      color TEXT NOT NULL DEFAULT '#fac805',
      title TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
      CHECK ((user_id IS NOT NULL))
    );
  `);

		await db.execAsync(`
    CREATE TABLE IF NOT EXISTS events (
      event_id TEXT PRIMARY KEY,
      calendar_id TEXT NOT NULL,
      name TEXT NOT NULL,
      location TEXT,
      description TEXT,
      notification TEXT,
      frequency INTEGER,
      priority INTEGER,
      start_time TEXT,
      end_time TEXT,
      FOREIGN KEY (calendar_id) REFERENCES calendars (calendar_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

		await db.execAsync(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      user_id TEXT NOT NULL,
      calendar_id TEXT NOT NULL,
      PRIMARY KEY (user_id, calendar_id),
      FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (calendar_id) REFERENCES calendars (calendar_id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
		currentDbVersion++;
	}
	if (currentDbVersion === 1) {
		console.log("Migrating to version 2");
		await db.execAsync(`
      CREATE TABLE IF NOT EXISTS mutations (
        number INTEGER PRIMARY KEY,
        mutation TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        parameters TEXT NOT NULL,
        calendar_id TEXT
      );
      `);

		currentDbVersion++;
	}


	// if (currentDbVersion === 1) {
	//   Add more migrations
	// }
	await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
