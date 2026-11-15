// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { RideProvider } from './src/context/RideContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RideProvider>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </RideProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}