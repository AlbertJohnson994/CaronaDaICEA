// src/services/campusConnectService.js
import { Linking, Platform } from 'react-native';

export const CAMPUS_CONNECT_WEB_URL = 'http://localhost:5173';
export const CAMPUS_CONNECT_API_URL = 'http://localhost:3001/api';

export const DEFAULT_CAMPUS_CONNECT_EVENTS = [
  {
    id: 'ev-ufop-hackathon',
    title: 'Hackathon DeCSI & IA — UFOP ICEA',
    organizer: 'DAEC & DECSI — UFOP ICEA',
    university: 'UFOP — Campus ICEA (João Monlevade)',
    category: 'Learn',
    dateTimeLabel: 'Hoje às 18:30',
    venue: 'Campus ICEA UFOP',
    venueDetail: 'Auditório & Bloco Principal — Campus ICEA',
    occupied: 44,
    capacity: 60,
    description:
      'Maratona universitária de programação, IA e Mobilidade Urbana no Campus ICEA com caronas integradas.',
  },
  {
    id: 'ev-ufop-futsal',
    title: 'Torneio Intercursos de Futsal ICEA',
    organizer: 'Atlética Engenharias UFOP ICEA',
    university: 'UFOP — Campus ICEA (João Monlevade)',
    category: 'Sport',
    dateTimeLabel: 'Amanhã às 16:00',
    venue: 'Campus ICEA UFOP',
    venueDetail: 'Quadra Poliesportiva — Campus ICEA UFOP',
    occupied: 32,
    capacity: 40,
    description:
      'Campeonato universitário entre Engenharia de Computação, Sistemas de Informação, Produção e Elétrica.',
  },
  {
    id: 'ev-ufop-calculo',
    title: 'Grupo de Estudos: Estrutura de Dados & Cálculo',
    organizer: 'Monitoria DECSI & DECEA',
    university: 'UFOP — Campus ICEA (João Monlevade)',
    category: 'Learn',
    dateTimeLabel: 'Quinta às 13:30',
    venue: 'Biblioteca ICEA',
    venueDetail: 'Biblioteca do Campus ICEA — Sala de Estudos 2',
    occupied: 14,
    capacity: 20,
    description:
      'Resolução conjunta de listas de Estruturas de Dados I (BCC202) e Cálculo no Campus ICEA.',
  },
  {
    id: 'ev-pasta-night',
    title: 'Pasta night for students (Intercâmbio UOS × UFOP)',
    organizer: 'Trattoria Sole · Osnabrück University',
    university: 'Osnabrück University',
    category: 'Eat',
    dateTimeLabel: 'Amanhã às 18:30',
    venue: 'Westerberg Campus',
    venueDetail: 'Trattoria Sole · Westerberg Campus',
    occupied: 28,
    capacity: 40,
    description:
      'Encontro gastronômico estudantil integrado à rede parceira Campus Connect (Osnabrück & UFOP).',
  },
];

export async function getCampusConnectEvents() {
  try {
    if (typeof fetch !== 'undefined') {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${CAMPUS_CONNECT_API_URL}/events`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          const apiMapped = json.data.map((ev) => ({
            id: ev.id,
            title: ev.title,
            organizer: ev.organizer?.displayName || 'Campus Connect',
            university: 'Campus Connect Network',
            category: ev.category || 'Learn',
            dateTimeLabel: ev.startsAt
              ? new Date(ev.startsAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Hoje às 18:30',
            venue: ev.venue || 'Campus ICEA UFOP',
            venueDetail: ev.venue || 'Campus ICEA UFOP',
            occupied: ev._count?.registrations || 12,
            capacity: ev.capacity || 30,
            description: ev.description || '',
          }));
          return [...DEFAULT_CAMPUS_CONNECT_EVENTS, ...apiMapped];
        }
      }
    }
  } catch {
    // Fallback to curated Campus Connect events when offline/standalone
  }
  return DEFAULT_CAMPUS_CONNECT_EVENTS;
}

export async function syncRideToCampusConnect(rideData) {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const existingRaw = window.localStorage.getItem('cc_caronas_icea_rides_v1');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const mapped = {
        id: rideData.id || `ride-icea-${Date.now()}`,
        driverId: rideData.driverId || 'user-icea',
        driverName: rideData.driverName || 'Estudante UFOP ICEA',
        driverCourse: rideData.driverCourse || 'Engenharia (UFOP ICEA)',
        driverUniversity: 'UFOP — Campus ICEA (João Monlevade)',
        driverAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        driverRating: 5.0,
        driverPhone: rideData.driverPhone || '5531998877665',
        pixKey: rideData.pixKey || 'caronas.icea@ufop.edu.br',
        vehicleModel: rideData.vehicleModel || 'Veículo Universitário',
        vehicleColor: rideData.vehicleColor || 'Prata',
        vehiclePlate: rideData.vehiclePlate || 'UFOP-2026',
        from: rideData.from,
        to: rideData.to,
        departureLabel: rideData.departureLabel || 'Hoje às 18:15',
        distanceKmLabel: '3.9 km',
        durationMinLabel: '10 min',
        price: Number(rideData.price || 5),
        currency: 'BRL',
        totalSeats: Number(rideData.totalSeats || 4),
        availableSeats: Number(rideData.availableSeats || rideData.totalSeats || 4),
        isWomenOnly: Boolean(rideData.isWomenOnly),
        recurringDays: rideData.recurringDays || [],
        preferences: rideData.preferences || ['Ar-Condicionado'],
        linkedEventId: rideData.linkedEventId,
        linkedEventTitle: rideData.linkedEventTitle,
        notes: rideData.notes || '',
        passengers: [],
      };
      window.localStorage.setItem(
        'cc_caronas_icea_rides_v1',
        JSON.stringify([mapped, ...existing])
      );
    }
  } catch {
    // ignore storage errors
  }
}

export function openCampusConnectHub(hash = '#caronas') {
  let baseUrl = CAMPUS_CONNECT_WEB_URL;
  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    baseUrl = `${window.location.origin}/campus-connect/index.html`;
  }
  const targetUrl = baseUrl.endsWith('.html')
    ? `${baseUrl}${hash}`
    : `${baseUrl}/${hash}`;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(targetUrl).catch(() => {});
  }
}
