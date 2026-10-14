// src/screens/WalletScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";
import { 
  getDriverWalletStatsInDb, 
  updateUserProfileInDb,
  createWithdrawalRequestInDb,
  fetchDriverWithdrawalsInDb,
} from "../services/sqliteService";
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
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pix Edit state
  const [pixKey, setPixKey] = useState("");
  const [pixType, setPixType] = useState("CPF");
  const [editingPix, setEditingPix] = useState(false);
  const [savingPix, setSavingPix] = useState(false);

  // Withdrawal Modal state
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

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

      const wList = await fetchDriverWithdrawalsInDb(user.uid);
      setWithdrawals(wList);
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

  const handleOpenWithdrawModal = () => {
    const currentBalance = Number(walletStats.walletBalance || walletStats.totalNet || 0);
    if (currentBalance <= 0) {
      Alert.alert("Saldo Insuficiente", "Você não possui saldo líquido disponível para saque no momento.");
      return;
    }
    if (!walletStats.pixKey && !user?.pixKey) {
      Alert.alert("Chave Pix Necessária", "Cadastre sua chave Pix antes de solicitar uma transferência.");
      setEditingPix(true);
      return;
    }
    setWithdrawAmount(currentBalance.toFixed(2));
    setWithdrawModalVisible(true);
  };

  const handleConfirmWithdraw = async () => {
    const amountNum = parseFloat(withdrawAmount);
    const currentBalance = Number(walletStats.walletBalance || walletStats.totalNet || 0);

    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Valor Inválido", "Informe um valor positivo para saque.");
      return;
    }

    if (amountNum > currentBalance) {
      Alert.alert("Saldo Insuficiente", `O valor máximo que você pode transferir é R$ ${currentBalance.toFixed(2)}.`);
      return;
    }

    setSubmittingWithdraw(true);
    try {
      const res = await createWithdrawalRequestInDb({
        driverId: user.uid,
        driverName: user.name,
        amount: amountNum,
        pixKey: walletStats.pixKey || user.pixKey,
      });

      if (res.success) {
        setWithdrawModalVisible(false);
        showToast("success", "Solicitação de saque enviada! O administrador efetuará o Pix.");
        loadWallet();
      } else {
        showToast("error", res.error || "Não foi possível solicitar o saque.");
      }
    } catch (e) {
      showToast("error", "Erro ao processar saque.");
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const currentBalance = Number(walletStats.walletBalance || walletStats.totalNet || 0);

  return (
    <View style={styles.flex1}>
      <ToastNotification
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Header & Balance Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Carteira & Finanças ICEA</Text>
          <Text style={styles.headerSubtitle}>
            Gestão transparente de repasses e taxa de 25% da plataforma
          </Text>

          <View style={styles.mainBalanceContainer}>
            <Text style={styles.balanceLabel}>Saldo Líquido Disponível (75%)</Text>
            <Text style={styles.balanceAmount}>
              R$ {currentBalance.toFixed(2)}
            </Text>

            <TouchableOpacity 
              style={[styles.withdrawBtn, currentBalance <= 0 && { opacity: 0.6 }]}
              onPress={handleOpenWithdrawModal}
              disabled={currentBalance <= 0}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-up-circle-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.withdrawBtnText}>Solicitar Saque via Pix</Text>
            </TouchableOpacity>
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
              <Text style={styles.breakdownLabel}>Taxa Admin (25%)</Text>
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

        {/* WITHDRAWALS HISTORY */}
        {withdrawals.length > 0 && (
          <View style={styles.section}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm }}>
              <Ionicons name="card-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Solicitações de Saque</Text>
            </View>

            {withdrawals.map((w) => {
              const isPending = w.status === 'PENDING';
              return (
                <View key={w.id} style={styles.withdrawalCard}>
                  <View style={styles.withdrawalHeader}>
                    <Text style={styles.withdrawalAmount}>R$ {Number(w.amount).toFixed(2)}</Text>
                    <View style={[styles.statusBadge, isPending ? styles.pendingBadge : styles.confirmedBadge]}>
                      <Text style={[styles.statusBadgeText, isPending ? styles.pendingBadgeText : styles.confirmedBadgeText]}>
                        {isPending ? "EM ANÁLISE" : "PAGO VIA PIX"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.withdrawalKeyText}>Chave Pix: {w.pixKey}</Text>
                  <Text style={styles.withdrawalDateText}>
                    {formatDate(w.requestedAt || w.createdAt)} • {formatTime(w.requestedAt || w.createdAt)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

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
                    <Text style={styles.txFeeText}>Taxa da Plataforma (25%): R$ {Number(tx.platformFee).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.txNetAmount}>+ R$ {Number(tx.driverNet).toFixed(2)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* MODAL: SOLICITAR SAQUE */}
      <Modal
        visible={withdrawModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="wallet" size={32} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Solicitar Saque via Pix</Text>
              <Text style={styles.modalSubtitle}>
                O valor será enviado diretamente para a chave Pix cadastrada em sua conta.
              </Text>
            </View>

            <View style={styles.modalInfoBox}>
              <Text style={styles.modalInfoLabel}>Chave Pix de Destino:</Text>
              <Text style={styles.modalInfoValue}>{walletStats.pixKey || user?.pixKey}</Text>
            </View>

            <Text style={styles.inputLabel}>Valor a Sacar (R$)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setWithdrawModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, submittingWithdraw && { opacity: 0.6 }]}
                onPress={handleConfirmWithdraw}
                disabled={submittingWithdraw}
              >
                {submittingWithdraw ? (
                  <ActivityIndicator color={COLORS.surface} size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirmar Saque</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: SPACING.md,
  },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
    ...SHADOWS.small,
  },
  withdrawBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    fontSize: 13,
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
  breakdownNumber: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  breakdownLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontSize: 11,
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
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
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    color: COLORS.primary,
  },
  pixForm: {
    marginTop: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  pixTypeRow: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  pixTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  pixTypeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pixTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  pixTypeTextActive: {
    color: COLORS.surface,
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  savePixBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  savePixBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
    fontSize: 14,
  },
  pixDisplayBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pixTypeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  pixKeyValue: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  withdrawalCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  withdrawalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  withdrawalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  pendingBadge: {
    backgroundColor: "#FFF3E0",
  },
  pendingBadgeText: {
    color: "#E65100",
    fontSize: 10,
    fontWeight: "700",
  },
  confirmedBadge: {
    backgroundColor: "#E8F5E9",
  },
  confirmedBadgeText: {
    color: "#2E7D32",
    fontSize: 10,
    fontWeight: "700",
  },
  withdrawalKeyText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  withdrawalDateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyTransactions: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  txCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  txPassengerName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  txMethodBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  txMethodText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
  },
  txDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.xs,
  },
  txDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  txDateText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  txFeeText: {
    fontSize: 11,
    color: COLORS.warning,
    marginTop: 2,
  },
  txNetAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.large,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.caption,
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  modalInfoBox: {
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalInfoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  modalBtnRow: {
    flexDirection: "row",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  modalCancelText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textSecondary,
  },
  modalConfirmBtn: {
    flex: 1.5,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  modalConfirmText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
  },
});

export default WalletScreen;
