// src/constants/locations.js

/**
 * Official landmark dictionary for João Monlevade / UFOP ICEA
 * maps landmark titles to complete physical street addresses for accurate GPS navigation.
 */
export const LOCATION_PRESETS = [
  {
    id: "campus_icea",
    title: "Campus ICEA (UFOP)",
    fullAddress: "Rua Trinta e Seis, 115 - Loanda, João Monlevade - MG, 35931-008",
    shortName: "Campus ICEA",
  },
  {
    id: "centro_monlevade",
    title: "Centro João Monlevade",
    fullAddress: "Praça Sete de Setembro - Centro, João Monlevade - MG",
    shortName: "Centro",
  },
  {
    id: "terminal_rodoviario",
    title: "Terminal Rodoviário",
    fullAddress: "Avenida Getúlio Vargas - Carneirinhos, João Monlevade - MG",
    shortName: "Rodoviária",
  },
  {
    id: "carneirinhos",
    title: "Carneirinhos",
    fullAddress: "Praça do Povo - Carneirinhos, João Monlevade - MG",
    shortName: "Carneirinhos",
  },
  {
    id: "novo_horizonte",
    title: "Novo Horizonte",
    fullAddress: "Avenida Principal - Novo Horizonte, João Monlevade - MG",
    shortName: "Novo Horizonte",
  },
];

/**
 * Returns full street address for Google Maps / Waze lookup.
 * If exact match found, returns full address; otherwise appends city/state.
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
