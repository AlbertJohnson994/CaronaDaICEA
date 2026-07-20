// src/screens/MyRidesScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import { fetchRidesList } from '../services/sqliteService';
import RideCard from '../components/RideCard';

const MyRidesScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchRides();
  }, [user]);

  const fetchRides = async () => {
    try {
      const allRides = await fetchRidesList();
      const ridesData = allRides.filter(ride => ride.driverId === user.uid);
      
      // Sort locally
      ridesData.sort((a, b) => {
        const timeA = a.departureTime?.toDate ? a.departureTime.toDate() : new Date(a.departureTime);
        const timeB = b.departureTime?.toDate ? b.departureTime.toDate() : new Date(b.departureTime);
        return timeB - timeA; // Descending order (newest first)
      });
      
      setRides(ridesData);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching rides:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRides();
  };

  const handleCreateRide = () => {
    navigation.navigate('CreateRide');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rides}
        renderItem={({ item }) => (
          <RideCard 
            ride={item} 
            onPress={() => navigation.navigate('Ride', { rideId: item.id })} 
          />
        )}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              Você ainda não ofereceu nenhuma carona
            </Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateRide}
            >
              <Text style={styles.createButtonText}>Oferecer Primeira Carona</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleCreateRide}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
    flexGrow: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontSize: 16
  },
  createButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  }
});

export default MyRidesScreen;