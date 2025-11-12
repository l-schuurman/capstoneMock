import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './contexts/AuthContext';
import RootNavigator from './navigation/RootNavigator';

/**
 * Team D Standalone Mobile App
 *
 * This is the standalone version of Team D's mobile app for independent development.
 * It includes its own navigation, authentication, and screens.
 *
 * For library mode (consumed by mobile-shell), see ../src/index.ts
 */
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
