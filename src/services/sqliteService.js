// src/services/sqliteService.js
import * as SQLite from "expo-sqlite";
import { hashPassword, verifyPassword, generateRidePin } from "../utils/security";
import { getFullAddressForLocation, getLocationCoordinates } from "../constants/locations";
import { calculateHaversineDistance } from "./geocodingService";

// Open SQLite database
const db = SQLite.openDatabase("ice_carpool.db");

// Promise wrapper for SQLite execution
export const executeSql = (sql, params = [], options = {}) => {
  const { silent = false } = options;
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          if (!silent) {
            console.error(`SQL Error executing: ${sql}`, error);
          }
          reject(error);
          return false; // do not rollback transaction automatically
        },
      );
    });
  });
};

// Pub-sub listeners for real-time ride updates
const rideListeners = new Set();

export const subscribeToRides = (callback) => {
  rideListeners.add(callback);
  fetchRidesList().then(callback);
  return () => {
    rideListeners.delete(callback);
  };
};

export const notifyRidesChanged = async () => {
  const updatedRides = await fetchRidesList();
  for (const listener of rideListeners) {
    try {
      listener(updatedRides);
    } catch (e) {
      console.error("Error triggering ride listener:", e);
    }
  }
};

// Map database row to Firestore-compatible ride object
export const mapRideFromDb = (row) => {
  const fromLat = row.fromLat || getLocationCoordinates(row.from_place).lat;
  const fromLng = row.fromLng || getLocationCoordinates(row.from_place).lng;
  const toLat = row.toLat || getLocationCoordinates(row.to_place).lat;
  const toLng = row.toLng || getLocationCoordinates(row.to_place).lng;
  const geoCalc = calculateHaversineDistance(fromLat, fromLng, toLat, toLng);

  return {
    id: row.id,
    from: row.from_place,
    to: row.to_place,
    fromAddress: row.fromAddress || getFullAddressForLocation(row.from_place),
    fromLat,
    fromLng,
    toAddress: row.toAddress || getFullAddressForLocation(row.to_place),
    toLat,
    toLng,
    distanceKm: row.distanceKm || geoCalc?.distanceKm || 5.2,
    estimatedMinutes: row.estimatedMinutes || geoCalc?.estimatedMinutes || 11,
    price: row.price,
    totalSeats: row.totalSeats,
    availableSeats: row.availableSeats,
    departureTime: {
      toDate: () => new Date(row.departureTime),
    },
    notes: row.notes,
    vehicle: row.vehicle,
    licensePlate: row.licensePlate,
    carPhotoUri: row.carPhotoUri,
    driverId: row.driverId,
    driverName: row.driverName,
    driverRating: row.driverRating || 0,
    createdAt: {
      toDate: () => new Date(row.createdAt),
    },
    cancelled: row.cancelled === 1,
    cancelledAt: row.cancelledAt
      ? { toDate: () => new Date(row.cancelledAt) }
      : null,
    completed: row.completed === 1,
    completedAt: row.completedAt
      ? { toDate: () => new Date(row.completedAt) }
      : null,
    passengers: JSON.parse(row.passengers || "[]"),
    ratings: JSON.parse(row.ratings || "[]"),
    startPin: row.startPin || "1234",
    status: row.status || (row.completed ? "COMPLETED" : row.cancelled ? "CANCELLED" : "SCHEDULED"),
  };
};

// Map database row to User object
export const mapUserFromDb = (row) => ({
  uid: row.uid,
  email: row.email,
  name: row.name,
  phone: row.phone,
  userType: row.userType,
  vehicle: row.vehicle,
  licensePlate: row.licensePlate,
  driverPhotoUri: row.driverPhotoUri,
  carPhotoUri: row.carPhotoUri,
  createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
  rating: row.rating || 0,
  totalRatings: row.totalRatings || 0,
  isAdmin: row.isAdmin === 1,
  isActive: row.isActive === 1,
  reservations: JSON.parse(row.reservations || "[]"),
  ratings: JSON.parse(row.ratings || "[]"),
  walletBalance: row.walletBalance || 0.0,
  pixKey: row.pixKey || "",
  pixType: row.pixType || "CPF",
});

