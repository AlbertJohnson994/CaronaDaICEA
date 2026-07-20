// scripts/simpleInit.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCpRO9YWShMPjdcR4JaDo9lVFwESFx65KE",
  authDomain: "icecarpool.firebaseapp.com",
  projectId: "icecarpool",
  storageBucket: "icecarpool.firebasestorage.app",
  messagingSenderId: "138733459123",
  appId: "1:138733459123:web:7172660aa779462e8e02c6"
};

async function init() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Criar apenas o admin básico
    const admin = {
      uid: 'admin-001',
      email: 'admin@ufop.edu.br',
      name: 'Admin',
      userType: 'both',
      isAdmin: true,
      isActive: true,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', admin.uid), admin);
    console.log('Admin criado!');
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

init();