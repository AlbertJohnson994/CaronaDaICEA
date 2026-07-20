// src/constants/locations.js

/**
 * Official landmark dictionary for João Monlevade / UFOP ICEA
 * maps landmark titles to complete physical street addresses and precise lat/lng coordinates
 * for accurate GPS navigation in Google Maps, Waze, and distance matrix calculations.
 */
export const LOCATION_PRESETS = [
  {
    id: "campus_icea",
    title: "Campus ICEA (UFOP)",
    fullAddress: "Rua Trinta e Seis, 115 - Loanda, João Monlevade - MG, 35931-008",
    shortName: "Campus ICEA",
    lat: -19.81542,
    lng: -43.17391,
  },
  {
    id: "centro_monlevade",
    title: "Centro João Monlevade",
    fullAddress: "Praça Sete de Setembro - Centro, João Monlevade - MG",
    shortName: "Centro",
    lat: -19.81055,
    lng: -43.17412,
  },
  {
    id: "terminal_rodoviario",
    title: "Terminal Rodoviário",
    fullAddress: "Avenida Getúlio Vargas - Carneirinhos, João Monlevade - MG",
    shortName: "Rodoviária",
    lat: -19.80582,
    lng: -43.18590,
  },
  {
    id: "carneirinhos",
    title: "Carneirinhos",
    fullAddress: "Praça do Povo - Carneirinhos, João Monlevade - MG",
    shortName: "Carneirinhos",
    lat: -19.80890,
    lng: -43.18120,
  },
  {
    id: "novo_horizonte",
    title: "Novo Horizonte",
    fullAddress: "Avenida Principal - Novo Horizonte, João Monlevade - MG",
    shortName: "Novo Horizonte",
    lat: -19.82100,
    lng: -43.16500,
  },
];

/**
 * Returns full street address or location object for Google Maps / Waze lookup.
 */
export const getFullAddressForLocation = (locationTitle = "") => {
  if (!locationTitle) return "João Monlevade, MG";

  const normalizedInput = locationTitle.toLowerCase().trim();
  const match = LOCATION_PRESETS.find(
    (loc) =>
      loc.title.toLowerCase().includes(normalizedInput) ||
      loc.shortName.toLowerCase().includes(normalizedInput) ||
      normalizedInput.includes(loc.shortName.toLowerCase()) ||
      normalizedInput.includes(loc.title.toLowerCase())
  );

  if (match) {
    return match.fullAddress;
  }

  // Fallback appending city/state
  if (!normalizedInput.includes("monlevade")) {
    return `${locationTitle}, João Monlevade - MG`;
  }
  return locationTitle;
};

/**
 * Returns latitude and longitude object for a location title.
 */
export const getLocationCoordinates = (locationTitle = "") => {
  if (!locationTitle) return { lat: -19.81542, lng: -43.17391 };

  const normalizedInput = locationTitle.toLowerCase().trim();
  const match = LOCATION_PRESETS.find(
    (loc) =>
      loc.title.toLowerCase().includes(normalizedInput) ||
      loc.shortName.toLowerCase().includes(normalizedInput) ||
      normalizedInput.includes(loc.shortName.toLowerCase()) ||
      normalizedInput.includes(loc.title.toLowerCase())
  );

  if (match) {
    return { lat: match.lat, lng: match.lng };
  }

  // Default fallback to ICEA center
  return { lat: -19.81542, lng: -43.17391 };
};
