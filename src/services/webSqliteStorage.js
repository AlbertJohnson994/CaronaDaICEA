// src/services/webSqliteStorage.js
/**
 * Web SQL Emulator and LocalStorage persistence layer for Expo Web.
 * Emulates SQLite operations when running in web browsers where native expo-sqlite is unavailable.
 */

const STORAGE_KEYS = {
  users: "ice_carpool_web_users",
  rides: "ice_carpool_web_rides",
  transactions: "ice_carpool_web_transactions",
  reports: "ice_carpool_web_reports",
  ride_requests: "ice_carpool_web_ride_requests",
  withdrawals: "ice_carpool_web_withdrawals",
};

// In-memory fallback if localStorage is disabled or in non-browser context
const memoryFallback = {
  users: [],
  rides: [],
  transactions: [],
  reports: [],
  ride_requests: [],
  withdrawals: [],
};

const isStorageAvailable = () => {
  try {
    return typeof window !== "undefined" && window.localStorage !== null;
  } catch (e) {
    return false;
  }
};

export const getTableData = (table) => {
  const normTable = table.toLowerCase().trim();
  const key = STORAGE_KEYS[normTable];
  if (!key) return [];

  if (isStorageAvailable()) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(`Error reading table ${normTable} from localStorage:`, e);
    }
  }
  return memoryFallback[normTable] || [];
};

export const saveTableData = (table, rows) => {
  const normTable = table.toLowerCase().trim();
  const key = STORAGE_KEYS[normTable];
  if (!key) return;

  memoryFallback[normTable] = rows;
  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(key, JSON.stringify(rows));
    } catch (e) {
      console.warn(`Error saving table ${normTable} to localStorage:`, e);
    }
  }
};

const extractTableName = (sql) => {
  const upper = sql.toUpperCase();
  if (upper.includes("RIDE_REQUESTS")) return "ride_requests";
  if (upper.includes("WITHDRAWALS")) return "withdrawals";
  if (upper.includes("USERS")) return "users";
  if (upper.includes("RIDES")) return "rides";
  if (upper.includes("TRANSACTIONS")) return "transactions";
  if (upper.includes("REPORTS")) return "reports";
  return null;
};

// Splits a comma-separated string while respecting quotes
const parseSqlList = (str) => {
  const items = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if ((ch === "'" || ch === '"') && (i === 0 || str[i - 1] !== "\\")) {
      if (inQuote && ch === quoteChar) {
        inQuote = false;
      } else if (!inQuote) {
        inQuote = true;
        quoteChar = ch;
      }
      current += ch;
    } else if (ch === "," && !inQuote) {
      items.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim().length > 0) {
    items.push(current.trim());
  }
  return items;
};

// Parses a single SQL token (literal string, number, null, or ? placeholder)
const parseSqlValue = (token, paramQueue) => {
  const trimmed = token.trim();
  if (trimmed === "?") {
    return paramQueue.length > 0 ? paramQueue.shift() : null;
  }
  if (trimmed.toUpperCase() === "NULL") {
    return null;
  }
  if (trimmed.toUpperCase() === "TRUE") {
    return 1;
  }
  if (trimmed.toUpperCase() === "FALSE") {
    return 0;
  }
  // Quoted string '...' or "..."
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  // Number
  if (!isNaN(Number(trimmed)) && trimmed !== "") {
    return Number(trimmed);
  }
  return trimmed;
};

