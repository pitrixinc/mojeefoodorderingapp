import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
  Button,
  FlatList,
} from 'react-native';
import { addDoc, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import {  signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Add this to handle navigation

export default function BuyerHome() {
  const [greeting, setGreeting] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [foodItems, setFoodItems] = useState([]);
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [orders, setOrders] = useState([]);

  // Get user data from Firebase Auth
  const user = auth.currentUser;
  const navigation = useNavigation(); // Hook to handle navigation

  useEffect(() => {
    // Check if user exists and is verified
    const checkUser = async () => {
      const user = auth.currentUser;

      if (!user || !user.emailVerified) {
        // If user does not exist or email is not verified, navigate to login
        navigation.navigate('Login');
      } else {
        // Fetch user data if verified
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserDetails(userDoc.data());
        }
      }
    };

    checkUser();
  }, []);

  const firstName = userDetails?.fullName?.split(' ')[0];

  useEffect(() => {
    // Set greeting based on time of day
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good Morning');
    else if (hours < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    // Fetch approved food items from Firebase
    const fetchFoodItems = async () => {
      const q = query(collection(db, 'foods'), where('status', '==', 'approved'));
      const querySnapshot = await getDocs(q);
      const foodList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Shuffle the food items for randomness
      const shuffledFoodList = foodList.sort(() => Math.random() - 0.5);
      setFoodItems(shuffledFoodList);
      setFilteredFoodItems(shuffledFoodList);
    };
    fetchFoodItems();
  }, []);
  

  useEffect(() => {
    // Filter food items based on search query and category
    const filtered = foodItems.filter((item) => {
      const matchesSearchQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.price.toString().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        category === 'all' || item.category.toLowerCase() === category.toLowerCase();
      return matchesSearchQuery && matchesCategory;
    });
    setFilteredFoodItems(filtered);
  }, [searchQuery, category, foodItems]);

  useEffect(() => {
    // Fetch orders for the current user
    const fetchOrders = async () => {
      const q = query(collection(db, 'orders'), where('buyerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList);
    };
    fetchOrders();
  }, []);

  const handleOrder = async () => {
    try {
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
      await addDoc(collection(db, 'orders'), orderData);
      alert('Order placed successfully!');
      setModalVisible(false);
    } catch (error) {
      console.error('Error placing order: ', error);
      alert('Failed to place order. Please try again.');
    }
  };

  


  return (
    <ScrollView style={styles.container}>
      {/* Greeting Section */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>{`${greeting}, ${firstName}`}</Text>
        <TouchableOpacity onPress={() => setCartModalVisible(true)}>
          <Ionicons name="cart-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      
      {/* Search Section */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={24} color="black" />
      </View>

      {/* Popular Foods Section */}
<View style={styles.popularFoodsContainer}>
  <Text style={styles.sectionTitle}>Popular Foods</Text>
  {filteredFoodItems.length > 0 ? (
    <FlatList
      data={filteredFoodItems.slice(0, 5)} // Limit to first 5 items for the banner
      renderItem={({ item }) => (
        <TouchableOpacity
        style={styles.popularFoodItem}
        onPress={() => {
          setSelectedFood(item);
          setModalVisible(true);
        }}
      >
          <Image source={{ uri: item.imageUrl }} style={styles.popularFoodImage} />
          <Text style={styles.popularFoodName}>{item.name.length > 9 ? item.name.slice(0, 9) + '...' : item.name}</Text>
        </TouchableOpacity>
      )}
      horizontal
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      style={styles.popularFoodsList}
    />
  ) : (
    <Text style={styles.noFoodText}>No food item</Text>
  )}
</View>



      {/* Category Tabs Section */}
      <ScrollView horizontal style={styles.tabsContainer}>
        {[
          'all',
          'breakfast',
          'lunch',
          'dessert',
          'wine',
          'starters',
          'snacks',
          'smoothies',
          'pizza',
          'burger',
          'local',
          'continental',
          'oriental',
        ].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.tab,
              category === cat && styles.activeTab,
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.tabText,
                category === cat && styles.activeTabText,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Food Items Section */}
<View style={styles.foodItemsContainer}>
  {filteredFoodItems.map((food) => (
    <TouchableOpacity
      key={food.id}
      style={styles.foodCard}
      onPress={() => {
        setSelectedFood(food);
        setModalVisible(true);
      }}
    >
      <Image source={{ uri: food.imageUrl }} style={styles.foodImage} />
      <View style={styles.overlay}>
        <Text style={styles.foodName}>{food.name.length > 9 ? food.name.slice(0, 9) + '...' : food.name}</Text>
        <Text style={styles.foodPrice}>GHS{food.price}</Text>
        <TouchableOpacity 
          style={styles.orderButton}
          onPress={() => {
            setSelectedFood(food);
            setModalVisible(true);
          }}
        >
          <Text style={styles.orderButtonText}>Order Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ))}
</View>


      {/* Food Details Modal */}
      {selectedFood && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedFood.imageUrl }} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{selectedFood.name}</Text>
              <Text style={styles.modalPrice}>GHS{selectedFood.price}</Text>
              <Text style={styles.modalDescription}>{selectedFood.description}</Text>
              <Button style={styles.modalButton} title="Order Now" onPress={handleOrder} />
              <Button style={styles.modalButton} title="Close" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}

      {/* Cart Modal */}
<Modal
  visible={cartModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setCartModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Your Orders</Text>
      {orders.length > 0 ? (
        <ScrollView style={styles.ordersContainer}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <Image source={{ uri: order.image }} style={styles.orderImage} />
              <View style={styles.orderDetails}>
                <Text style={styles.orderName}>{order.name}</Text>
                <Text style={styles.orderPrice}>GHS{order.price}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noOrdersText}>You have no orders.</Text>
      )}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setCartModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFDBBB',
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d3d3d3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#d3d3d3',
    borderRadius: 10,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#000',
  },
  activeTabText: {
    color: '#fff',
  },


  foodItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10,
  },
  foodCard: {
    width: '48%',
    height: 200,
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
  },
  foodName: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  foodPrice: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  orderButton: {
    backgroundColor: '#FF6347', // Tomato color for button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  orderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /*
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalPrice: {
    fontSize: 20,
    color: '#007bff',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  orderImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  orderDetails: {
    justifyContent: 'center',
  },
  orderName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderPrice: {
    fontSize: 14,
    color: '#007bff',
  },
  noOrdersText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
*/

modalContainer: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay background
},
modalContent: {
  backgroundColor: '#ffffff', // White background
  padding: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: '80%', // Ensures the modal doesn't cover the entire screen
},

modalImage: {
  width: '100%',
  height: 200,
  borderRadius: 10,
  marginBottom: 20,
},
modalTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 20,
  color: '#333', // Darker text color
  textAlign: 'center',
},
modalPrice: {
  fontSize: 20,
  color: '#007bff',
  marginBottom: 10,
},
modalDescription: {
  fontSize: 13,
  textAlign: 'left',
  marginBottom: 20,
},
ordersContainer: {
  marginBottom: 20, // Space for the close button
},
orderItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#eee', // Light gray separator
},
orderImage: {
  width: 60,
  height: 60,
  borderRadius: 10,
  marginRight: 15,
},
orderDetails: {
  flex: 1,
},
orderName: {
  fontSize: 18,
  fontWeight: '600',
  color: '#333',
},
orderPrice: {
  fontSize: 16,
  color: '#888', // Subtle text color for the price
  marginTop: 5,
},
noOrdersText: {
  textAlign: 'center',
  color: '#888', // Subtle gray color
  fontSize: 18,
  marginTop: 20,
},
footer: {
  marginTop: 10,
  alignItems: 'center',
},
closeButton: {
  backgroundColor: '#ff6347', // Tomato color for the button
  paddingVertical: 15,
  paddingHorizontal: 30,
  borderRadius: 30,
  marginTop: 5
},
closeButtonText: {
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
},



  popularFoodsContainer: {
    marginBottom: 20,
    height: 170,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  popularFoodsList: {
    flexDirection: 'row',
  },
  popularFoodItem: {
    marginRight: 15,
  },
  popularFoodImage: {
    width: 100,
    height: 100,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  popularFoodName: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  noFoodText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },




});

