// src/components/RideCard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatTime, formatDate } from "../utils/formatters";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../constants/theme";

const RideCard = ({ ride, onPress, carPhoto, currentUserId }) => {
  const departureTime = ride.departureTime?.toDate ? ride.departureTime.toDate() : new Date(ride.departureTime);
  const isDriver = ride.driverId === currentUserId;
  const isPassenger = Array.isArray(ride.passengers) && ride.passengers.includes(currentUserId);

  // Status configuration
  const getStatusBadge = () => {
    if (ride.cancelled) {
      return { text: "Cancelada", bg: COLORS.dangerLight, color: COLORS.danger, icon: "close-circle" };
    }
    if (ride.completed) {
      return { text: "Concluída", bg: COLORS.infoLight, color: COLORS.info, icon: "checkmark-done-circle" };
    }
    if (ride.status === "IN_PROGRESS") {
      return { text: "Em Andamento", bg: COLORS.warningLight, color: COLORS.warning, icon: "navigate" };
    }
    if (ride.availableSeats <= 0) {
      return { text: "Lotada", bg: "#F1F5F9", color: COLORS.textMuted, icon: "people" };
    }
    return { text: `${ride.availableSeats} vaga(s)`, bg: COLORS.successLight, color: COLORS.success, icon: "checkmark-circle" };
  };

  const status = getStatusBadge();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Driver Header */}
      <View style={styles.driverHeader}>
        <View style={styles.driverInfo}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={16} color={COLORS.primary} />
          </View>
          <View style={styles.driverTextContainer}>
            <Text style={styles.driverName} numberOfLines={1}>
              {ride.driverName || "Motorista UFOP"}
            </Text>
            {ride.driverRating ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingText}>
                  {Number(ride.driverRating).toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* User Role Tag */}
        {isDriver && (
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>Sua Carona</Text>
          </View>
        )}
        {isPassenger && !isDriver && (
          <View style={[styles.roleTag, styles.passengerRoleTag]}>
            <Text style={[styles.roleTagText, styles.passengerRoleTagText]}>Reservado</Text>
          </View>
        )}

        <Text style={styles.price}>R$ {Number(ride.price).toFixed(2)}</Text>
      </View>

      <View style={styles.divider} />

      {/* Visual Route Timeline */}
      <View style={styles.routeContainer}>
        <View style={styles.timelineColumn}>
          <View style={[styles.dot, styles.dotOrigin]} />
          <View style={styles.verticalLine} />
          <View style={[styles.dot, styles.dotDestination]} />
        </View>

        <View style={styles.placesColumn}>
          <View style={styles.placeRow}>
            <Text style={styles.placeLabel}>SAÍDA</Text>
            <Text style={styles.placeName} numberOfLines={1}>
              {ride.from}
            </Text>
          </View>
          <View style={[styles.placeRow, styles.placeRowDestination]}>
            <Text style={styles.placeLabel}>DESTINO</Text>
            <Text style={styles.placeName} numberOfLines={1}>
              {ride.to}
            </Text>
          </View>
        </View>

        {carPhoto ? (
          <Image source={{ uri: carPhoto }} style={styles.carThumbnail} />
        ) : null}
      </View>

      <View style={styles.divider} />

      {/* Footer Info */}
      <View style={styles.footer}>
        <View style={styles.timeInfo}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>
            {formatTime(departureTime)} • {formatDate(departureTime)}
          </Text>
          {ride.distanceKm ? (
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate-circle-outline" size={13} color={COLORS.primary} style={{ marginRight: 2 }} />
              <Text style={styles.distanceBadgeText}>
                {ride.distanceKm} km • ~{ride.estimatedMinutes || 10} min
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon} size={13} color={status.color} style={{ marginRight: 4 }} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
        </View>
      </View>

      {/* Vehicle Info Pill */}
      {ride.vehicle ? (
        <View style={styles.vehicleRow}>
          <Ionicons name="car-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.vehicleText} numberOfLines={1}>
            {ride.vehicle} {ride.licensePlate ? `• Placa: ${ride.licensePlate}` : ""}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  driverTextContainer: {
    flex: 1,
  },
  driverName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  ratingText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  roleTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.surface,
  },
  passengerRoleTag: {
    backgroundColor: COLORS.successLight,
  },
  passengerRoleTagText: {
    color: COLORS.success,
  },
  price: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: SPACING.xs,
  },
  timelineColumn: {
    alignItems: "center",
    width: 20,
    marginRight: SPACING.sm,
    paddingVertical: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotOrigin: {
    backgroundColor: COLORS.success,
  },
  dotDestination: {
    backgroundColor: COLORS.danger,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  placesColumn: {
    flex: 1,
    justifyContent: "center",
  },
  placeRow: {
    justifyContent: "center",
  },
  placeRowDestination: {
    marginTop: SPACING.sm + 2,
  },
  placeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  placeName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  carThumbnail: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    marginLeft: SPACING.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    marginLeft: 6,
    color: COLORS.textSecondary,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: 6,
  },
  distanceBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: {
    ...TYPOGRAPHY.badge,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  vehicleText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
});

export default RideCard;
