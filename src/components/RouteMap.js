// src/components/RouteMap.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from "react-native";
import { WebView } from "react-native-webview";
import { convertSad69ToSirgas2000Offline } from "../services/geodeticService";

const RouteMap = ({ origin, destination, driverName }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Legacy SAD69 coordinates representing typical routes in João Monlevade
    const joaoMonlevadeRoutes = {
      Centro: { latitude: -19.8126, longitude: -43.1736 },
      Pampulha: { latitude: -19.815, longitude: -43.182 },
      Planalto: { latitude: -19.81, longitude: -43.17 },
      "Vila Operária": { latitude: -19.82, longitude: -43.18 },
      "São Bento": { latitude: -19.812, longitude: -43.16 },
      ICEA: { latitude: -19.815, longitude: -43.175 },
      Terminal: { latitude: -19.809, longitude: -43.185 },
      Shopping: { latitude: -19.816, longitude: -43.165 },
      Itabira: { latitude: -19.825, longitude: -43.205 },
      UFOP: { latitude: -19.815, longitude: -43.175 }, // Local João Monlevade campus
    };

    const defaultCoord = {
      latitude: -19.8126,
      longitude: -43.1736,
    };

    const normalizeString = (str) => {
      if (!str) return "";
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .trim();
    };

    const findRouteCoordinate = (name) => {
      if (!name) return null;
      const normalizedQuery = normalizeString(name);

      // 1. Try exact normalized match
      for (const [key, value] of Object.entries(joaoMonlevadeRoutes)) {
        if (normalizeString(key) === normalizedQuery) {
          return value;
        }
      }

      // 2. Try partial match (query contains key or key contains query)
      for (const [key, value] of Object.entries(joaoMonlevadeRoutes)) {
        const normalizedKey = normalizeString(key);
        if (normalizedQuery.includes(normalizedKey) || normalizedKey.includes(normalizedQuery)) {
          return value;
        }
      }

      // 3. Smart fallbacks for common Portuguese landmarks in João Monlevade
      if (normalizedQuery.includes("rodoviaria") || normalizedQuery.includes("terminal") || normalizedQuery.includes("onibus")) {
        return joaoMonlevadeRoutes["Terminal"];
      }
      if (normalizedQuery.includes("mercado") || normalizedQuery.includes("hiper") || normalizedQuery.includes("shopping") || normalizedQuery.includes("supermercado")) {
        return joaoMonlevadeRoutes["Shopping"];
      }
      if (normalizedQuery.includes("centro") || normalizedQuery.includes("igreja") || normalizedQuery.includes("praca")) {
        return joaoMonlevadeRoutes["Centro"];
      }
      if (
        normalizedQuery.includes("universidade") || 
        normalizedQuery.includes("campus") || 
        normalizedQuery.includes("ufop") || 
        normalizedQuery.includes("icea") ||
        normalizedQuery.includes("bloco") ||
        normalizedQuery.includes("blk") ||
        normalizedQuery.includes("sala") ||
        normalizedQuery.includes("predio")
      ) {
        return joaoMonlevadeRoutes["ICEA"];
      }

      return null;
    };

    try {
      let rawOriginCoord = findRouteCoordinate(origin) || defaultCoord;
      let rawDestCoord = findRouteCoordinate(destination) || defaultCoord;

      // Safety offset if coordinates are identical (prevents overlaps and forces polyline visibility)
      if (rawOriginCoord.latitude === rawDestCoord.latitude && rawOriginCoord.longitude === rawDestCoord.longitude) {
        rawDestCoord = {
          latitude: rawOriginCoord.latitude - 0.005,
          longitude: rawOriginCoord.longitude + 0.006,
        };
      }

      // High-precision geodetic datum translation to SIRGAS2000 / WGS84
      const convertedOrigin = convertSad69ToSirgas2000Offline(rawOriginCoord.latitude, rawOriginCoord.longitude);
      const convertedDest = convertSad69ToSirgas2000Offline(rawDestCoord.latitude, rawDestCoord.longitude);

      setCoordinates({
        origin: convertedOrigin,
        destination: convertedDest,
      });
      setError(null);
    } catch (err) {
      console.error("Geodetic datum transformation failed:", err);
      setError("Erro ao processar as coordenadas geográficas");
    } finally {
      setLoading(false);
    }
  }, [origin, destination]);

  const handleOpenInMaps = () => {
    if (!coordinates) return;
    
    // Open route in standard native maps app
    const url = `https://www.google.com/maps/dir/?api=1&origin=${coordinates.origin.latitude},${coordinates.origin.longitude}&destination=${coordinates.destination.latitude},${coordinates.destination.longitude}&travelmode=driving`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`geo:${coordinates.origin.latitude},${coordinates.origin.longitude}?q=${coordinates.destination.latitude},${coordinates.destination.longitude}`);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  if (error || !coordinates) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro ao carregar mapa</Text>
      </View>
    );
  }

  // Inject Leaflet.js HTML with OpenStreetMap Tiles and custom route path
  const htmlString = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #f5f5f5;
          }
          .leaflet-control-attribution {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const origin = [${coordinates.origin.latitude}, ${coordinates.origin.longitude}];
          const destination = [${coordinates.destination.latitude}, ${coordinates.destination.longitude}];
          
          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          });

          // Add high-detail OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          // Styled Premium Pin Markers
          const originMarker = L.circleMarker(origin, {
            radius: 8,
            fillColor: "#4CAF50",
            color: "#FFFFFF",
            weight: 2,
            fillOpacity: 1
          }).addTo(map);

          const destMarker = L.circleMarker(destination, {
            radius: 8,
            fillColor: "#FF5722",
            color: "#FFFFFF",
            weight: 2,
            fillOpacity: 1
          }).addTo(map);

          // Route line (thick premium blue line)
          const route = L.polyline([origin, destination], {
            color: '#2196F3',
            weight: 5,
            opacity: 0.95
          }).addTo(map);

          // Fit layout bounds perfectly to route
          map.fitBounds(route.getBounds(), {
            padding: [40, 40]
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={handleOpenInMaps}
        style={styles.touchable}
      >
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlString }}
          style={styles.mapWebView}
          scrollEnabled={false}
          pointerEvents="none" // Allows touch events to fall through to TouchableOpacity for native mapping launch
        />
        <View style={styles.hintOverlay}>
          <Text style={styles.hintText}>Toque para abrir no Google Maps</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#4CAF50" }]} />
          <Text style={styles.legendText}>Saída: {origin}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#FF5722" }]} />
          <Text style={styles.legendText}>Destino: {destination}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  touchable: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  mapWebView: {
    width: "100%",
    height: "100%",
  },
  hintOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  hintText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  legendContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#333",
  },
});

export default RouteMap;
