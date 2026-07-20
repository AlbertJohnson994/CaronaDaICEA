// src/screens/ProfileScreen.js
import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";
import { getUserStatsInDb } from "../services/sqliteService";
import CustomButton from "../components/CustomButton";
import PhotoDisplay from "../components/PhotoDisplay";
import ToastNotification from "../components/ToastNotification";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../constants/theme";

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUserProfile } = useContext(AuthContext);
  const [userStats, setUserStats] = useState({
    ridesAsDriver: 0,
    ridesAsPassenger: 0,
    averageRating: 0,
  });

  // Toast state
  const [toast, setToast] = useState({ visible: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
  };

  const loadUserStats = React.useCallback(async () => {
    try {
      if (user) {
        const stats = await getUserStatsInDb(user.uid);
        setUserStats(stats);
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  }, [user]);

  useEffect(() => {
    loadUserStats();
  }, [user, loadUserStats]);

  const handleLogout = () => {
    Alert.alert("Sair da Conta", "Deseja realmente encerrar a sessão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: logout, style: "destructive" },
    ]);
  };

  const handleSwitchToDriver = async () => {
    try {
      const newType = user.userType === "passenger" ? "driver" : "passenger";
      const result = await updateUserProfile({
        userType: newType,
      });

      if (result.success) {
        showToast("success", `Perfil alterado para ${newType === 'driver' ? 'Motorista' : 'Passageiro'}`);
        loadUserStats();
      } else {
        showToast("error", "Não foi possível atualizar o perfil");
      }
    } catch (error) {
      showToast("error", "Ocorreu um erro ao atualizar perfil");
    }
  };

  if (!user) return null;

  return (
    <View style={styles.flex1}>
      <ToastNotification
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Profile Section */}
        <View style={styles.header}>
          {user.driverPhotoUri ? (
            <Image
              source={{ uri: user.driverPhotoUri }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={42} color={COLORS.primary} />
            </View>
          )}

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={16} color="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={styles.ratingText}>
              {user.rating ? Number(user.rating).toFixed(1) : "5.0"}
            </Text>
            <Text style={styles.ratingCount}>
              ({user.totalRatings || 0} avaliações)
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.ridesAsDriver}</Text>
            <Text style={styles.statLabel}>Oferecidas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.ridesAsPassenger}</Text>
            <Text style={styles.statLabel}>Utilizadas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {(userStats.averageRating || 5.0).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Média ⭐</Text>
          </View>
        </View>

        {/* Personal Details Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações de Cadastro</Text>

          <View style={styles.infoItem}>
            <Ionicons name="shield-outline" size={20} color={COLORS.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Modalidade:{" "}
              <Text style={{ fontWeight: "700" }}>
                {user.userType === "driver"
                  ? "Motorista"
                  : user.userType === "both"
                  ? "Motorista & Passageiro"
                  : "Passageiro"}
              </Text>
            </Text>
          </View>

          {user.phone ? (
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color={COLORS.primary} style={styles.infoIcon} />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          ) : null}

          {user.vehicle ? (
            <View style={styles.infoItem}>
              <Ionicons name="car-outline" size={20} color={COLORS.primary} style={styles.infoIcon} />
              <Text style={styles.infoText}>{user.vehicle}</Text>
            </View>
          ) : null}

          {user.licensePlate ? (
            <View style={styles.infoItem}>
              <Ionicons name="card-outline" size={20} color={COLORS.primary} style={styles.infoIcon} />
              <Text style={styles.infoText}>Placa: {user.licensePlate}</Text>
            </View>
          ) : null}
        </View>

        {/* Vehicle Photo Section */}
        {(user.userType === "driver" || user.userType === "both") && user.carPhotoUri && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seu Veículo Cadastrado</Text>
            <PhotoDisplay
              photoUri={user.carPhotoUri}
              title="Foto do Veículo"
              licensePlate={user.licensePlate}
              showLicensePlate={true}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <CustomButton
            title={`Alternar para ${user.userType === "passenger" ? "Motorista" : "Passageiro"}`}
            onPress={handleSwitchToDriver}
            icon="swap-horizontal-outline"
            color={COLORS.primary}
          />

          <CustomButton
            title="Editar Perfil"
            onPress={() => navigation.navigate("EditProfile")}
            icon="create-outline"
            color={COLORS.accent}
          />

          <CustomButton
            title="Sair da Conta"
            onPress={handleLogout}
            icon="log-out-outline"
            color={COLORS.danger}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  userName: {
    ...TYPOGRAPHY.h1,
    fontSize: 22,
    color: COLORS.textPrimary,
  },
  userEmail: {
    ...TYPOGRAPHY.caption,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  ratingText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  ratingCount: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    ...SHADOWS.small,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  statNumber: {
    ...TYPOGRAPHY.h1,
    fontSize: 22,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  infoIcon: {
    marginRight: SPACING.md,
  },
  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  actions: {
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
});

export default ProfileScreen;
