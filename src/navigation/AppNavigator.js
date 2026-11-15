// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import CampusConnectScreen from '../screens/CampusConnectScreen';
import RideScreen from '../screens/RideScreen';
import CreateRideScreen from '../screens/CreateRideScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';
import RatingScreen from '../screens/RatingScreen';
import MyRideScreen from '../screens/MyRideScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import WalletScreen from '../screens/WalletScreen';
import UfopLogo, { openUfopUrl } from '../components/UfopLogo';
import { COLORS, RADIUS, SHADOWS, UFOP_LINKS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  const { user } = useContext(AuthContext);
  const { t, deviceMode } = useLanguage();
  const isDesktop = deviceMode === 'desktop';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'car-sport' : 'car-sport-outline';
          } else if (route.name === 'CampusConnect') {
            iconName = focused ? 'cube' : 'cube-outline';
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
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 2,
          borderTopColor: COLORS.accent,
          height: isDesktop ? 62 : 58,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontWeight: '800',
          fontSize: isDesktop ? 12 : 11,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('tabRides'),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="CampusConnect"
        component={CampusConnectScreen}
        options={{
          title: t('tabCampusConnect'),
          headerShown: false,
        }}
      />

      {(user?.userType === 'driver' || user?.userType === 'both') && (
        <Tab.Screen
          name="MyRides"
          component={MyRideScreen}
          options={{
            title: t('tabMyRides'),
            headerShown: false,
          }}
        />
      )}

      <Tab.Screen
        name="WalletTab"
        component={WalletScreen}
        options={{
          title: t('tabWallet'),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('tabProfile'),
          headerShown: false,
        }}
      />

      {user && user.isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            title: t('tabAdmin'),
            headerShown: false,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);
  const { lang, toggleLang, deviceMode, toggleDeviceMode, t } = useLanguage();
  const isDesktop = deviceMode === 'desktop';
  const isPt = lang !== 'en';

  if (loading) {
    return null;
  }

  return (
    <View style={styles.rootShell}>
      {/* Global UFOP Institutional Desktop / Mobile & Portal Bar when logged in */}
      {user && (
        <View style={styles.globalUfopBar}>
          <UfopLogo size="sm" light showSubtitle={false} />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.globalLinksRow}
          >
            <TouchableOpacity
              style={styles.portalLinkChip}
              onPress={() => openUfopUrl(UFOP_LINKS.portal)}
            >
              <Ionicons name="globe-outline" size={13} color="#F3E5AB" />
              <Text style={styles.portalLinkText}>ufop.br</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.portalLinkChip}
              onPress={() => openUfopUrl(UFOP_LINKS.minhaUfop)}
            >
              <Ionicons name="school-outline" size={13} color="#F3E5AB" />
              <Text style={styles.portalLinkText}>Minha UFOP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.portalLinkChip}
              onPress={() => openUfopUrl(UFOP_LINKS.sketchfab3dPage)}
            >
              <Ionicons name="cube-outline" size={13} color="#F3E5AB" />
              <Text style={styles.portalLinkText}>3D UFOP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deviceSwitchBtn} onPress={toggleDeviceMode}>
              <Ionicons
                name={isDesktop ? 'desktop-outline' : 'phone-portrait-outline'}
                size={13}
                color={COLORS.primaryDark}
              />
              <Text style={styles.deviceSwitchText}>
                {isDesktop
                  ? isPt
                    ? '🖥️ Desktop App (Mudar p/ Mobile)'
                    : '🖥️ Desktop App (Switch to Mobile)'
                  : isPt
                  ? '📱 Mobile App (Mudar p/ Desktop)'
                  : '📱 Mobile App (Switch to Desktop)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.langSwitchBtn} onPress={toggleLang}>
              <Text style={styles.langSwitchText}>
                {lang === 'pt' ? '🇧🇷 PT | EN' : '🇬🇧 EN | PT'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Responsive Frame: Full Widescreen Desktop App OR Authentic Mobile Frame */}
      <View style={[styles.viewportOuter, user && !isDesktop && styles.mobileOuterBg]}>
        <View style={[styles.appFrame, user && !isDesktop && styles.mobilePhoneFrame]}>
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
                    options={{ title: t('stackRideDetails') }}
                  />
                  <Stack.Screen
                    name="CreateRide"
                    component={CreateRideScreen}
                    options={{ title: t('stackCreateRide') }}
                  />
                  <Stack.Screen
                    name="Wallet"
                    component={WalletScreen}
                    options={{ title: t('stackWallet') }}
                  />
                  <Stack.Screen
                    name="Rating"
                    component={RatingScreen}
                    options={{ title: t('stackRating') }}
                  />
                  <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                    options={{ title: t('stackEditProfile') }}
                  />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootShell: {
    flex: 1,
    backgroundColor: '#1E1417',
  },
  globalUfopBar: {
    backgroundColor: COLORS.primaryDark,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  globalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portalLinkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginRight: 6,
  },
  portalLinkText: {
    color: '#F3E5AB',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
  },
  deviceSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginRight: 6,
  },
  deviceSwitchText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 5,
  },
  langSwitchBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  langSwitchText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '900',
  },
  viewportOuter: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mobileOuterBg: {
    backgroundColor: '#1A0D11',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  appFrame: {
    flex: 1,
    width: '100%',
  },
  mobilePhoneFrame: {
    maxWidth: 430,
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: COLORS.accent,
    ...SHADOWS.large,
  },
});
