// src/utils/formatters.js
import { Linking, Share, Alert } from "react-native";
/* global Intl */

export const formatTime = (date) => {
  if (!(date instanceof Date)) {
    if (date && typeof date.toDate === 'function') {
      date = date.toDate();
    } else {
      date = new Date(date);
    }
  }
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (date) => {
  if (!(date instanceof Date)) {
    if (date && typeof date.toDate === 'function') {
      date = date.toDate();
    } else {
      date = new Date(date);
    }
  }
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatPhone = (text = "") => {
  const cleaned = text.replace(/\D/g, "");
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

export const formatLicensePlate = (text = "") => {
  const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 7 && /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(cleaned)) {
    return cleaned; // Mercosul ABC1D23
  }
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
};

export const openWhatsAppContact = async ({ phone, name, ride, isDriver }) => {
  if (!phone) {
    Alert.alert("Aviso", "Número de telefone não informado.");
    return;
  }
  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  
  const departureDate = ride?.departureTime?.toDate ? ride.departureTime.toDate() : new Date(ride?.departureTime);
  const timeStr = formatTime(departureDate);
  
  let message = "";
  if (isDriver) {
    message = `Olá! Sou o motorista ${name} da carona no Caronas ICEA (${ride.from} ➔ ${ride.to} às ${timeStr}).`;
  } else {
    message = `Olá! Sou o passageiro ${name} da sua carona no Caronas ICEA (${ride.from} ➔ ${ride.to} às ${timeStr}).`;
  }

  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp no seu dispositivo.");
    }
  } catch (error) {
    console.error("WhatsApp error:", error);
    Alert.alert("Erro", "Falha ao abrir WhatsApp.");
  }
};

export const shareRideInfo = async (ride) => {
  const departureDate = ride?.departureTime?.toDate ? ride.departureTime.toDate() : new Date(ride?.departureTime);
  const timeStr = formatTime(departureDate);
  const dateStr = formatDate(departureDate);

  const message = `🚨 *Compartilhamento de Carona - ICEA UFOP*\n\n` +
    `🚗 Motorista: ${ride.driverName || "N/I"}\n` +
    `🚙 Veículo: ${ride.vehicle || "N/I"} (Placa: ${ride.licensePlate || "N/I"})\n` +
    `📍 Trajeto: ${ride.from} ➔ ${ride.to}\n` +
    `⏰ Horário: ${dateStr} às ${timeStr}\n\n` +
    `Mensagem enviada via aplicativo Caronas ICEA.`;

  try {
    await Share.share({
      message,
      title: "Detalhes da Carona ICEA",
    });
  } catch (error) {
    console.error("Share error:", error);
  }
};

export const openGoogleMapsRoute = async ({ origin, destination }) => {
  const queryOrigin = origin ? encodeURIComponent(origin + ", João Monlevade, MG") : "";
  const queryDest = encodeURIComponent((destination || "") + ", João Monlevade, MG");
  const url = `https://www.google.com/maps/dir/?api=1&origin=${queryOrigin}&destination=${queryDest}&travelmode=driving`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Erro", "Não foi possível abrir o Google Maps.");
    }
  } catch (error) {
    console.error("Google Maps error:", error);
    Alert.alert("Erro", "Falha ao abrir Google Maps.");
  }
};

export const openWazeRoute = async ({ destination }) => {
  const queryDest = encodeURIComponent((destination || "") + ", João Monlevade, MG");
  const url = `https://waze.com/ul?q=${queryDest}&navigate=yes`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback web url
      await Linking.openURL(`https://www.waze.com/live-map/directions?to=ll.${queryDest}`);
    }
  } catch (error) {
    console.error("Waze error:", error);
    Alert.alert("Erro", "Falha ao abrir o Waze.");
  }
};