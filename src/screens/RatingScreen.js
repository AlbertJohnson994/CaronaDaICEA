// src/screens/RatingScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import { 
  getRideByIdInDb, 
  getUserProfileInDb, 
  submitRatingInDb 
} from '../services/sqliteService';
import RatingModal from '../components/RatingModal';
import CustomButton from '../components/CustomButton';

const RatingScreen = ({ route, navigation }) => {
  const { rideId } = route.params;
  const { user } = useContext(AuthContext);
  
  const [ride, setRide] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [ratedUsers, setRatedUsers] = useState(new Set());

  useEffect(() => {
    const loadRideData = async () => {
      try {
        // Carregar dados da corrida
        const rideData = await getRideByIdInDb(rideId);
        if (!rideData) {
          Alert.alert('Erro', 'Corrida não encontrada');
          navigation.goBack();
          return;
        }

        setRide(rideData);

        // Carregar dados dos passageiros
        const passengerPromises = rideData.passengers.map(async (passengerId) => {
          const profile = await getUserProfileInDb(passengerId);
          return profile 
            ? { id: profile.uid, ...profile } 
            : null;
        });

        const passengerData = (await Promise.all(passengerPromises)).filter(Boolean);
        setPassengers(passengerData);

      } catch (error) {
        console.error('Error loading ride data:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados da corrida');
      } finally {
        setLoading(false);
      }
    };

    loadRideData();
  }, [rideId, navigation]);

  const handleRateUser = (user) => {
    setSelectedUser(user);
    setRatingModalVisible(true);
  };

  const handleSubmitRating = async (ratingData) => {
    try {
      // submitRatingInDb handles updating both the user profile and the ride database rows
      const result = await submitRatingInDb(ratingData, user.uid, user.name);

      if (result.success) {
        // Marcar usuário como avaliado using their UID (id)
        setRatedUsers(prev => new Set([...prev, ratingData.ratedUserId]));
        Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível enviar a avaliação');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Erro', 'Não foi possível enviar a avaliação');
    }
  };

  const handleCompleteRating = () => {
    Alert.alert(
      'Avaliação Concluída',
      'Obrigado por avaliar todos os passageiros!',
      [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.center}>
        <Text>Corrida não encontrada</Text>
      </View>
    );
  }

  const allRated = passengers.length > 0 && 
                   passengers.every(passenger => ratedUsers.has(passenger.id));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="star" size={40} color="#FFD700" />
        <Text style={styles.title}>Avaliar Corrida</Text>
        <Text style={styles.subtitle}>
          {ride.from} → {ride.to}
        </Text>
        <Text style={styles.date}>
          {ride.departureTime.toDate().toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Passageiros para Avaliar</Text>
        
        {passengers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>Nenhum passageiro nesta corrida</Text>
          </View>
        ) : (
          passengers.map(passenger => (
            <View key={passenger.id} style={styles.passengerCard}>
              <View style={styles.passengerInfo}>
                <Ionicons name="person-circle-outline" size={40} color="#666" />
                <View style={styles.passengerDetails}>
                  <Text style={styles.passengerName}>{passenger.name}</Text>
                  <Text style={styles.passengerRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    {passenger.rating ? passenger.rating.toFixed(1) : 'N/A'}
                  </Text>
                </View>
              </View>
              
              {ratedUsers.has(passenger.id) ? (
                <View style={styles.ratedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.ratedText}>Avaliado</Text>
                </View>
              ) : (
                <CustomButton
                  title="Avaliar"
                  onPress={() => handleRateUser(passenger)}
                  icon="star-outline"
                  style={styles.rateButton}
                />
              )}
            </View>
          ))
        )}
      </View>

      {allRated && (
        <View style={styles.completeSection}>
          <Ionicons name="checkmark-done-circle" size={48} color="#4CAF50" />
          <Text style={styles.completeText}>Todos os passageiros avaliados!</Text>
          <CustomButton
            title="Concluir"
            onPress={handleCompleteRating}
            icon="checkmark-circle-outline"
          />
        </View>
      )}

      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={(data) => handleSubmitRating({ ...data, ratedUserId: selectedUser?.id })}
        userName={selectedUser?.name}
        rideId={rideId}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: '#999',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  passengerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  passengerDetails: {
    marginLeft: 15,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  passengerRating: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 15,
  },
  ratedText: {
    marginLeft: 5,
    color: '#4CAF50',
    fontWeight: '500',
  },
  rateButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  completeSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  completeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 15,
    textAlign: 'center',
  },
});

export default RatingScreen;