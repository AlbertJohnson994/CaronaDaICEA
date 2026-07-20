// src/components/ToastNotification.js
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../constants/theme";

const ToastNotification = ({ visible, type = "info", title, message, onClose, duration = 4000 }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      handleClose();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case "success":
        return {
          bg: COLORS.successLight,
          border: COLORS.success,
          icon: "checkmark-circle",
          iconColor: COLORS.success,
        };
      case "error":
      case "danger":
        return {
          bg: COLORS.dangerLight,
          border: COLORS.danger,
          icon: "alert-circle",
          iconColor: COLORS.danger,
        };
      case "warning":
        return {
          bg: COLORS.warningLight,
          border: COLORS.warning,
          icon: "warning",
          iconColor: COLORS.warning,
        };
      default:
        return {
          bg: COLORS.infoLight,
          border: COLORS.info,
          icon: "information-circle",
          iconColor: COLORS.info,
        };
    }
  };

  const styleConfig = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Ionicons name={styleConfig.icon} size={24} color={styleConfig.iconColor} style={styles.icon} />
      <View style={styles.textContainer}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
        <Ionicons name="close" size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 45,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 5,
    ...SHADOWS.medium,
  },
  icon: {
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});

export default ToastNotification;
