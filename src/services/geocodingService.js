// src/services/geocodingService.js
import { LOCATION_PRESETS } from "../constants/locations";

/**
 * Calculates distance between two latitude/longitude points in kilometers
 * using the Haversine formula.
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Radius of Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  // Add 25% road curvature factor for city street driving
  const drivingDistanceKm = Number((distanceKm * 1.25).toFixed(1));

  // Estimate duration assuming average speed of 35 km/h in urban Monlevade
  const estimatedMinutes = Math.max(
    3,
    Math.round((drivingDistanceKm / 35) * 60)
  );

  return {
    distanceKm: drivingDistanceKm,
    estimatedMinutes,
  };
};

/**
 * Autocomplete location search using local presets + OpenStreetMap Nominatim API.
 * Free, open-source, and requiring no paid API key.
 */
export const searchLocationAutocomplete = async (query = "") => {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return [];

  // 1. Check local presets first
  const presetMatches = LOCATION_PRESETS.filter(
    (loc) =>
      loc.title.toLowerCase().includes(cleanQuery) ||
      loc.shortName.toLowerCase().includes(cleanQuery) ||
      loc.fullAddress.toLowerCase().includes(cleanQuery)
  ).map((loc) => ({
    name: loc.title,
    address: loc.fullAddress,
    lat: loc.lat,
    lng: loc.lng,
    source: "preset",
  }));

  // If local preset matches found, return them immediately
  if (presetMatches.length > 0 && cleanQuery.length < 3) {
    return presetMatches;
  }

  // 2. Fetch live OpenStreetMap Nominatim Geocoding API for João Monlevade
  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query + ", João Monlevade, MG"
    )}&format=json&addressdetails=1&limit=5`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CaronasICEAUFOP/1.0",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const apiResults = data.map((item) => ({
        name: item.display_name.split(",")[0] || item.display_name,
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        source: "osm",
      }));

      // Combine preset matches with OSM results without duplicates
      const combined = [...presetMatches];
      apiResults.forEach((res) => {
        if (!combined.some((c) => Math.abs(c.lat - res.lat) < 0.0005)) {
          combined.push(res);
        }
      });

      return combined.slice(0, 5);
    }
  } catch (error) {
    console.warn("Nominatim Geocoding API timeout/fallback to presets:", error.message);
  }

  return presetMatches;
};
