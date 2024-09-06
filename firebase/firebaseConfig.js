// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiDd-BKaQrLFvhkgjb1MKNvdDGQFWOK88",
  authDomain: "mojeefoodorderingmobileapp.firebaseapp.com",
  projectId: "mojeefoodorderingmobileapp",
  storageBucket: "mojeefoodorderingmobileapp.appspot.com",
  messagingSenderId: "966949427175",
  appId: "1:966949427175:web:ea2fb61a580f8c34c74f42"
};

  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