// Database Initialization and Seeding
export const initDatabase = async () => {
  try {
    // 1. Create Users Table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        phone TEXT,
        userType TEXT,
        vehicle TEXT,
        licensePlate TEXT,
        driverPhotoUri TEXT,
        carPhotoUri TEXT,
        createdAt TEXT,
        rating REAL,
        totalRatings INTEGER,
        isAdmin INTEGER,
        isActive INTEGER,
        reservations TEXT,
        ratings TEXT,
        walletBalance REAL,
        pixKey TEXT,
        pixType TEXT
      );
    `);

    // Migrations for Users Table
    try { await executeSql(`ALTER TABLE users ADD COLUMN driverPhotoUri TEXT;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE users ADD COLUMN carPhotoUri TEXT;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE users ADD COLUMN walletBalance REAL;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE users ADD COLUMN pixKey TEXT;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE users ADD COLUMN pixType TEXT;`, [], { silent: true }); } catch (e) {}

    // 2. Create Rides Table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS rides (
        id TEXT PRIMARY KEY,
        from_place TEXT,
        to_place TEXT,
        price REAL,
        totalSeats INTEGER,
        availableSeats INTEGER,
        departureTime TEXT,
        notes TEXT,
        vehicle TEXT,
        licensePlate TEXT,
        carPhotoUri TEXT,
        driverId TEXT,
        driverName TEXT,
        driverRating REAL,
        createdAt TEXT,
        cancelled INTEGER,
        cancelledAt TEXT,
        completed INTEGER,
        completedAt TEXT,
        passengers TEXT,
        ratings TEXT,
        startPin TEXT,
        status TEXT
      );
    `);

    // Migrations for Rides Table
    try { await executeSql(`ALTER TABLE rides ADD COLUMN carPhotoUri TEXT;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE rides ADD COLUMN startPin TEXT;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE rides ADD COLUMN status TEXT;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE rides ADD COLUMN fromAddress TEXT;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE rides ADD COLUMN fromLat REAL;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE rides ADD COLUMN fromLng REAL;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE rides ADD COLUMN toAddress TEXT;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE rides ADD COLUMN toLat REAL;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE rides ADD COLUMN toLng REAL;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE rides ADD COLUMN distanceKm REAL;`, [], { silent: true }); } catch (e) {}
    try { await executeSql(`ALTER TABLE rides ADD COLUMN estimatedMinutes INTEGER;`, [], { silent: true }); } catch (e) {}

    // 3. Create Transactions Table (10% Admin Commission System)
    await executeSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        rideId TEXT,
        passengerId TEXT,
        passengerName TEXT,
        driverId TEXT,
        driverName TEXT,
        grossAmount REAL,
        platformFee REAL,
        driverNet REAL,
        paymentMethod TEXT,
        status TEXT,
        createdAt TEXT
      );
    `);

    // 4. Create Reports Table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        type TEXT,
        description TEXT,
        reporterId TEXT,
        reporterName TEXT,
        createdAt TEXT,
        resolved INTEGER,
        resolvedAt TEXT,
        resolvedBy TEXT
      );
    `);

    // Seed Initial Users
    const usersCountRes = await executeSql("SELECT COUNT(*) as count FROM users;");
    if (usersCountRes.rows._array[0].count === 0) {
      console.log("Seeding initial mock users with hashed passwords and Pix keys...");

      const defaultPasswordHash = hashPassword("123456");

      // Administrator
      await executeSql(
        `
        INSERT INTO users (uid, email, password, name, phone, userType, createdAt, rating, totalRatings, isAdmin, isActive, reservations, ratings, walletBalance, pixKey, pixType)
        VALUES ('admin_uid', 'admin@ufop.edu.br', ?, 'Administrador UFOP', '31999999999', 'both', ?, 5.0, 0, 1, 1, '[]', '[]', 0.0, 'admin@ufop.edu.br', 'Email');
      `,
        [defaultPasswordHash, new Date().toISOString()],
      );

      // Driver
      await executeSql(
        `
        INSERT INTO users (uid, email, password, name, phone, userType, vehicle, licensePlate, createdAt, rating, totalRatings, isAdmin, isActive, reservations, ratings, walletBalance, pixKey, pixType)
        VALUES ('driver_uid', 'driver@ufop.edu.br', ?, 'Gabriel Motorista', '31988888888', 'driver', 'Fiat Uno Vermelho', 'ABC1D23', ?, 4.8, 5, 0, 1, '[]', '[]', 45.0, '123.456.789-00', 'CPF');
      `,
        [defaultPasswordHash, new Date().toISOString()],
      );

      // Passenger
      await executeSql(
        `
        INSERT INTO users (uid, email, password, name, phone, userType, createdAt, rating, totalRatings, isAdmin, isActive, reservations, ratings, walletBalance, pixKey, pixType)
        VALUES ('passenger_uid', 'passenger@ufop.edu.br', ?, 'Mariana Passageira', '31977777777', 'passenger', ?, 4.9, 3, 0, 1, '[]', '[]', 100.0, 'mariana@aluno.ufop.br', 'Email');
      `,
        [defaultPasswordHash, new Date().toISOString()],
      );

      // Seed Initial Rides
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);

      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      dayAfterTomorrow.setHours(18, 30, 0, 0);

      await executeSql(
        `
        INSERT INTO rides (id, from_place, to_place, price, totalSeats, availableSeats, departureTime, notes, vehicle, licensePlate, driverId, driverName, driverRating, createdAt, cancelled, completed, passengers, ratings, startPin, status)
        VALUES ('ride_seed_1', 'Campus ICEA (UFOP)', 'Centro João Monlevade', 5.00, 4, 4, ?, 'Saída pontual da portaria principal.', 'Fiat Uno Vermelho', 'ABC1D23', 'driver_uid', 'Gabriel Motorista', 4.8, ?, 0, 0, '[]', '[]', '1234', 'SCHEDULED');
      `,
        [tomorrow.toISOString(), new Date().toISOString()],
      );

      await executeSql(
        `
        INSERT INTO rides (id, from_place, to_place, price, totalSeats, availableSeats, departureTime, notes, vehicle, licensePlate, driverId, driverName, driverRating, createdAt, cancelled, completed, passengers, ratings, startPin, status)
        VALUES ('ride_seed_2', 'Terminal Rodoviário', 'Campus ICEA (UFOP)', 6.50, 3, 3, ?, 'Plataforma 2 da Rodoviária.', 'Fiat Uno Vermelho', 'ABC1D23', 'driver_uid', 'Gabriel Motorista', 4.8, ?, 0, 0, '[]', '[]', '5678', 'SCHEDULED');
      `,
        [dayAfterTomorrow.toISOString(), new Date().toISOString()],
      );

      // Seed mock completed transaction (25% fee)
      await executeSql(
        `
        INSERT INTO transactions (id, rideId, passengerId, passengerName, driverId, driverName, grossAmount, platformFee, driverNet, paymentMethod, status, createdAt)
        VALUES ('tx_seed_1', 'ride_seed_demo', 'passenger_uid', 'Mariana Passageira', 'driver_uid', 'Gabriel Motorista', 10.00, 2.50, 7.50, 'PIX', 'PAID', ?);
      `,
        [new Date().toISOString()],
      );

      console.log("Database initialized and seeded successfully!");
    }
  } catch (error) {
    console.error("Failed to initialize local SQLite database:", error);
  }
};

