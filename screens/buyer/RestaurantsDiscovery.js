import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, Image, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs, getDoc, doc, addDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const RestaurantsDiscovery = () => {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFoodModalVisible, setIsFoodModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [userDetails, setUserDetails] = useState({});

 // Get user data from Firebase Auth
 const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserDetails(userDoc.data());
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const q = query(
      collection(db, 'users'),
      where('userType', '==', 'vendor'),
      where('status', '==', 'approved')
    );

    const querySnapshot = await getDocs(q);
    const vendorsList = [];

    for (const doc of querySnapshot.docs) {
      const vendorData = doc.data();
      const foodsQuery = query(
        collection(db, 'foods'),
        where('vendorId', '==', doc.id),
        where('status', '==', 'approved')
      );
      const foodsSnapshot = await getDocs(foodsQuery);
      vendorData.foodCount = foodsSnapshot.size;
      vendorsList.push({ id: doc.id, ...vendorData });
    }

    // Randomize vendor list
    setVendors(vendorsList.sort(() => 0.5 - Math.random()));
    setFilteredVendors(vendorsList);
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (text) {
      const filtered = vendors.filter((vendor) =>
        vendor.fullName.toLowerCase().includes(text.toLowerCase()) ||
        vendor.location.toLowerCase().includes(text.toLowerCase()) ||
        vendor.email.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors(vendors);
    }
  };

  const handleVendorClick = async (vendor) => {
    setSelectedVendor(vendor);
    const foodsQuery = query(
      collection(db, 'foods'),
      where('vendorId', '==', vendor.id),
      where('status', '==', 'approved')
    );
    const foodsSnapshot = await getDocs(foodsQuery);
    
    // Map the foods to include the document ID
    const foodsList = foodsSnapshot.docs.map((doc) => ({
      id: doc.id,  // Include the document ID here
      ...doc.data(),
    }));
  
    setFoodItems(foodsList);
    setIsModalVisible(true);
  };

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setIsFoodModalVisible(true);
  };

  const handleOrderNow = async () => {
    const orderData = {
      foodId: selectedFood.id,
      name: selectedFood.name,
      image: selectedFood.imageUrl,
      price: selectedFood.price,
      buyerId: user.uid,
      buyerName: userDetails.fullName,
      buyerProfileImage: userDetails.profileImage,
      vendorId: selectedFood.vendorId,
      vendorName: selectedFood.vendorName,
      vendorProfileImage: selectedFood.vendorProfileImage,
      status: 'pending',
      createdAt: new Date().toDateString(),
    };
    // Add the order to the "orders" collection in Firestore
    await addDoc(collection(db, 'orders'), orderData);
    Alert.alert('success', 'order placed successfully');
    setIsFoodModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vendors by name, location, or email..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.vendorList}>
        {filteredVendors.map((vendor) => (
          <TouchableOpacity
            key={vendor.id}
            style={styles.vendorCard}
            onPress={() => handleVendorClick(vendor)}
          >
            <Image source={{ uri: vendor.profileImage }} style={styles.vendorImage} />
            <Text style={styles.vendorName}>{vendor.RestaurantName || vendor.fullName}</Text>
            <Text style={styles.vendorLocation}>{vendor.location}</Text>
            <Text style={styles.foodCount}>{vendor.foodCount} Food Items</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Vendor Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{selectedVendor?.RestaurantName || selectedVendor?.fullName}</Text>
          <ScrollView contentContainerStyle={styles.foodList}>
            {foodItems.length === 0 ? (
              <Text style={styles.noFoodText}>Vendor Has no food</Text>
            ) : (
              foodItems.map((food, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.foodCard}
                  onPress={() => handleFoodClick(food)}
                >
                  <Image source={{ uri: food.imageUrl }} style={styles.foodImage} />
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodPrice}>GHS{food.price}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Food Item Modal */}
      <Modal
        visible={isFoodModalVisible}
        animationType="slide"
        onRequestClose={() => setIsFoodModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Image source={{ uri: selectedFood?.imageUrl }} style={styles.foodDetailImage} />
          <Text style={styles.foodDetailName}>{selectedFood?.name}</Text>
          <Text>{selectedFood?.description}</Text>
          <Text style={styles.foodDetailPrice}>GHS{selectedFood?.price}</Text>
          <TouchableOpacity
            style={styles.orderButton}
            onPress={handleOrderNow}
          >
            <Text style={styles.orderButtonText}>Order Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFoodModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFDBBB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    backgroundColor: '#d3d3d3',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
  },
  vendorList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vendorCard: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  vendorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  vendorLocation: {
    fontSize: 14,
    color: '#666',
  },
  foodCount: {
    fontSize: 12,
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFDBBB',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  foodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodCard: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodPrice: {
    fontSize: 14,
    color: '#666',
  },
  noFoodText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
  },
  closeButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodDetailImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  foodDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  foodDetailPrice: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  orderButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RestaurantsDiscovery;
