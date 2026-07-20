// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCpRO9YWShMPjdcR4JaDo9lVFwESFx65KE",
  authDomain: "icecarpool.firebaseapp.com",
  projectId: "icecarpool",
  storageBucket: "icecarpool.firebasestorage.app",
  messagingSenderId: "138733459123",
  appId: "1:138733459123:web:7172660aa779462e8e02c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize other Firebase services
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;