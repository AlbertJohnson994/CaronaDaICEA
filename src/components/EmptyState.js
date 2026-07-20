// src/components/EmptyState.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../constants/theme";

const EmptyState = ({
  icon = "car-sport-outline",
  title = "Nenhuma carona encontrada",
  message = "Tente alterar os filtros ou publicar uma nova carona para este trajeto.",
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction}>
          <Ionicons name="add-circle-outline" size={20} color={COLORS.surface} style={styles.btnIcon} />
          <Text style={styles.actionBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxl,
    marginVertical: SPACING.xl,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h3,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  message: {
    ...TYPOGRAPHY.caption,
    textAlign: "center",
    color: COLORS.textSecondary,
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  btnIcon: {
    marginRight: SPACING.xs,
  },
  actionBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
  },
});

export default EmptyState;
