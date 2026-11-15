// App.js
import React from 'react';
import { StatusBar, Platform, Alert } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { RideProvider } from './src/context/RideContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

// Polyfill Alert.alert on Web / Desktop so confirmation & callback dialogs work reliably
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  Alert.alert = (title, message, buttons) => {
    const fullText = [title, message].filter(Boolean).join('\n\n');
    if (!buttons || buttons.length === 0) {
      window.alert(fullText);
      return;
    }
    if (buttons.length === 1) {
      if (typeof buttons[0].onPress === 'function') {
        buttons[0].onPress();
      } else {
        window.alert(fullText);
      }
      return;
    }
    const cancelBtn = buttons.find((b) => b.style === 'cancel') || buttons[0];
    const actionBtn =
      buttons.find((b) => b.style === 'destructive') ||
      buttons.find((b) => b.style !== 'cancel') ||
      buttons[buttons.length - 1];
    const confirmed = window.confirm(fullText);
    if (confirmed) {
      if (actionBtn && typeof actionBtn.onPress === 'function') {
        actionBtn.onPress();
      }
    } else if (cancelBtn && typeof cancelBtn.onPress === 'function') {
      cancelBtn.onPress();
    }
  };
}

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
