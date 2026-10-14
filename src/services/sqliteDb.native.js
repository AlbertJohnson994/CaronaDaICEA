import * as SQLite from "expo-sqlite";

const getDb = () => {
  try {
    if (typeof SQLite.openDatabaseSync === "function") {
      return SQLite.openDatabaseSync("ice_carpool.db");
    }
    if (typeof SQLite.openDatabase === "function") {
      return SQLite.openDatabase("ice_carpool.db");
    }
  } catch (e) {
    console.warn("Native SQLite driver unavailable:", e.message);
  }
  return null;
};

export const db = getDb();
