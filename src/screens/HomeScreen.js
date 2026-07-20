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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import { RideContext } from '../context/RideContext';
import RideCard from '../components/RideCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import ToastNotification from '../components/ToastNotification';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { rides, loading, refreshRides } = useContext(RideContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, today, morning, afternoon, night, available, my-rides
  const [refreshing, setRefreshing] = useState(false);

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

    // 1. Search Query Filter (Origin / Destination / Driver Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchFrom = ride.from?.toLowerCase().includes(q);
      const matchTo = ride.to?.toLowerCase().includes(q);
      const matchDriver = ride.driverName?.toLowerCase().includes(q);
      if (!matchFrom && !matchTo && !matchDriver) return false;
    }

    // 2. Chip Category Filter
    if (selectedFilter === 'today' && !isToday) return false;
    if (selectedFilter === 'morning' && (hours < 5 || hours >= 12)) return false;
    if (selectedFilter === 'afternoon' && (hours < 12 || hours >= 18)) return false;
    if (selectedFilter === 'night' && (hours < 18 && hours >= 5)) return false;
    if (selectedFilter === 'available' && ride.availableSeats <= 0) return false;
    if (selectedFilter === 'my-rides' && ride.driverId !== user?.uid) return false;

    return true;
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

  const renderFilterChip = (id, label, icon) => {
    const isSelected = selectedFilter === id;
    return (
      <TouchableOpacity
        style={[styles.chip, isSelected && styles.chipActive]}
        onPress={() => setSelectedFilter(id)}
        activeOpacity={0.7}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={14}
            color={isSelected ? COLORS.surface : COLORS.textSecondary}
            style={{ marginRight: 4 }}
          />
        ) : null}
        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
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

      {/* Top Header & Search Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.greetingText}>Olá, {user?.name?.split(' ')[0] || 'Estudante'}</Text>
            <Text style={styles.headerTitle}>Encontre sua Carona ICEA</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por origem ou destino (ex: ICEA, Centro)"
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

        {/* Filter Chips ScrollView */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContainer}
        >
          {renderFilterChip('all', 'Todas')}
          {renderFilterChip('available', 'Com Vagas', 'checkmark-circle-outline')}
          {renderFilterChip('today', 'Hoje', 'calendar-outline')}
          {renderFilterChip('morning', 'Manhã (05h-12h)', 'sunny-outline')}
          {renderFilterChip('afternoon', 'Tarde (12h-18h)', 'partly-sunny-outline')}
          {renderFilterChip('night', 'Noite (18h+)', 'moon-outline')}
          {(user?.userType === 'driver' || user?.userType === 'both') &&
            renderFilterChip('my-rides', 'Minhas Caronas', 'car-outline')}
        </ScrollView>
      </View>

      {/* Main Feed */}
      {loading ? (
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
              title={searchQuery ? "Nenhum resultado encontrado" : "Nenhuma carona para os filtros selecionados"}
              message={
                searchQuery
                  ? `Não encontramos caronas para "${searchQuery}". Tente outro termo.`
                  : "Não há caronas disponíveis que correspondam a este horário ou período."
              }
              actionLabel={(user?.userType === 'driver' || user?.userType === 'both') ? "Oferecer uma Carona" : null}
              onAction={handleCreateRide}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Action Button (FAB) */}
      {(user?.userType === 'driver' || user?.userType === 'both') && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleCreateRide}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color={COLORS.surface} />
          <Text style={styles.fabText}>Criar Carona</Text>
        </TouchableOpacity>
      )}
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
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  greetingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 19,
    color: COLORS.primary,
  },
  profileBadge: {
    padding: 2,
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
    marginBottom: SPACING.md,
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
  fabText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.surface,
    marginLeft: 6,
    fontSize: 14,
  },
});

export default HomeScreen;