// ==========================================
// USER & AUTH QUERIES
// ==========================================

export const registerUserInDb = async (email, password, userData) => {
  const uid = "usr_" + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();
  const hashedPassword = hashPassword(password);

  try {
    await executeSql(
      `
      INSERT INTO users (uid, email, password, name, phone, userType, vehicle, licensePlate, driverPhotoUri, carPhotoUri, createdAt, rating, totalRatings, isAdmin, isActive, reservations, ratings, walletBalance, pixKey, pixType)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, 0, 0, 1, '[]', '[]', 0.0, '', 'CPF');
    `,
      [
        uid,
        email.toLowerCase().trim(),
        hashedPassword,
        userData.name,
        userData.phone || "",
        userData.userType,
        userData.vehicle || "",
        userData.licensePlate || "",
        userData.driverPhotoUri || "",
        userData.carPhotoUri || "",
        now,
      ],
    );

    return {
      success: true,
      user: {
        uid,
        email: email.toLowerCase().trim(),
        vehicle: userData.vehicle || "",
        licensePlate: userData.licensePlate || "",
        driverPhotoUri: userData.driverPhotoUri || "",
        carPhotoUri: userData.carPhotoUri || "",
        walletBalance: 0.0,
        pixKey: "",
        pixType: "CPF",
        ...userData,
        rating: 0,
        totalRatings: 0,
        isAdmin: false,
        isActive: true,
        reservations: [],
        ratings: [],
      },
    };
  } catch (error) {
    console.error("Error registering user in SQLite:", error);
    return { success: false, error: "Email já cadastrado ou erro interno." };
  }
};

