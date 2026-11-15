// src/components/UfopLogo.js
// Official UFOP Emblem & Brand Header Component (Vinho #8C1D40 & Ouro #C59B27)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { COLORS, RADIUS, SHADOWS, UFOP_LINKS } from '../constants/theme';

export const openUfopUrl = (url = UFOP_LINKS.portal) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(url).catch(() => {});
  }
};

export default function UfopLogo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'hero'
  light = false,
  showSubtitle = true,
  showPortalBadge = false,
  onPress,
}) {
  const dimensions = {
    sm: { box: 38, pillarW: 4, font: 16, subFont: 9 },
    md: { box: 52, pillarW: 5, font: 20, subFont: 10.5 },
    lg: { box: 72, pillarW: 7, font: 28, subFont: 12 },
    hero: { box: 88, pillarW: 8, font: 34, subFont: 13 },
  }[size] || { box: 52, pillarW: 5, font: 20, subFont: 10.5 };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      openUfopUrl(UFOP_LINKS.portal);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.wrapper}
    >
      {/* UFOP Architectural Emblem (Baroque / Colonial Pillars + Gold Arch & Star) */}
      <View
        style={[
          styles.emblemBox,
          {
            width: dimensions.box,
            height: dimensions.box,
            backgroundColor: light ? '#FFFFFF' : COLORS.primary,
            borderColor: COLORS.accent,
          },
        ]}
      >
        {/* Top Gold Crown Bar */}
        <View
          style={[
            styles.topArch,
            {
              backgroundColor: COLORS.accent,
              width: dimensions.box * 0.68,
              height: Math.max(3, dimensions.box * 0.07),
            },
          ]}
        />

        {/* UFOP Iconic Vertical Columns (Representing Ouro Preto, Mariana & João Monlevade) */}
        <View style={styles.pillarsRow}>
          <View
            style={[
              styles.pillar,
              {
                width: dimensions.pillarW,
                height: dimensions.box * 0.36,
                backgroundColor: light ? COLORS.primary : '#FFFFFF',
              },
            ]}
          />
          <View
            style={[
              styles.pillar,
              {
                width: dimensions.pillarW,
                height: dimensions.box * 0.48,
                backgroundColor: COLORS.accent,
                marginHorizontal: Math.max(2, dimensions.pillarW * 0.55),
              },
            ]}
          />
          <View
            style={[
              styles.pillar,
              {
                width: dimensions.pillarW,
                height: dimensions.box * 0.56,
                backgroundColor: light ? COLORS.primary : '#FFFFFF',
                marginRight: Math.max(2, dimensions.pillarW * 0.55),
              },
            ]}
          />
          <View
            style={[
              styles.pillar,
              {
                width: dimensions.pillarW,
                height: dimensions.box * 0.48,
                backgroundColor: COLORS.accent,
                marginRight: Math.max(2, dimensions.pillarW * 0.55),
              },
            ]}
          />
          <View
            style={[
              styles.pillar,
              {
                width: dimensions.pillarW,
                height: dimensions.box * 0.36,
                backgroundColor: light ? COLORS.primary : '#FFFFFF',
              },
            ]}
          />
        </View>

        {/* Emblem Base Pedestal */}
        <View
          style={[
            styles.pedestal,
            {
              width: dimensions.box * 0.74,
              backgroundColor: light ? COLORS.primary : COLORS.accent,
            },
          ]}
        >
          <Text
            style={[
              styles.emblemMiniText,
              {
                color: light ? '#FFFFFF' : COLORS.primaryDark,
                fontSize: Math.max(7, dimensions.box * 0.13),
              },
            ]}
          >
            UFOP
          </Text>
        </View>
      </View>

      {/* UFOP Official Wordmark & Subtitle */}
      <View style={styles.textColumn}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.ufopTitle,
              {
                fontSize: dimensions.font,
                color: light ? '#FFFFFF' : COLORS.primary,
              },
            ]}
          >
            UFOP
          </Text>
          <View style={styles.goldDot} />
          <Text
            style={[
              styles.superAppTag,
              {
                fontSize: Math.max(11, dimensions.font * 0.58),
                color: light ? '#F3E5AB' : COLORS.primaryDark,
              },
            ]}
          >
            Caronas & Campus Connect
          </Text>
        </View>

        {showSubtitle && (
          <Text
            style={[
              styles.ufopSubtitle,
              {
                fontSize: dimensions.subFont,
                color: light ? 'rgba(255,255,255,0.88)' : COLORS.textSecondary,
              },
            ]}
          >
            Universidade Federal de Ouro Preto • Ouro Preto · Mariana · João Monlevade
          </Text>
        )}

        {showPortalBadge && (
          <View style={styles.portalPill}>
            <Text style={styles.portalPillText}>🌐 ufop.br • Portal Oficial Conectado</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emblemBox: {
    borderRadius: RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    marginRight: 12,
    ...SHADOWS.medium,
  },
  topArch: {
    borderRadius: 4,
    marginBottom: 3,
  },
  pillarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: 2,
  },
  pillar: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  pedestal: {
    marginTop: 3,
    borderRadius: 3,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemMiniText: {
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  textColumn: {
    flexShrink: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ufopTitle: {
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginHorizontal: 8,
  },
  superAppTag: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ufopSubtitle: {
    fontWeight: '600',
    marginTop: 2,
  },
  portalPill: {
    marginTop: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(197, 155, 39, 0.22)',
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  portalPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F3E5AB',
  },
});
