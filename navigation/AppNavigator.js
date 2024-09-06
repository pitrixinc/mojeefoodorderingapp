import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import VendorSignupScreen from '../screens/VendorSignupScreen';

import BuyerDashboard from '../screens/buyer/BuyerDashboard';

import AdminDashboard from '../screens/admin/AdminDashboard';

import VendorDashboard from '../screens/vendor/VendorDashboard'

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Onboarding">
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }} 
       // options={{ title: 'Login' }}
      />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VendorSignup" component={VendorSignupScreen} options={{ headerShown: false }}  /* options={{ title: 'Vendor Signup' }} */ />
      {/* Buyer Portal */}
      <Stack.Screen name="BuyerDashboard" component={BuyerDashboard} options={{ headerShown: false }} />
      {/* Vendor Portal */}
      <Stack.Screen name="VendorDashboard" component={VendorDashboard} options={{ headerShown: false }} />
      {/* Admin Portal */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