export const loginUserInDb = async (email, password) => {
  try {
    const res = await executeSql(
      "SELECT * FROM users WHERE LOWER(email) = ?;",
      [email.toLowerCase().trim()],
    );
    if (res.rows.length > 0) {
      const userRow = res.rows._array[0];
      
      if (!verifyPassword(password, userRow.password)) {
        return { success: false, error: "Credenciais inválidas. Verifique seu e-mail e senha." };
      }

      if (userRow.isActive === 0) {
        return {
          success: false,
          error: "Esta conta foi desativada por um administrador.",
        };
      }
      return { success: true, user: mapUserFromDb(userRow) };
    }
    return { success: false, error: "Credenciais inválidas. Verifique seu e-mail e senha." };
  } catch (error) {
    console.error("Error logging in user in SQLite:", error);
    return { success: false, error: "Erro de conexão com o banco de dados." };
  }
};

export const getUserProfileInDb = async (uid) => {
  try {
    const res = await executeSql("SELECT * FROM users WHERE uid = ?;", [uid]);
    if (res.rows.length > 0) {
      return mapUserFromDb(res.rows._array[0]);
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile in SQLite:", error);
    return null;
  }
};

export const updateUserProfileInDb = async (uid, updates) => {
  try {
    const currentRes = await executeSql("SELECT * FROM users WHERE uid = ?;", [
      uid,
    ]);
    if (currentRes.rows.length === 0) throw new Error("Usuário não encontrado");

    const currentUser = currentRes.rows._array[0];
    const newName = updates.name !== undefined ? updates.name : currentUser.name;
    const newPhone = updates.phone !== undefined ? updates.phone : currentUser.phone;
    const newVehicle = updates.vehicle !== undefined ? updates.vehicle : currentUser.vehicle;
    const newLicensePlate = updates.licensePlate !== undefined ? updates.licensePlate : currentUser.licensePlate;
    const newUserType = updates.userType !== undefined ? updates.userType : currentUser.userType;
    const newDriverPhotoUri = updates.driverPhotoUri !== undefined ? updates.driverPhotoUri : currentUser.driverPhotoUri;
    const newCarPhotoUri = updates.carPhotoUri !== undefined ? updates.carPhotoUri : currentUser.carPhotoUri;
    const newPixKey = updates.pixKey !== undefined ? updates.pixKey : (currentUser.pixKey || "");
    const newPixType = updates.pixType !== undefined ? updates.pixType : (currentUser.pixType || "CPF");

    await executeSql(
      `
      UPDATE users 
      SET name = ?, phone = ?, vehicle = ?, licensePlate = ?, userType = ?, driverPhotoUri = ?, carPhotoUri = ?, pixKey = ?, pixType = ?
      WHERE uid = ?;
    `,
      [
        newName,
        newPhone,
        newVehicle,
        newLicensePlate,
        newUserType,
        newDriverPhotoUri,
        newCarPhotoUri,
        newPixKey,
        newPixType,
        uid,
      ],
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile in SQLite:", error);
    return { success: false, error: error.message };
  }
};

export const getUserStatsInDb = async (uid) => {
  try {
    const driverRes = await executeSql(
      "SELECT COUNT(*) as count FROM rides WHERE driverId = ?;",
      [uid],
    );
    const ridesAsDriver = driverRes.rows._array[0].count;

    const passengerRes = await executeSql("SELECT * FROM rides;");
    let ridesAsPassenger = 0;

    passengerRes.rows._array.forEach((row) => {
      const ps = JSON.parse(row.passengers || "[]");
      if (ps.includes(uid)) {
        ridesAsPassenger++;
      }
    });

    const userRes = await executeSql(
      "SELECT rating FROM users WHERE uid = ?;",
      [uid],
    );
    const averageRating = userRes.rows.length > 0 ? userRes.rows._array[0].rating : 0;

    return {
      ridesAsDriver,
      ridesAsPassenger,
      averageRating,
    };
  } catch (error) {
    console.error("Error counting user stats in SQLite:", error);
    return { ridesAsDriver: 0, ridesAsPassenger: 0, averageRating: 0 };
  }
};

// ==========================================
// RIDE QUERIES & STRICT VALIDATIONS
// ==========================================

export const fetchRidesList = async () => {
  try {
    const res = await executeSql("SELECT * FROM rides;");
    return res.rows._array.map(mapRideFromDb);
  } catch (error) {
    console.error("Error fetching rides from SQLite:", error);
    return [];
  }
};

export const createRideInDb = async (
  rideData,
  driverId,
  driverName,
  driverRating,
) => {
  const departureDate = new Date(rideData.departureTime);
  if (departureDate <= new Date()) {
    return { success: false, error: "A hora de saída deve ser no futuro." };
  }

  const id = "ride_" + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();
  const startPin = generateRidePin();

  const fromCoords = rideData.fromLat && rideData.fromLng
    ? { lat: rideData.fromLat, lng: rideData.fromLng }
    : getLocationCoordinates(rideData.from);
  const toCoords = rideData.toLat && rideData.toLng
    ? { lat: rideData.toLat, lng: rideData.toLng }
    : getLocationCoordinates(rideData.to);

  const geoCalc = calculateHaversineDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng);
  const distanceKm = rideData.distanceKm || geoCalc?.distanceKm || 5.2;
  const estimatedMinutes = rideData.estimatedMinutes || geoCalc?.estimatedMinutes || 11;
  const fromAddress = rideData.fromAddress || getFullAddressForLocation(rideData.from);
  const toAddress = rideData.toAddress || getFullAddressForLocation(rideData.to);

  try {
    await executeSql(
      `
      INSERT INTO rides (
        id, from_place, to_place, fromAddress, fromLat, fromLng, toAddress, toLat, toLng, distanceKm, estimatedMinutes,
        price, totalSeats, availableSeats, departureTime, notes, vehicle, licensePlate, carPhotoUri, driverId, driverName, driverRating, createdAt, cancelled, completed, passengers, ratings, startPin, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, '[]', '[]', ?, 'SCHEDULED');
    `,
      [
        id,
        rideData.from.trim(),
        rideData.to.trim(),
        fromAddress,
        fromCoords.lat,
        fromCoords.lng,
        toAddress,
        toCoords.lat,
        toCoords.lng,
        distanceKm,
        estimatedMinutes,
        rideData.price,
        rideData.totalSeats,
        rideData.availableSeats,
        departureDate.toISOString(),
        rideData.notes || "",
        rideData.vehicle || "",
        rideData.licensePlate || "",
        rideData.carPhotoUri || "",
        driverId,
        driverName,
        driverRating,
        now,
        startPin,
      ],
    );

    await notifyRidesChanged();
    return { success: true, id, startPin };
  } catch (error) {
    console.error("Error creating ride in SQLite:", error);
    return { success: false, error: error.message };
  }
};

export const cancelRideInDb = async (rideId) => {
  try {
    await executeSql(
      `
      UPDATE rides 
      SET cancelled = 1, cancelledAt = ?, status = 'CANCELLED'
      WHERE id = ?;
    `,
      [new Date().toISOString(), rideId],
    );

    await notifyRidesChanged();
    return { success: true };
  } catch (error) {
    console.error("Error cancelling ride in SQLite:", error);
    return { success: false, error: error.message };
  }
};

export const getRideByIdInDb = async (rideId) => {
  try {
    const res = await executeSql("SELECT * FROM rides WHERE id = ?;", [rideId]);
    if (res.rows.length > 0) {
      return mapRideFromDb(res.rows._array[0]);
    }
    return null;
  } catch (error) {
    console.error("Error getting ride by ID in SQLite:", error);
    return null;
  }
};

export const reserveSeatInDb = async (rideId, userId, paymentMethod = 'PIX') => {
  try {
    const rideRes = await executeSql("SELECT * FROM rides WHERE id = ?;", [
      rideId,
    ]);
    if (rideRes.rows.length === 0) throw new Error("Carona não encontrada.");
    const ride = rideRes.rows._array[0];

    // Strict Validations
    if (ride.driverId === userId) {
      throw new Error("Você é o motorista desta carona e não pode reservar vagas nela.");
    }
    if (ride.cancelled === 1 || ride.status === 'CANCELLED') {
      throw new Error("Esta carona foi cancelada pelo motorista.");
    }
    if (ride.completed === 1 || ride.status === 'COMPLETED') {
      throw new Error("Esta carona já foi finalizada.");
    }

    const passengers = JSON.parse(ride.passengers || "[]");
    if (passengers.includes(userId)) {
      return { success: true };
    }

    if (ride.availableSeats <= 0) {
      throw new Error("Não há assentos disponíveis nesta carona.");
    }

    // Get passenger profile name
    const userRes = await executeSql("SELECT name FROM users WHERE uid = ?;", [userId]);
    const passengerName = userRes.rows.length > 0 ? userRes.rows._array[0].name : "Passageiro UFOP";

    // 25% Platform Commission Calculation
    const grossAmount = Number(ride.price || 0);
    const platformFee = Number((grossAmount * 0.25).toFixed(2)); // 25% Admin Fee
    const driverNet = Number((grossAmount * 0.75).toFixed(2));    // 75% Driver Net

    // Record Transaction
    const txId = "tx_" + Math.random().toString(36).substr(2, 9);
    await executeSql(
      `
      INSERT INTO transactions (id, rideId, passengerId, passengerName, driverId, driverName, grossAmount, platformFee, driverNet, paymentMethod, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', ?);
    `,
      [
        txId,
        rideId,
        userId,
        passengerName,
        ride.driverId,
        ride.driverName,
        grossAmount,
        platformFee,
        driverNet,
        paymentMethod,
        new Date().toISOString(),
      ],
    );

    // Credit Driver Net Wallet Balance (90%)
    await executeSql(
      `
      UPDATE users 
      SET walletBalance = COALESCE(walletBalance, 0) + ?
      WHERE uid = ?;
    `,
      [driverNet, ride.driverId],
    );

    // Update Ride Passengers & Seats
    passengers.push(userId);
    const newAvailableSeats = ride.availableSeats - 1;

    await executeSql(
      `
      UPDATE rides 
      SET passengers = ?, availableSeats = ?
      WHERE id = ?;
    `,
      [JSON.stringify(passengers), newAvailableSeats, rideId],
    );

    // Update user reservations list
    const userResReservations = await executeSql(
      "SELECT reservations FROM users WHERE uid = ?;",
      [userId],
    );
    if (userResReservations.rows.length > 0) {
      const reservations = JSON.parse(userResReservations.rows._array[0].reservations || "[]");
      if (!reservations.includes(rideId)) {
        reservations.push(rideId);
        await executeSql("UPDATE users SET reservations = ? WHERE uid = ?;", [
          JSON.stringify(reservations),
          userId,
        ]);
      }
    }

    await notifyRidesChanged();
    return { success: true, platformFee, driverNet, paymentMethod };
  } catch (error) {
    console.error("Error reserving seat in SQLite:", error);
    return { success: false, error: error.message };
  }
};

export const cancelReservationInDb = async (rideId, userId) => {
  try {
    const rideRes = await executeSql("SELECT * FROM rides WHERE id = ?;", [
      rideId,
    ]);
    if (rideRes.rows.length === 0) throw new Error("Carona não encontrada.");
    const ride = rideRes.rows._array[0];

    let passengers = JSON.parse(ride.passengers || "[]");
    if (!passengers.includes(userId)) {
      return { success: true };
    }

    passengers = passengers.filter((id) => id !== userId);
    const newAvailableSeats = ride.availableSeats + 1;

    await executeSql(
      `
      UPDATE rides 
      SET passengers = ?, availableSeats = ?
      WHERE id = ?;
    `,
      [JSON.stringify(passengers), newAvailableSeats, rideId],
    );

    const userRes = await executeSql(
      "SELECT reservations FROM users WHERE uid = ?;",
      [userId],
    );
    if (userRes.rows.length > 0) {
      let reservations = JSON.parse(userRes.rows._array[0].reservations || "[]");
      reservations = reservations.filter((id) => id !== rideId);
      await executeSql("UPDATE users SET reservations = ? WHERE uid = ?;", [
        JSON.stringify(reservations),
        userId,
      ]);
    }

    await notifyRidesChanged();
    return { success: true };
  } catch (error) {
    console.error("Error cancelling reservation in SQLite:", error);
    return { success: false, error: error.message };
  }
};

export const startRideWithPinInDb = async (rideId, inputPin) => {
  try {
    const rideRes = await executeSql("SELECT startPin FROM rides WHERE id = ?;", [rideId]);
    if (rideRes.rows.length === 0) throw new Error("Carona não encontrada.");

    const actualPin = rideRes.rows._array[0].startPin || "1234";

    if (actualPin.trim() !== inputPin.trim()) {
      return { success: false, error: "PIN de segurança incorreto. Peça o código de 4 dígitos ao passageiro." };
    }

    await executeSql(
      `
      UPDATE rides 
      SET status = 'IN_PROGRESS'
      WHERE id = ?;
    `,
      [rideId],
    );

    await notifyRidesChanged();
    return { success: true };
  } catch (error) {
    console.error("Error starting ride with PIN:", error);
    return { success: false, error: error.message };
  }
};

export const completeRideInDb = async (rideId) => {
  try {
    await executeSql(
      `
      UPDATE rides 
      SET completed = 1, completedAt = ?, status = 'COMPLETED'
      WHERE id = ?;
    `,
      [new Date().toISOString(), rideId],
    );

    await notifyRidesChanged();
    return { success: true };
  } catch (error) {
    console.error("Error completing ride in SQLite:", error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// FINANCIAL & WALLET QUERIES
// ==========================================

export const getDriverWalletStatsInDb = async (driverId) => {
  try {
    const res = await executeSql(
      "SELECT * FROM transactions WHERE driverId = ? ORDER BY createdAt DESC;",
      [driverId],
    );
    const transactions = res.rows._array;

    let totalGross = 0;
    let totalCommission = 0; // 10%
    let totalNet = 0;        // 90%

    transactions.forEach((tx) => {
      totalGross += Number(tx.grossAmount || 0);
      totalCommission += Number(tx.platformFee || 0);
      totalNet += Number(tx.driverNet || 0);
    });

    const userRes = await executeSql("SELECT walletBalance, pixKey, pixType FROM users WHERE uid = ?;", [driverId]);
    const walletBalance = userRes.rows.length > 0 ? userRes.rows._array[0].walletBalance || 0 : totalNet;
    const pixKey = userRes.rows.length > 0 ? userRes.rows._array[0].pixKey || "" : "";
    const pixType = userRes.rows.length > 0 ? userRes.rows._array[0].pixType || "CPF" : "CPF";

    return {
      totalGross,
      totalCommission,
      totalNet,
      walletBalance,
      pixKey,
      pixType,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching driver wallet stats:", error);
    return { totalGross: 0, totalCommission: 0, totalNet: 0, walletBalance: 0, pixKey: "", pixType: "CPF", transactions: [] };
  }
};

export const getAdminFinancialStatsInDb = async () => {
  try {
    const res = await executeSql("SELECT * FROM transactions ORDER BY createdAt DESC;");
    const transactions = res.rows._array;

    let totalVolume = 0;
    let totalPlatformRevenue = 0; // 10% total collected

    transactions.forEach((tx) => {
      totalVolume += Number(tx.grossAmount || 0);
      totalPlatformRevenue += Number(tx.platformFee || 0);
    });

    return {
      totalVolume,
      totalPlatformRevenue,
      totalTransactions: transactions.length,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching admin financial stats:", error);
    return { totalVolume: 0, totalPlatformRevenue: 0, totalTransactions: 0, transactions: [] };
  }
};

// ==========================================
// RATING QUERIES
// ==========================================

export const submitRatingInDb = async (ratingData, raterUid, raterName) => {
  try {
    const userRes = await executeSql("SELECT * FROM users WHERE uid = ?;", [
      ratingData.ratedUserId,
    ]);
    if (userRes.rows.length > 0) {
      const userRow = userRes.rows._array[0];
      const currentRating = userRow.rating || 0;
      const totalRatings = userRow.totalRatings || 0;
      const ratingsArray = JSON.parse(userRow.ratings || "[]");

      const newRating = (currentRating * totalRatings + ratingData.rating) / (totalRatings + 1);

      ratingsArray.push({
        rating: ratingData.rating,
        comment: ratingData.comment,
        rideId: ratingData.rideId,
        ratedBy: raterUid,
        ratedByName: raterName,
        timestamp: new Date().toISOString(),
      });

      await executeSql(
        `
        UPDATE users 
        SET rating = ?, totalRatings = ?, ratings = ?
        WHERE uid = ?;
      `,
        [
          newRating,
          totalRatings + 1,
          JSON.stringify(ratingsArray),
          ratingData.ratedUserId,
        ],
      );
    }

    const rideRes = await executeSql(
      "SELECT ratings FROM rides WHERE id = ?;",
      [ratingData.rideId],
    );
    if (rideRes.rows.length > 0) {
      const rideRatings = JSON.parse(rideRes.rows._array[0].ratings || "[]");
      rideRatings.push({
        rating: ratingData.rating,
        comment: ratingData.comment,
        ratedUserId: ratingData.ratedUserId,
        ratedUserName: ratingData.ratedUser,
        ratedBy: raterUid,
        ratedByName: raterName,
        timestamp: new Date().toISOString(),
      });

      await executeSql("UPDATE rides SET ratings = ? WHERE id = ?;", [
        JSON.stringify(rideRatings),
        ratingData.rideId,
      ]);
    }

    await notifyRidesChanged();
    return { success: true };
  } catch (error) {
    console.error("Error submitting rating in SQLite:", error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// ADMIN QUERIES
// ==========================================

export const getUnresolvedReportsInDb = async () => {
  try {
    const res = await executeSql("SELECT * FROM reports WHERE resolved = 0;");
    return res.rows._array.map((row) => ({
      id: row.id,
      type: row.type,
      description: row.description,
      reporterId: row.reporterId,
      reporterName: row.reporterName,
      createdAt: { toDate: () => new Date(row.createdAt) },
      resolved: row.resolved === 1,
    }));
  } catch (error) {
    console.error("Error fetching unresolved reports in SQLite:", error);
    return [];
  }
};

export const getAllUsersInDb = async () => {
  try {
    const res = await executeSql("SELECT * FROM users;");
    return res.rows._array.map(mapUserFromDb);
  } catch (error) {
    console.error("Error fetching all users in SQLite:", error);
    return [];
  }
};

export const resolveReportInDb = async (reportId, adminUid) => {
  try {
    await executeSql(
      `
      UPDATE reports 
      SET resolved = 1, resolvedAt = ?, resolvedBy = ?
      WHERE id = ?;
    `,
      [new Date().toISOString(), adminUid, reportId],
    );
    return { success: true };
  } catch (error) {
    console.error("Error resolving report in SQLite:", error);
    return { success: false, error: error.message };
  }
};

export const toggleUserActiveInDb = async (uid, isActive) => {
  try {
    await executeSql(
      `
      UPDATE users 
      SET isActive = ?
      WHERE uid = ?;
    `,
      [isActive ? 1 : 0, uid],
    );
    return { success: true };
  } catch (error) {
    console.error("Error toggling user active in SQLite:", error);
    return { success: false, error: error.message };
  }
};

export const submitReportInDb = async (reportData, reporterId, reporterName) => {
  const id = "rep_" + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();
  try {
    await executeSql(
      `
      INSERT INTO reports (id, type, description, reporterId, reporterName, createdAt, resolved)
      VALUES (?, ?, ?, ?, ?, ?, 0);
    `,
      [id, reportData.type, reportData.description, reporterId, reporterName, now],
    );
    return { success: true, id };
  } catch (error) {
    console.error("Error submitting report in SQLite:", error);
    return { success: false, error: error.message };
  }
};
