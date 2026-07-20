// scripts/initDatabase.js
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeDatabase() {
  try {
    console.log('Iniciando inicialização do banco de dados...');

    // Criar usuário administrador padrão
    const adminUser = {
      uid: 'admin-001',
      email: 'admin@ufop.edu.br',
      name: 'Administrador do Sistema',
      userType: 'both',
      rating: 5,
      totalRatings: 1,
      isActive: true,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      reservations: [],
      ratings: [{
        rating: 5,
        comment: 'Usuário administrador',
        rideId: 'system',
        ratedBy: 'system',
        ratedByName: 'Sistema',
        timestamp: new Date()
      }]
    };

    await setDoc(doc(db, 'users', adminUser.uid), adminUser);
    console.log('✅ Usuário administrador criado com sucesso!');

    // Criar algumas caronas de exemplo
    const sampleRides = [
      {
        id: 'ride-001',
        driverId: adminUser.uid,
        driverName: adminUser.name,
        driverRating: 5,
        from: 'ICEA - UFOP',
        to: 'Centro de João Monlevade',
        price: 5.00,
        totalSeats: 4,
        availableSeats: 3,
        departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas no futuro
        vehicle: 'Fiat Uno Vermelho',
        licensePlate: 'ABC1D23',
        notes: 'Ponto de encontro em frente ao ICEA',
        passengers: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        ratings: []
      },
      {
        id: 'ride-002',
        driverId: adminUser.uid,
        driverName: adminUser.name,
        driverRating: 5,
        from: 'Centro de João Monlevade',
        to: 'ICEA - UFOP',
        price: 5.00,
        totalSeats: 4,
        availableSeats: 4,
        departureTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas no futuro
        vehicle: 'Fiat Uno Vermelho',
        licensePlate: 'ABC1D23',
        notes: 'Retorno para o campus',
        passengers: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        ratings: []
      }
    ];

    for (const ride of sampleRides) {
      await setDoc(doc(db, 'rides', ride.id), ride);
      console.log(`✅ Carona ${ride.id} criada com sucesso!`);
    }

    // Criar alguns usuários de exemplo
    const sampleUsers = [
      {
        uid: 'user-001',
        email: 'motorista@ufop.edu.br',
        name: 'João Motorista',
        phone: '(31) 99999-9999',
        userType: 'driver',
        vehicle: 'Volkswagen Gol Prata',
        licensePlate: 'XYZ9A87',
        rating: 4.5,
        totalRatings: 10,
        isActive: true,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
        ratings: []
      },
      {
        uid: 'user-002',
        email: 'passageiro@ufop.edu.br',
        name: 'Maria Passageira',
        phone: '(31) 98888-8888',
        userType: 'passenger',
        rating: 4.8,
        totalRatings: 5,
        isActive: true,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: ['ride-001'],
        ratings: []
      },
      {
        uid: 'user-003',
        email: 'ambos@ufop.edu.br',
        name: 'Pedro Motorista e Passageiro',
        phone: '(31) 97777-7777',
        userType: 'both',
        vehicle: 'Chevrolet Onix Preto',
        licensePlate: 'DEF4G56',
        rating: 4.2,
        totalRatings: 8,
        isActive: true,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
        ratings: []
      }
    ];

    for (const user of sampleUsers) {
      await setDoc(doc(db, 'users', user.uid), user);
      console.log(`✅ Usuário ${user.name} criado com sucesso!`);
    }

    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log('📧 Use o email: admin@ufop.edu.br para acessar como administrador');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar o banco de dados:', error);
  }
}

initializeDatabase();
