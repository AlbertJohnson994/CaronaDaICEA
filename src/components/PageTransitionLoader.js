// src/components/PageTransitionLoader.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import UfopLogo from './UfopLogo';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

export default function PageTransitionLoader({
  visible,
  messagePt = 'Sincronizando página UFOP...',
  messageEn = 'Switching UFOP page...',
  lang = 'pt',
  durationMs = 2000,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let spinLoop;
    if (visible) {
      progressAnim.setValue(0);
      spinAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 65,
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: durationMs,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();

      spinLoop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      );
      spinLoop.start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }

    return () => {
      if (spinLoop) spinLoop.stop();
    };
  }, [visible, durationMs, fadeAnim, scaleAnim, progressAnim, spinAnim]);

  if (!visible) return null;

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['4%', '100%'],
  });

  const isPt = lang !== 'en';

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Spinning Gold & Maroon Orbital Ring around UFOP Crest */}
        <View style={styles.spinnerWrap}>
          <Animated.View
            style={[
              styles.SpinRing,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          />
          <UfopLogo size="md" showText={false} />
        </View>

        <Text style={styles.brandTitle}>UFOP • Caronas & Campus Connect</Text>
        <Text style={styles.statusText}>{isPt ? messagePt : messageEn}</Text>

        {/* 2-Second Animated Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        <Text style={styles.subHint}>
          {isPt
            ? 'Universidade Federal de Ouro Preto • Ouro Preto · Mariana · João Monlevade'
            : 'Federal University of Ouro Preto • Ouro Preto · Mariana · João Monlevade'}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 9, 14, 0.82)',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.primaryDark,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.xl,
    paddingVertical: 26,
    paddingHorizontal: 28,
    alignItems: 'center',
    maxWidth: 380,
    width: '100%',
    ...SHADOWS.large,
  },
  spinnerWrap: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  SpinRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3.5,
    borderColor: 'rgba(197, 155, 39, 0.22)',
    borderTopColor: COLORS.accent,
    borderRightColor: '#F3E5AB',
  },
  brandTitle: {
    color: '#F3E5AB',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 14,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
  },
  subHint: {
    color: 'rgba(243, 229, 171, 0.72)',
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center',
  },
});
