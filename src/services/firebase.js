// src/services/firebase.js
// Legacy Firebase compatibility stub — database operations have migrated to local SQLite (sqliteService.js).
import { db } from './sqliteDb';

const auth = null;
const storage = null;
const app = { name: 'caronas-icea-local' };

export { auth, db, storage };
export default app;
