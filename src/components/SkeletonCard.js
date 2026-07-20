// src/components/SkeletonCard.js
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../constants/theme";

const SkeletonCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Animated.View style={[styles.skeletonBlock, { width: "60%", height: 20, opacity }]} />
        <Animated.View style={[styles.skeletonBlock, { width: "25%", height: 20, opacity }]} />
      </View>

      <View style={styles.body}>
        <Animated.View style={[styles.skeletonBlock, { width: "80%", height: 14, marginBottom: 8, opacity }]} />
        <Animated.View style={[styles.skeletonBlock, { width: "50%", height: 14, marginBottom: 8, opacity }]} />
        <Animated.View style={[styles.skeletonBlock, { width: "40%", height: 14, opacity }]} />
      </View>

      <View style={styles.footer}>
        <Animated.View style={[styles.skeletonBlock, { width: 90, height: 26, borderRadius: RADIUS.full, opacity }]} />
      </View>
    </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  body: {
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  skeletonBlock: {
    backgroundColor: "#CBD5E1",
    borderRadius: RADIUS.sm,
  },
});

export default SkeletonCard;
