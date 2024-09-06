import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig'; // Import Firebase config
import BuyerProfile from './BuyerProfile'; 
import RestaurantsDiscovery from './RestaurantsDiscovery';
import Orders from './Orders';
//import TrackMedication from './TrackMedication';
import BuyerHome from './BuyerHome';

const Tab = createBottomTabNavigator();

export default function BuyerDashboard() {
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid)); 
        if (userDoc.exists()) {
          setProfileImage(userDoc.data().profileImage);
        }
      }
    };

    fetchProfileImage();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Profile' && profileImage) {
            return (
              <Image
                source={{ uri: profileImage }}
                style={{ width: size, height: size, borderRadius: size / 2 }}
              />
            );
          }

          let iconName;
          switch (route.name) {
            case 'Buyer Home':
              iconName = 'home-outline';
              break;
            case 'Restaurants Discovery':
              iconName = 'storefront-outline';
              break;
            case 'Orders':
              iconName = 'fast-food-outline';
              break;
            default:
              iconName = 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Buyer Home" component={BuyerHome} />
      <Tab.Screen name="Restaurants Discovery" component={RestaurantsDiscovery} />
      <Tab.Screen name="Orders" component={Orders} />
      <Tab.Screen name="Profile" component={BuyerProfile} />
    </Tab.Navigator>
  );
}
