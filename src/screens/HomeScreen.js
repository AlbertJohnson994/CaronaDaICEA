// src/screens/HomeScreen.js
import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl, 
  TextInput, 
  ScrollView, 
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import { RideContext } from '../context/RideContext';
import RideCard from '../components/RideCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import ToastNotification from '../components/ToastNotification';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { formatDate, formatTime, openDirectWhatsApp } from '../utils/formatters';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { 
    rides, 
    loading, 
    refreshRides, 
    rideRequests, 
    createRideRequest, 
    cancelRideRequest 
  } = useContext(RideContext);
  
  const [activeTab, setActiveTab] = useState('rides'); // 'rides' | 'requests'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, women-only, today, morning, afternoon, night, available, my-rides
  const [refreshing, setRefreshing] = useState(false);

  // Mural Request Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [reqFrom, setReqFrom] = useState('Centro - Monlevade');
  const [reqTo, setReqTo] = useState('Campus ICEA UFOP');
  const [reqTime, setReqTime] = useState('Hoje às 17:30');
  const [reqMaxPrice, setReqMaxPrice] = useState('5.00');
  const [reqNotes, setReqNotes] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ visible: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRides();
    setRefreshing(false);
  };

  const filteredRides = rides.filter(ride => {
    const departure = ride.departureTime?.toDate ? ride.departureTime.toDate() : new Date(ride.departureTime);
    const hours = departure.getHours();
    const isToday = new Date().toDateString() === departure.toDateString();

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchFrom = ride.from?.toLowerCase().includes(q);
      const matchTo = ride.to?.toLowerCase().includes(q);
      const matchDriver = ride.driverName?.toLowerCase().includes(q);
      if (!matchFrom && !matchTo && !matchDriver) return false;
    }

    // 2. Chip Category Filter
    if (selectedFilter === 'women-only' && !ride.isWomenOnly) return false;
    if (selectedFilter === 'today' && !isToday) return false;
    if (selectedFilter === 'morning' && (hours < 5 || hours >= 12)) return false;
    if (selectedFilter === 'afternoon' && (hours < 12 || hours >= 18)) return false;
    if (selectedFilter === 'night' && (hours < 18 && hours >= 5)) return false;
    if (selectedFilter === 'available' && ride.availableSeats <= 0) return false;
    if (selectedFilter === 'my-rides' && ride.driverId !== user?.uid) return false;

    return true;
  });

  const filteredRequests = (rideRequests || []).filter(req => {
    if (req.status !== 'ACTIVE') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      req.from_place?.toLowerCase().includes(q) ||
      req.to_place?.toLowerCase().includes(q) ||
      req.requesterName?.toLowerCase().includes(q) ||
      req.requesterCourse?.toLowerCase().includes(q)
    );
  });

  const handleCreateRide = () => {
    if (user?.userType === 'passenger') {
      Alert.alert(
        'Perfil de Passageiro',
        'Apenas motoristas podem publicar novas caronas. Deseja atualizar seu perfil para Motorista?',
        [
          { text: 'Agora não', style: 'cancel' },
          { 
            text: 'Editar Perfil', 
            onPress: () => navigation.navigate('Profile') 
          }
        ]
      );
    } else {
      navigation.navigate('CreateRide');
    }
  };

  const handleOpenRequestModal = () => {
    setModalVisible(true);
  };

  const handleSubmitRequest = async () => {
    if (!reqFrom.trim() || !reqTo.trim()) {
      Alert.alert('Atenção', 'Informe a origem e o destino desejados.');
      return;
    }
    setSubmittingReq(true);
    const res = await createRideRequest({
      from: reqFrom.trim(),
      to: reqTo.trim(),
      desiredTime: reqTime.trim(),
      maxPrice: parseFloat(reqMaxPrice) || 5.0,
      notes: reqNotes.trim(),
    });
    setSubmittingReq(false);

    if (res.success) {
      setModalVisible(false);
      showToast('success', 'Pedido publicado no Mural de Caronas!');
      setReqNotes('');
    } else {
      Alert.alert('Erro', res.error || 'Não foi possível publicar seu pedido.');
    }
  };

  const handleCancelRequest = (requestId) => {
    Alert.alert(
      'Cancelar Pedido',
      'Deseja remover seu pedido do Mural?',
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim, Cancelar', 
          style: 'destructive',
          onPress: async () => {
            const res = await cancelRideRequest(requestId);
            if (res.success) {
              showToast('info', 'Pedido cancelado.');
            }
          }
        }
      ]
    );
  };

  const handleContactRequester = (request) => {
    const message = `Olá, ${request.requesterName}! Vi seu pedido no Mural de Caronas ICEA (${request.from_place} ➔ ${request.to_place} para ${request.desiredTime}). Sou ${user?.name} e posso te levar! Vamos combinar?`;
    openDirectWhatsApp({ phone: request.requesterPhone, message });
  };

  const renderFilterChip = (id, label, icon) => {
    const isSelected = selectedFilter === id;
    const isSpecialWomen = id === 'women-only';
    return (
      <TouchableOpacity
        style={[
          styles.chip, 
          isSelected && styles.chipActive,
          isSpecialWomen && !isSelected && styles.chipWomenOnly
        ]}
        onPress={() => setSelectedFilter(id)}
        activeOpacity={0.7}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={14}
            color={isSelected ? COLORS.surface : (isSpecialWomen ? '#9C27B0' : COLORS.textSecondary)}
            style={{ marginRight: 4 }}
          />
        ) : null}
        <Text style={[
          styles.chipText, 
          isSelected && styles.chipTextActive,
          isSpecialWomen && !isSelected && styles.chipWomenOnlyText
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRequestItem = ({ item }) => {
    const isOwn = item.requesterId === user?.uid;
    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.requestUserGroup}>
            <View style={styles.requestAvatar}>
              <Ionicons name="person" size={16} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.requestUserName}>{item.requesterName}</Text>
              <Text style={styles.requestUserCourse}>
                {item.requesterCourse || 'Estudante ICEA'}
              </Text>
            </View>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceTagLabel}>Ajuda até</Text>
            <Text style={styles.priceTagValue}>R$ {Number(item.maxPrice).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.requestRouteBox}>
          <View style={styles.routeItem}>
            <Ionicons name="ellipse" size={10} color={COLORS.primary} style={styles.routeDot} />
            <Text style={styles.routeText} numberOfLines={1}>
              <Text style={styles.routeLabel}>Origem: </Text>{item.from_place}
            </Text>
          </View>
          <View style={styles.routeItem}>
            <Ionicons name="location" size={12} color={COLORS.accent} style={styles.routeDot} />
            <Text style={styles.routeText} numberOfLines={1}>
              <Text style={styles.routeLabel}>Destino: </Text>{item.to_place}
            </Text>
          </View>
        </View>

        <View style={styles.requestMetaRow}>
          <View style={styles.metaBadge}>
            <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.metaBadgeText}>
              {typeof item.desiredTime === 'string'
                ? item.desiredTime
                : item.desiredTime?.toDate
                ? `${item.desiredTime.toDate().toLocaleDateString('pt-BR')} às ${item.desiredTime.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : String(item.desiredTime || '')}
            </Text>
          </View>
          {item.notes ? (
            <Text style={styles.notesText} numberOfLines={2}>
              "{item.notes}"
            </Text>
          ) : null}
        </View>

        <View style={styles.requestActionsRow}>
          {isOwn ? (
            <TouchableOpacity 
              style={styles.cancelRequestBtn}
              onPress={() => handleCancelRequest(item.id)}
            >
              <Ionicons name="trash-outline" size={14} color={COLORS.error} />
              <Text style={styles.cancelRequestText}>Remover Meu Pedido</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.offerRideBtn}
              onPress={() => handleContactRequester(item)}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
              <Text style={styles.offerRideBtnText}>Oferecer Carona no WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ToastNotification
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.greetingText}>Olá, {user?.name?.split(' ')[0] || 'Estudante'}</Text>
            <Text style={styles.headerTitle}>Caronas ICEA UFOP</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle" size={34} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Tab Selector: Caronas vs Mural */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === 'rides' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('rides')}
          >
            <Ionicons 
              name="car-sport" 
              size={16} 
              color={activeTab === 'rides' ? COLORS.primary : COLORS.textSecondary} 
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.segmentText, activeTab === 'rides' && styles.segmentTextActive]}>
              Ofertas ({filteredRides.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentBtn, activeTab === 'requests' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('requests')}
          >
            <Ionicons 
              name="megaphone" 
              size={15} 
              color={activeTab === 'requests' ? COLORS.primary : COLORS.textSecondary} 
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.segmentText, activeTab === 'requests' && styles.segmentTextActive]}>
              Mural de Pedidos ({filteredRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'rides' ? "Buscar caronas (ICEA, Bauxita...)" : "Buscar pedidos no mural..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textMuted}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips ScrollView (Only in Caronas Tab) */}
        {activeTab === 'rides' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContainer}
          >
            {renderFilterChip('all', 'Todas')}
            {renderFilterChip('women-only', 'Elas por Elas 🌸')}
            {renderFilterChip('available', 'Com Vagas', 'checkmark-circle-outline')}
            {renderFilterChip('today', 'Hoje', 'calendar-outline')}
            {renderFilterChip('morning', 'Manhã (05h-12h)', 'sunny-outline')}
            {renderFilterChip('afternoon', 'Tarde (12h-18h)', 'partly-sunny-outline')}
            {renderFilterChip('night', 'Noite (18h+)', 'moon-outline')}
            {(user?.userType === 'driver' || user?.userType === 'both') &&
              renderFilterChip('my-rides', 'Minhas Caronas', 'car-outline')}
          </ScrollView>
        )}
      </View>

      {/* Main Tab Content */}
      {activeTab === 'rides' ? (
        loading ? (
          <View style={styles.listContent}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlatList
            data={filteredRides}
            renderItem={({ item }) => (
              <RideCard 
                ride={item} 
                currentUserId={user?.uid}
                onPress={() => navigation.navigate('Ride', { rideId: item.id })} 
              />
            )}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon={searchQuery ? "search-outline" : "car-sport-outline"}
                title={searchQuery ? "Nenhum resultado encontrado" : "Nenhuma carona encontrada"}
                message={
                  searchQuery
                    ? `Não encontramos caronas para "${searchQuery}". Tente outro termo.`
                    : selectedFilter === 'women-only'
                    ? "Nenhuma carona 'Elas por Elas' no momento. Que tal postar uma solicitação no Mural?"
                    : "Não há caronas disponíveis que correspondam a este horário ou período."
                }
                actionLabel={(user?.userType === 'driver' || user?.userType === 'both') ? "Oferecer uma Carona" : "Pedir no Mural de Caronas"}
                onAction={(user?.userType === 'driver' || user?.userType === 'both') ? handleCreateRide : handleOpenRequestModal}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )
      ) : (
        /* Mural de Pedidos Tab */
        <FlatList
          data={filteredRequests}
          renderItem={renderRequestItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.muralBanner}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.muralBannerText}>
                Não encontrou carona no horário? Publique seu pedido e os motoristas da UFOP entram em contato com você pelo WhatsApp!
              </Text>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="megaphone-outline"
              title="Mural de Pedidos vazio"
              message="Nenhum estudante solicitou carona no momento. Seja o primeiro a pedir!"
              actionLabel="Pedir uma Carona Agora"
              onAction={handleOpenRequestModal}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Action Button */}
      {activeTab === 'rides' ? (
        (user?.userType === 'driver' || user?.userType === 'both') ? (
          <TouchableOpacity 
            style={styles.fab}
            onPress={handleCreateRide}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={26} color={COLORS.surface} />
            <Text style={styles.fabText}>Oferecer Carona</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.fab, styles.fabSecondary]}
            onPress={handleOpenRequestModal}
            activeOpacity={0.85}
          >
            <Ionicons name="megaphone-outline" size={22} color={COLORS.surface} />
            <Text style={styles.fabText}>Pedir Carona</Text>
          </TouchableOpacity>
        )
      ) : (
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleOpenRequestModal}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color={COLORS.surface} />
          <Text style={styles.fabText}>Novo Pedido</Text>
        </TouchableOpacity>
      )}

      {/* Modal: Publicar Pedido no Mural */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="megaphone" size={22} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Pedir Carona no Mural</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                Preencha os detalhes para que outros universitários vejam seu pedido e entrem em contato.
              </Text>

              <Text style={styles.inputLabel}>Origem *</Text>
              <TextInput
                style={styles.modalInput}
                value={reqFrom}
                onChangeText={setReqFrom}
                placeholder="Ex: Centro de João Monlevade"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.inputLabel}>Destino *</Text>
              <TextInput
                style={styles.modalInput}
                value={reqTo}
                onChangeText={setReqTo}
                placeholder="Ex: Campus ICEA UFOP"
                placeholderTextColor={COLORS.textMuted}
              />

              <View style={styles.inputRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Horário Desejado</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={reqTime}
                    onChangeText={setReqTime}
                    placeholder="Ex: Hoje às 17h30"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={{ width: 120 }}>
                  <Text style={styles.inputLabel}>Ajuda Máxima (R$)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={reqMaxPrice}
                    onChangeText={setReqMaxPrice}
                    keyboardType="numeric"
                    placeholder="5.00"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Observações ou Ponto Específico</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={reqNotes}
                onChangeText={setReqNotes}
                placeholder="Ex: Posso esperar no ponto da igreja matriz. Tenho mochila pequena."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity 
                style={[styles.modalSubmitBtn, submittingReq && { opacity: 0.6 }]}
                onPress={handleSubmitRequest}
                disabled={submittingReq}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.modalSubmitText}>
                  {submittingReq ? 'Publicando...' : 'Publicar no Mural'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  greetingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    color: COLORS.primary,
  },
  profileBadge: {
    padding: 2,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.sm,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  segmentText: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 6,
  },
  chipsScrollContainer: {
    paddingRight: SPACING.lg,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipWomenOnly: {
    backgroundColor: '#F3E5F5',
    borderColor: '#CE93D8',
  },
  chipWomenOnlyText: {
    color: '#8E24AA',
    fontWeight: '700',
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.surface,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 90,
    flexGrow: 1,
  },
  muralBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  muralBannerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryDark,
    fontSize: 12.5,
    flex: 1,
    lineHeight: 18,
  },
  requestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  requestUserGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  requestUserName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  requestUserCourse: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  priceTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignItems: 'flex-end',
  },
  priceTagLabel: {
    fontSize: 9,
    color: '#2E7D32',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceTagValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  requestRouteBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  routeDot: {
    marginRight: 6,
  },
  routeLabel: {
    fontWeight: '700',
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  routeText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.textPrimary,
    flex: 1,
  },
  requestMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  metaBadgeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  notesText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },
  requestActionsRow: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
  },
  offerRideBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  offerRideBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFEBEE',
    gap: 6,
  },
  cancelRequestText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    ...SHADOWS.medium,
  },
  fabSecondary: {
    backgroundColor: COLORS.accent,
  },
  fabText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
    marginLeft: 6,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '85%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.primary,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default HomeScreen;