// src/context/RideContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  subscribeToRides, 
  createRideInDb, 
  cancelRideInDb,
  startRideWithPinInDb,
  notifyRidesChanged
} from '../services/sqliteService';
import { AuthContext } from './AuthContext';

export const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [rides, setRides] = useState([]);
  const [allRidesList, setAllRidesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      setRides([]);
      setAllRidesList([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Subscribe reactively to all SQLite ride changes
    const unsubscribe = subscribeToRides((allRides) => {
      setAllRidesList(allRides);
      const now = new Date();
      
      // Filter active rides for general feed:
      // - departureTime >= now
      // - not cancelled & not completed
      // - ordered by departureTime asc
      const activeRides = allRides
        .filter(ride => {
          const departure = ride.departureTime.toDate();
          return departure >= now && !ride.cancelled && !ride.completed;
        })
        .sort((a, b) => a.departureTime.toDate() - b.departureTime.toDate());

      setRides(activeRides);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const refreshRides = async () => {
    setLoading(true);
    await notifyRidesChanged();
  };

  const createRide = async (rideData) => {
    try {
      const result = await createRideInDb(
        rideData,
        user.uid,
        user.name,
        user.rating || 0
      );

      if (result.success) {
        return { success: true, id: result.id, startPin: result.startPin };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error creating ride in context:', error);
      return { success: false, error: error.message };
    }
  };

  const startRideWithPin = async (rideId, pin) => {
    try {
      const result = await startRideWithPinInDb(rideId, pin);
      return result;
    } catch (error) {
      console.error('Error starting ride with PIN:', error);
      return { success: false, error: error.message };
    }
  };

  const cancelRide = async (rideId) => {
    try {
      const result = await cancelRideInDb(rideId);
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error cancelling ride in context:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <RideContext.Provider value={{
      rides,
      allRidesList,
      loading,
      refreshRides,
      createRide,
      startRideWithPin,
      cancelRide
    }}>
      {children}
    </RideContext.Provider>
  );
};