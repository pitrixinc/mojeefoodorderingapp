// /screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ImageBackground, Alert } from 'react-native';
import {  signInWithEmailAndPassword, signOut  } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Check if the user's email is verified
      if (!user.emailVerified) {
        await signOut(auth);  // Make sure user is signed out
       // navigation.navigate('Signup');
        Alert.alert(
          'Email Not Verified',
          'Please verify your email before logging in.'
        );
        setLoading(false); // Stop loading here as well
        return; // Stop any further code execution, including navigation
      }
  
      // User's email is verified, continue with navigation to dashboard
      const userId = user.uid;
  
      // Retrieve user details from Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (user.emailVerified && userDoc.exists()) {
        const userType = userDoc.data().userType;
  
        // Navigate to the appropriate dashboard based on userType
        if (userType === 'buyer') {
          navigation.navigate('BuyerDashboard');
        } else if (userType === 'vendor') {
          navigation.navigate('VendorDashboard');
        }
        /* else if (userType === 'admin') {
          navigation.navigate('AdminDashboard');
        } */
      } else {
        console.error('No such user document!');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <ImageBackground 
    source={require('../assets/images/background2.jpg')} // replace with your background image path
    style={styles.backgroundImage}
  >
    <View style={styles.overlay}>
      <View style={styles.glassContainer}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
        <Text style={styles.title}>Login</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('VendorSignup')}>
          <Text style={styles.signupText}>Start Selling? Sign up as vendor</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ImageBackground>
);
}

const styles = StyleSheet.create({
backgroundImage: {
  flex: 1,
  resizeMode: 'cover',
  justifyContent: 'center',
  padding: 20,
},
overlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darkens the image slightly
},
glassContainer: {
  width: '90%',
  padding: 20,
  borderRadius: 15,
  borderColor: 'rgba(0, 0, 0, 0.4)',
  borderWidth: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent background for the glass effect
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.3,
  shadowRadius: 15,
  elevation: 10,
},
title: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 20,
  color: '#fff', // Ensure text is readable against the background
},
input: {
  width: '100%',
  padding: 15,
  marginVertical: 10,
  backgroundColor: '#f1f1f1',
  borderRadius: 8,
},
button: {
  backgroundColor: '#007BFF',
  padding: 15,
  borderRadius: 8,
  width: '100%',
  alignItems: 'center',
},
buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
signupText: {
  marginTop: 15,
  color: '#fff',
},
logo: {
  width: 120,
  height: 120,
  marginBottom: 30,
},
});