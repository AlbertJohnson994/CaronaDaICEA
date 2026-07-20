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
  getAdminFinancialStatsInDb
} from '../services/sqliteService';
import { formatDate, formatTime } from '../utils/formatters';
import CustomButton from '../components/CustomButton';
import ToastNotification from '../components/ToastNotification';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

const AdminScreen = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [financialStats, setFinancialStats] = useState({
    totalVolume: 0,
    totalPlatformRevenue: 0,
    totalTransactions: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('revenue'); // revenue, reports, users

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
          <Ionicons name="cash-outline" size={18} color={activeTab === 'revenue' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'revenue' && styles.activeTabText]}>Comissões (10%)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <Ionicons name="warning-outline" size={18} color={activeTab === 'reports' ? COLORS.primary : COLORS.textMuted} />
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>Denúncias</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons name="people-outline" size={18} color={activeTab === 'users' ? COLORS.primary : COLORS.textMuted} />
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
                <Text style={styles.revenueSubtitle}>Taxa padrão de 10% cobrada por corrida intermediada</Text>

                <View style={styles.revenueMainBox}>
                  <Text style={styles.revenueLabel}>Receita Acumulada do Admin (10%)</Text>
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
                      <Text style={styles.valFee}>Comissão Admin (10%): +R$ {Number(tx.platformFee).toFixed(2)}</Text>
                      <Text style={styles.valNet}>Motorista (90%): R$ {Number(tx.driverNet).toFixed(2)}</Text>
                    </View>
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
                        {formatDate(report.createdAt.toDate())}
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
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    fontSize: 17,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  revenueCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
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
    marginBottom: SPACING.md,
  },
  revenueMainBox: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
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
    color: COLORS.warning,
    marginTop: 4,
  },
  revenueRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  revenueSubItem: {
    flex: 1,
    alignItems: "center",
  },
  revenueSubDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  revenueSubNumber: {
    ...TYPOGRAPHY.h3,
    fontSize: 15,
    color: COLORS.primary,
  },
  revenueSubLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    padding: SPACING.xxl,
  },
  emptyStateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  txCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  txHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  txDate: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  methodBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  methodBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.accent,
  },
  txDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  txValuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  valGross: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  valFee: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.warning,
  },
  valNet: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.success,
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
    fontSize: 16,
    color: COLORS.danger,
    marginBottom: SPACING.xs,
  },
  reportDescription: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  reportMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  userEmail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  userType: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  statusToggleText: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
  },
});

export default AdminScreen;