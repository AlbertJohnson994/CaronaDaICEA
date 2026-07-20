// src/screens/WalletScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";
import { getDriverWalletStatsInDb, updateUserProfileInDb } from "../services/sqliteService";
import { formatDate, formatTime } from "../utils/formatters";
import ToastNotification from "../components/ToastNotification";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../constants/theme";

const WalletScreen = ({ navigation }) => {
  const { user, updateUserProfile } = useContext(AuthContext);

  const [walletStats, setWalletStats] = useState({
    totalGross: 0,
    totalCommission: 0,
    totalNet: 0,
    walletBalance: 0,
    pixKey: "",
    pixType: "CPF",
    transactions: [],
  });
  const [loading, setLoading] = useState(true);

  // Pix Edit state
  const [pixKey, setPixKey] = useState("");
  const [pixType, setPixType] = useState("CPF");
  const [editingPix, setEditingPix] = useState(false);
  const [savingPix, setSavingPix] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ visible: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
  };

  const loadWallet = React.useCallback(async () => {
    if (!user) return;
    try {
      const stats = await getDriverWalletStatsInDb(user.uid);
      setWalletStats(stats);
      setPixKey(stats.pixKey || user.pixKey || "");
      setPixType(stats.pixType || user.pixType || "CPF");
    } catch (error) {
      console.error("Error loading wallet stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleSavePix = async () => {
    if (!pixKey.trim()) {
      showToast("warning", "Por favor, informe sua Chave Pix.");
      return;
    }
    setSavingPix(true);
    try {
      const result = await updateUserProfile({ pixKey: pixKey.trim(), pixType });
      if (result.success) {
        showToast("success", "Chave Pix cadastrada com sucesso para recebimentos!");
        setEditingPix(false);
        loadWallet();
      } else {
        showToast("error", result.error || "Erro ao salvar Chave Pix.");
      }
    } catch (error) {
      showToast("error", "Não foi possível salvar a Chave Pix.");
    } finally {
      setSavingPix(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.flex1}>
      <ToastNotification
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header & Balance Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Carteira & Finanças ICEA</Text>
          <Text style={styles.headerSubtitle}>
            Gestão transparente de recebimentos e taxa de 10% da plataforma
          </Text>

          <View style={styles.mainBalanceContainer}>
            <Text style={styles.balanceLabel}>Saldo Líquido Disponível (90%)</Text>
            <Text style={styles.balanceAmount}>
              R$ {Number(walletStats.walletBalance || walletStats.totalNet).toFixed(2)}
            </Text>
          </View>

          {/* Breakdown Stats */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownNumber}>
                R$ {Number(walletStats.totalGross).toFixed(2)}
              </Text>
              <Text style={styles.breakdownLabel}>Faturamento Bruto</Text>
            </View>

            <View style={styles.breakdownDivider} />

            <View style={styles.breakdownItem}>
              <Text style={[styles.breakdownNumber, { color: COLORS.warning }]}>
                R$ {Number(walletStats.totalCommission).toFixed(2)}
              </Text>
              <Text style={styles.breakdownLabel}>Taxa Admin (10%)</Text>
            </View>
          </View>
        </View>

        {/* PIX KEY CONFIGURATION SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="qr-code-outline" size={20} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Chave Pix para Recebimento</Text>
            </View>
            <TouchableOpacity onPress={() => setEditingPix(!editingPix)}>
              <Text style={styles.editLinkText}>{editingPix ? "Cancelar" : "Editar"}</Text>
            </TouchableOpacity>
          </View>

          {editingPix ? (
            <View style={styles.pixForm}>
              <Text style={styles.label}>Tipo de Chave</Text>
              <View style={styles.pixTypeRow}>
                {["CPF", "Email", "Telefone", "Aleatória"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.pixTypeChip, pixType === type && styles.pixTypeChipActive]}
                    onPress={() => setPixType(type)}
                  >
                    <Text style={[styles.pixTypeText, pixType === type && styles.pixTypeTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Informe sua Chave Pix"
                value={pixKey}
                onChangeText={setPixKey}
                placeholderTextColor={COLORS.textMuted}
              />

              <TouchableOpacity
                style={[styles.savePixBtn, savingPix && { opacity: 0.6 }]}
                onPress={handleSavePix}
                disabled={savingPix}
              >
                {savingPix ? (
                  <ActivityIndicator color={COLORS.surface} size="small" />
                ) : (
                  <Text style={styles.savePixBtnText}>Salvar Chave Pix</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pixDisplayBox}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pixTypeLabel}>Chave Pix ({walletStats.pixType || "CPF"}):</Text>
                <Text style={styles.pixKeyValue}>
                  {walletStats.pixKey || "Nenhuma chave cadastrada ainda"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* TRANSACTIONS HISTORY FEED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Recebimentos & Comissões</Text>

          {walletStats.transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Nenhuma transação financeira registrada ainda.</Text>
            </View>
          ) : (
            walletStats.transactions.map((tx) => (
              <View key={tx.id} style={styles.txCard}>
                <View style={styles.txHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.txPassengerName}>{tx.passengerName || "Passageiro UFOP"}</Text>
                  </View>
                  <View style={styles.txMethodBadge}>
                    <Text style={styles.txMethodText}>{tx.paymentMethod || "PIX"}</Text>
                  </View>
                </View>

                <View style={styles.txDivider} />

                <View style={styles.txDetailsRow}>
                  <View>
                    <Text style={styles.txDateText}>
                      {formatDate(new Date(tx.createdAt))} • {formatTime(new Date(tx.createdAt))}
                    </Text>
                    <Text style={styles.txFeeText}>Taxa da Plataforma (10%): R$ {Number(tx.platformFee).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.txNetAmount}>+ R$ {Number(tx.driverNet).toFixed(2)}</Text>
                </View>
              </View>
            ))
          )}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    ...SHADOWS.medium,
  },
  headerTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 22,
    color: COLORS.surface,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  mainBalanceContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  balanceLabel: {
    ...TYPOGRAPHY.caption,
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.surface,
    marginTop: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  breakdownItem: {
    flex: 1,
    alignItems: "center",
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  breakdownNumber: {
    ...TYPOGRAPHY.h2,
    fontSize: 16,
    color: COLORS.success,
  },
  breakdownLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  editLinkText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
    color: COLORS.accent,
  },
  pixForm: {
    marginTop: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  pixTypeRow: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  pixTypeChip: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pixTypeChipActive: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  pixTypeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
  },
  pixTypeTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  savePixBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  savePixBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
  },
  pixDisplayBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  pixTypeLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  pixKeyValue: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  emptyTransactions: {
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  txCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txPassengerName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    marginLeft: 6,
    color: COLORS.textPrimary,
  },
  txMethodBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  txMethodText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.accent,
  },
  txDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  txDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txDateText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  txFeeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: "600",
  },
  txNetAmount: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.success,
  },
});

export default WalletScreen;
