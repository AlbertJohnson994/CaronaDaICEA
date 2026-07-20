// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import RideScreen from '../screens/RideScreen';
import CreateRideScreen from '../screens/CreateRideScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';
import RatingScreen from '../screens/RatingScreen';
import MyRideScreen from '../screens/MyRideScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import WalletScreen from '../screens/WalletScreen';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  const { user } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyRides') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'WalletTab') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'shield' : 'shield-outline';
          }

          return <Ionicons name={iconName || 'help-circle'} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Caronas',
          headerShown: false
        }} 
      />
      
      {(user?.userType === 'driver' || user?.userType === 'both') && (
        <Tab.Screen 
          name="MyRides" 
          component={MyRideScreen} 
          options={{ 
            title: 'Minhas Caronas',
            headerShown: false
          }} 
        />
      )}

      <Tab.Screen 
        name="WalletTab" 
        component={WalletScreen} 
        options={{ 
          title: 'Carteira',
          headerShown: false
        }} 
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Perfil',
          headerShown: false
        }} 
      />
      
      {user && user.isAdmin && (
        <Tab.Screen 
          name="Admin" 
          component={AdminScreen} 
          options={{ 
            title: 'Admin',
            headerShown: false
          }} 
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.surface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }} 
          />
        ) : (
          <>
            <Stack.Screen 
              name="HomeTabs" 
              component={HomeTabs} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Ride" 
              component={RideScreen} 
              options={{ title: 'Detalhes da Carona' }} 
            />
            <Stack.Screen 
              name="CreateRide" 
              component={CreateRideScreen} 
              options={{ title: 'Oferecer Carona' }} 
            />
            <Stack.Screen 
              name="Wallet" 
              component={WalletScreen} 
              options={{ title: 'Carteira & Finanças' }} 
            />
            <Stack.Screen 
              name="Rating" 
              component={RatingScreen} 
              options={{ title: 'Avaliar Corrida' }} 
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen} 
              options={{ title: 'Editar Perfil' }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}