export const executeWebSql = async (sql, params = []) => {
  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();
  const paramQueue = [...params];

  // 1. CREATE TABLE / ALTER TABLE / PRAGMA
  if (upper.startsWith("CREATE TABLE") || upper.startsWith("ALTER TABLE") || upper.startsWith("PRAGMA")) {
    const table = extractTableName(sql);
    if (table) {
      const existing = getTableData(table);
      if (!existing || existing.length === 0) {
        saveTableData(table, []);
      }
    }
    return {
      rows: { _array: [], length: 0, item: () => null },
      insertId: null,
      rowsAffected: 0,
    };
  }

  // 2. INSERT INTO
  if (upper.startsWith("INSERT INTO")) {
    const table = extractTableName(sql);
    if (!table) return { rows: { _array: [], length: 0, item: () => null }, insertId: null, rowsAffected: 0 };

    // Match column list and values list
    // Example: INSERT INTO users (col1, col2) VALUES (val1, val2)
    const colsMatch = trimmed.match(/\(([\s\S]*?)\)\s*VALUES\s*\(([\s\S]*?)\);?$/i);
    let row = {};

    if (colsMatch && colsMatch[1] && colsMatch[2]) {
      const cols = parseSqlList(colsMatch[1]).map((c) => c.replace(/['"`]/g, "").trim());
      const valTokens = parseSqlList(colsMatch[2]);

      cols.forEach((col, idx) => {
        const token = valTokens[idx];
        if (token !== undefined) {
          row[col] = parseSqlValue(token, paramQueue);
        } else {
          row[col] = null;
        }
      });
    }

    const currentRows = getTableData(table);
    const pk = row.id || row.uid;
    const existingIndex = pk
      ? currentRows.findIndex((r) => (r.id && r.id === pk) || (r.uid && r.uid === pk))
      : -1;

    if (existingIndex >= 0) {
      currentRows[existingIndex] = { ...currentRows[existingIndex], ...row };
    } else {
      currentRows.push(row);
    }

    saveTableData(table, currentRows);
    return {
      rows: { _array: [], length: 0, item: () => null },
      insertId: currentRows.length,
      rowsAffected: 1,
    };
  }

  // 3. SELECT COUNT(*)
  if (upper.startsWith("SELECT COUNT(*)")) {
    const table = extractTableName(sql);
    const rows = table ? getTableData(table) : [];
    let count = rows.length;

    // Optional WHERE filtering for count (e.g. driverId = ?)
    if (upper.includes("WHERE DRIVERID = ?") && paramQueue.length > 0) {
      const targetDriver = String(paramQueue.shift());
      count = rows.filter((r) => String(r.driverId) === targetDriver).length;
    }

    return {
      rows: {
        _array: [{ count, "COUNT(*)": count }],
        length: 1,
        item: () => ({ count, "COUNT(*)": count }),
      },
      insertId: null,
      rowsAffected: 0,
    };
  }

  // 4. SELECT
  if (upper.startsWith("SELECT")) {
    const table = extractTableName(sql);
    let rows = table ? [...getTableData(table)] : [];

    // Specific WHERE filters
    if (upper.includes("WHERE LOWER(EMAIL) = ?") && paramQueue.length > 0) {
      const email = String(paramQueue.shift()).toLowerCase().trim();
      rows = rows.filter((r) => (r.email || "").toLowerCase().trim() === email);
    } else if ((upper.includes("WHERE UID = ? OR EMAIL = ?") || upper.includes("WHERE UID = ? OR LOWER(EMAIL) = ?")) && paramQueue.length >= 2) {
      const target1 = String(paramQueue.shift()).toLowerCase().trim();
      const target2 = String(paramQueue.shift()).toLowerCase().trim();
      rows = rows.filter((r) => 
        (r.uid && String(r.uid).toLowerCase().trim() === target1) ||
        (r.email && String(r.email).toLowerCase().trim() === target2)
      );
    } else if (upper.includes("WHERE UID = ?") && paramQueue.length > 0) {
      const uid = String(paramQueue.shift());
      rows = rows.filter((r) => String(r.uid) === uid);
    } else if (upper.includes("WHERE ID = ?") && paramQueue.length > 0) {
      const id = String(paramQueue.shift());
      rows = rows.filter((r) => String(r.id) === id);
    } else if (upper.includes("WHERE DRIVERID = ?") && paramQueue.length > 0) {
      const driverId = String(paramQueue.shift());
      rows = rows.filter((r) => String(r.driverId) === driverId);
    } else if (upper.includes("WHERE RESOLVED = 0")) {
      rows = rows.filter((r) => Number(r.resolved) === 0 || r.resolved === false);
    } else if (upper.includes("WHERE STATUS = 'ACTIVE'")) {
      rows = rows.filter((r) => (r.status || "").toUpperCase() === "ACTIVE");
    } else if (upper.includes("WHERE STATUS = 'PENDING'")) {
      rows = rows.filter((r) => (r.status || "").toUpperCase() === "PENDING");
    }

    // ORDER BY createdAt DESC or requestedAt DESC
    if (upper.includes("ORDER BY CREATEDAT DESC")) {
      rows.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (upper.includes("ORDER BY REQUESTEDAT DESC")) {
      rows.sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0));
    }

    return {
      rows: {
        _array: rows,
        length: rows.length,
        item: (idx) => rows[idx] || null,
      },
      insertId: null,
      rowsAffected: 0,
    };
  }

  // 5. UPDATE
  if (upper.startsWith("UPDATE")) {
    const table = extractTableName(sql);
    if (!table) return { rows: { _array: [], length: 0, item: () => null }, insertId: null, rowsAffected: 0 };

    const rows = getTableData(table);
    let rowsAffected = 0;

    // Custom handler for walletBalance increment:
    // UPDATE users SET walletBalance = COALESCE(walletBalance, 0) + ? WHERE uid = ?;
    if (upper.includes("WALLETBALANCE = COALESCE(WALLETBALANCE, 0) + ?") && upper.includes("WHERE UID = ?")) {
      const increment = paramQueue.shift();
      const targetUid = paramQueue.shift();
      for (const r of rows) {
        if (String(r.uid) === String(targetUid)) {
          r.walletBalance = Number((Number(r.walletBalance || 0) + Number(increment || 0)).toFixed(2));
          rowsAffected++;
        }
      }
      saveTableData(table, rows);
      return { rows: { _array: [], length: 0, item: () => null }, insertId: null, rowsAffected };
    }

    // General update parser: UPDATE <table> SET <assignments> WHERE <conditions>
    const setMatch = trimmed.match(/SET\s+([\s\S]+?)\s+WHERE\s+([\s\S]+)$/i);
    if (setMatch) {
      const assignmentsStr = setMatch[1];
      const whereStr = setMatch[2];

      const assignmentParts = parseSqlList(assignmentsStr);
      const setActions = assignmentParts.map((part) => {
        const [k, v] = part.split("=").map((s) => s.trim());
        return { key: k, token: v };
      });

      const whereUpper = whereStr.toUpperCase();
      let targetId = null;
      let isUid = whereUpper.includes("UID = ?");
      let isId = whereUpper.includes("ID = ?");

      // Extract set values first (they consume from paramQueue)
      const evaluatedAssignments = setActions.map((action) => ({
        key: action.key,
        value: parseSqlValue(action.token, paramQueue),
      }));

      // Now extract where condition value from paramQueue
      if ((isUid || isId) && paramQueue.length > 0) {
        targetId = String(paramQueue.shift());
      }

      for (const r of rows) {
        let matches = false;
        if (isUid && targetId !== null) {
          matches = String(r.uid) === targetId;
        } else if (isId && targetId !== null) {
          matches = String(r.id) === targetId;
        }

        if (matches) {
          for (const item of evaluatedAssignments) {
            r[item.key] = item.value;
          }
          rowsAffected++;
        }
      }
      saveTableData(table, rows);
    }

    return {
      rows: { _array: [], length: 0, item: () => null },
      insertId: null,
      rowsAffected,
    };
  }

  // 6. DELETE
  if (upper.startsWith("DELETE FROM")) {
    const table = extractTableName(sql);
    if (!table) return { rows: { _array: [], length: 0, item: () => null }, insertId: null, rowsAffected: 0 };

    let rows = getTableData(table);
    const initialLen = rows.length;

    if (upper.includes("WHERE ID = ?") && paramQueue.length > 0) {
      const id = String(paramQueue.shift());
      rows = rows.filter((r) => String(r.id) !== id);
    } else if (upper.includes("WHERE UID = ?") && paramQueue.length > 0) {
      const uid = String(paramQueue.shift());
      rows = rows.filter((r) => String(r.uid) !== uid);
    }

    saveTableData(table, rows);
    return {
      rows: { _array: [], length: 0, item: () => null },
      insertId: null,
      rowsAffected: initialLen - rows.length,
    };
  }

  return {
    rows: { _array: [], length: 0, item: () => null },
    insertId: null,
    rowsAffected: 0,
  };
};
