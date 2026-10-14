// src/screens/AdminScreen.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import { 
  getUnresolvedReportsInDb, 
  getAllUsersInDb, 
  resolveReportInDb, 
  toggleUserActiveInDb,
  getAdminFinancialStatsInDb,
  fetchPendingWithdrawalsInDb,
  confirmWithdrawalInDb,
} from '../services/sqliteService';
import { formatDate, formatTime } from '../utils/formatters';
import CustomButton from '../components/CustomButton';
import ToastNotification from '../components/ToastNotification';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

const AdminScreen = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [financialStats, setFinancialStats] = useState({
    totalVolume: 0,
    totalPlatformRevenue: 0,
    totalTransactions: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('revenue'); // revenue, withdrawals, reports, users

  // Toast state
  const [toast, setToast] = useState({ visible: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'revenue') {
        const stats = await getAdminFinancialStatsInDb();
        setFinancialStats(stats);
      } else if (activeTab === 'withdrawals') {
        const wData = await fetchPendingWithdrawalsInDb();
        setWithdrawals(wData);
      } else if (activeTab === 'reports') {
        const reportsData = await getUnresolvedReportsInDb();
        setReports(reportsData);
      } else if (activeTab === 'users') {
        const usersData = await getAllUsersInDb();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      showToast('error', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (user && user.isAdmin) {
      loadData();
    }
  }, [user, activeTab, loadData]);

  const handleResolveReport = async (reportId) => {
    try {
      const result = await resolveReportInDb(reportId, user.uid);
      if (result.success) {
        showToast('success', 'Denúncia marcada como resolvida.');
        loadData();
      } else {
        showToast('error', result.error || 'Erro ao resolver denúncia.');
      }
    } catch (error) {
      showToast('error', 'Não foi possível resolver a denúncia.');
    }
  };

  const handleConfirmWithdrawal = async (withdrawalId, driverName, amount) => {
    Alert.alert(
      "Confirmar Pagamento de Saque",
      `Você confirma que efetuou a transferência Pix de R$ ${Number(amount).toFixed(2)} para ${driverName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar Pagamento",
          onPress: async () => {
            try {
              const res = await confirmWithdrawalInDb(withdrawalId, user.uid);
              if (res.success) {
                showToast('success', 'Saque confirmado e liquidado!');
                loadData();
              } else {
                showToast('error', res.error || 'Erro ao confirmar saque.');
              }
            } catch (e) {
              showToast('error', 'Erro ao processar confirmação de saque.');
            }
          }
        }
      ]
    );
  };

  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      const newActiveState = !currentActive;
      const result = await toggleUserActiveInDb(userId, newActiveState);
      if (result.success) {
        showToast('success', `Usuário ${newActiveState ? 'ativado' : 'desativado'} com sucesso.`);
        loadData();
      } else {
        showToast('error', result.error || 'Erro ao alterar status.');
      }
    } catch (error) {
      showToast('error', 'Não foi possível alterar status do usuário.');
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <View style={styles.center}>
        <Ionicons name="shield-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.accessDenied}>Acesso exclusivo para Administradores da UFOP</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ToastNotification
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'revenue' && styles.activeTab]}
          onPress={() => setActiveTab('revenue')}
        >
          <Ionicons name="cash-outline" size={16} color={activeTab === 'revenue' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'revenue' && styles.activeTabText]}>Comissões</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'withdrawals' && styles.activeTab]}
          onPress={() => setActiveTab('withdrawals')}
        >
          <Ionicons name="wallet-outline" size={16} color={activeTab === 'withdrawals' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'withdrawals' && styles.activeTabText]}>
            Saques ({withdrawals.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Ionicons name="warning-outline" size={16} color={activeTab === 'reports' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>Denúncias</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons name="people-outline" size={16} color={activeTab === 'users' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Usuários</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
          {activeTab === 'revenue' ? (
            <>
              {/* Financial Revenue Summary */}
              <View style={styles.revenueCard}>
                <Text style={styles.revenueTitle}>Receita de Comissões da Plataforma</Text>
                <Text style={styles.revenueSubtitle}>Taxa padrão de 25% cobrada por corrida intermediada</Text>

                <View style={styles.revenueMainBox}>
                  <Text style={styles.revenueLabel}>Receita Acumulada do Admin (25%)</Text>
                  <Text style={styles.revenueAmount}>
                    R$ {Number(financialStats.totalPlatformRevenue).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.revenueRow}>
                  <View style={styles.revenueSubItem}>
                    <Text style={styles.revenueSubNumber}>
                      R$ {Number(financialStats.totalVolume).toFixed(2)}
                    </Text>
                    <Text style={styles.revenueSubLabel}>Volume Bruto Total</Text>
                  </View>

                  <View style={styles.revenueSubDivider} />

                  <View style={styles.revenueSubItem}>
                    <Text style={styles.revenueSubNumber}>{financialStats.totalTransactions}</Text>
                    <Text style={styles.revenueSubLabel}>Transações Processadas</Text>
                  </View>
                </View>
              </View>

              {/* Transactions Audit Feed */}
              <Text style={styles.sectionTitle}>Extrato de Transações Financeiras</Text>

              {financialStats.transactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyStateText}>Nenhuma transação registrada no banco.</Text>
                </View>
              ) : (
                financialStats.transactions.map((tx) => (
                  <View key={tx.id} style={styles.txCard}>
                    <View style={styles.txHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.txTitle}>
                          {tx.passengerName || "Passageiro"} ➔ {tx.driverName || "Motorista"}
                        </Text>
                        <Text style={styles.txDate}>
                          {formatDate(new Date(tx.createdAt))} às {formatTime(new Date(tx.createdAt))}
                        </Text>
                      </View>
                      <View style={styles.methodBadge}>
                        <Text style={styles.methodBadgeText}>{tx.paymentMethod || "PIX"}</Text>
                      </View>
                    </View>

                    <View style={styles.txDivider} />

                    <View style={styles.txValuesRow}>
                      <Text style={styles.valGross}>Bruto: R$ {Number(tx.grossAmount).toFixed(2)}</Text>
                      <Text style={styles.valFee}>Comissão Admin (25%): +R$ {Number(tx.platformFee).toFixed(2)}</Text>
                      <Text style={styles.valNet}>Motorista (75%): R$ {Number(tx.driverNet).toFixed(2)}</Text>
                    </View>
                  </View>
                ))
              )}
            </>
          ) : activeTab === 'withdrawals' ? (
            <>
              <Text style={styles.sectionTitle}>
                Solicitações de Saque Pendentes ({withdrawals.length})
              </Text>

              {withdrawals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-done-circle-outline" size={48} color={COLORS.success} />
                  <Text style={styles.emptyStateText}>Nenhuma solicitação de saque pendente.</Text>
                </View>
              ) : (
                withdrawals.map((w) => (
                  <View key={w.id} style={styles.withdrawalCard}>
                    <View style={styles.withdrawalHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.driverNameText}>{w.driverName || 'Motorista'}</Text>
                        <Text style={styles.pixKeySubtitle}>Chave Pix: {w.pixKey}</Text>
                      </View>
                      <Text style={styles.withdrawAmountText}>R$ {Number(w.amount).toFixed(2)}</Text>
                    </View>

                    <Text style={styles.withdrawDateText}>
                      Solicitado em {formatDate(w.requestedAt || w.createdAt)} às {formatTime(w.requestedAt || w.createdAt)}
                    </Text>

                    <TouchableOpacity 
                      style={styles.confirmWithdrawBtn}
                      onPress={() => handleConfirmWithdrawal(w.id, w.driverName, w.amount)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.confirmWithdrawBtnText}>Confirmar Pagamento Realizado</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          ) : activeTab === 'reports' ? (
            <>
              <Text style={styles.sectionTitle}>
                Denúncias Pendentes ({reports.length})
              </Text>

              {reports.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.success} />
                  <Text style={styles.emptyStateText}>Nenhuma denúncia pendente no momento.</Text>
                </View>
              ) : (
                reports.map((report) => (
                  <View key={report.id} style={styles.reportCard}>
                    <Text style={styles.reportTitle}>{report.type}</Text>
                    <Text style={styles.reportDescription}>{report.description}</Text>

                    <View style={styles.reportMeta}>
                      <Text style={styles.metaText}>Por: {report.reporterName}</Text>
                      <Text style={styles.metaText}>
                        {formatDate(report.createdAt.toDate ? report.createdAt.toDate() : new Date(report.createdAt))}
                      </Text>
                    </View>

                    <CustomButton
                      title="Marcar como Resolvida"
                      onPress={() => handleResolveReport(report.id)}
                      icon="checkmark-circle-outline"
                      color={COLORS.primary}
                    />
                  </View>
                ))
              )}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                Usuários do Sistema ({users.length})
              </Text>

              {users.map((userItem) => (
                <View key={userItem.uid} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userItem.name}</Text>
                    <Text style={styles.userEmail}>{userItem.email}</Text>
                    <Text style={styles.userCourseText}>
                      🎓 {userItem.course || 'Estudante UFOP'} {userItem.studentId ? `• Matrícula: ${userItem.studentId}` : ''}
                    </Text>
                    <Text style={styles.userType}>
                      {userItem.userType === "driver"
                        ? "Motorista"
                        : userItem.userType === "both"
                        ? "Motorista & Passageiro"
                        : "Passageiro"}{" "}
                      • {userItem.isActive ? "Ativo" : "Desativado"} • Rating:{" "}
                      {userItem.rating ? Number(userItem.rating).toFixed(1) : "5.0"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.statusToggleBtn,
                      { backgroundColor: userItem.isActive ? COLORS.dangerLight : COLORS.successLight },
                    ]}
                    onPress={() => handleToggleUserStatus(userItem.uid, userItem.isActive)}
                  >
                    <Text
                      style={[
                        styles.statusToggleText,
                        { color: userItem.isActive ? COLORS.danger : COLORS.success },
                      ]}
                    >
                      {userItem.isActive ? "Desativar" : "Ativar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  accessDenied: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  revenueCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  revenueTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.surface,
  },
  revenueSubtitle: {
    ...TYPOGRAPHY.caption,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  revenueMainBox: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  revenueLabel: {
    ...TYPOGRAPHY.caption,
    color: "rgba(255, 255, 255, 0.9)",
  },
  revenueAmount: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.surface,
    marginTop: 4,
  },
  revenueRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  revenueSubItem: {
    flex: 1,
    alignItems: "center",
  },
  revenueSubNumber: {
    ...TYPOGRAPHY.h2,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  revenueSubLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  revenueSubDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyStateText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  txCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  txHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  txTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  txDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  methodBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
  },
  txDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  txValuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valGross: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  valFee: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.success,
  },
  valNet: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  withdrawalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  withdrawalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  driverNameText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  pixKeySubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  withdrawAmountText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  withdrawDateText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  confirmWithdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  confirmWithdrawBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  reportTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.danger,
    marginBottom: SPACING.xs,
  },
  reportDescription: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  reportMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  userInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  userName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  userEmail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  userCourseText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  userType: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
    fontSize: 11,
  },
  statusToggleBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  statusToggleText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: "700",
  },
});

export default AdminScreen;