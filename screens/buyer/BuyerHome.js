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
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import {  signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Add this to handle navigation
import AsyncStorage from '@react-native-async-storage/async-storage';


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
  const [cart, setCart] = useState([]); // Cart state
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
const [currentOrder, setCurrentOrder] = useState(null);  // Store the order details

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
      const q = query(collection(db, 'foods')/*, where('status', '==', 'approved')*/);
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

  /*
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
*/

/*
const handleOrder = async () => {
  try {
    const orderData = {
      id: new Date().getTime().toString(),  // You can use a more robust ID generator here
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

    // Set current order for tracking modal
    setCurrentOrder(orderData);

    // Show tracking modal after successful order
    setTrackingModalVisible(true);
    setModalVisible(false);  // Close the food details modal
  } catch (error) {
    console.error('Error placing order: ', error);
    alert('Failed to place order. Please try again.');
  }
};
*/


const handleOrder = async () => {
  try {
    const orderData = {
      // Remove the id here as it will be generated by Firestore
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

    // Add order to Firestore and get the document reference
    const orderDocRef = await addDoc(collection(db, 'orders'), orderData);

    // Update the order document with the document ID
    await updateDoc(orderDocRef, {
      id: orderDocRef.id,  // Store the Firestore document ID in the order
    });

    // Set current order for tracking modal
    const orderWithId = {
      ...orderData,
      id: orderDocRef.id,  // Store the Firestore document ID in the local state
    };
    setCurrentOrder(orderWithId);

    // Show tracking modal after successful order
    setTrackingModalVisible(true);
    setModalVisible(false);  // Close the food details modal
  } catch (error) {
    console.error('Error placing order: ', error);
    alert('Failed to place order. Please try again.');
  }
};

  

  const saveCartToStorage = async (cart) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.log('Error saving cart:', error);
    }
  };

  

  // Add to cart function
const addToCart = (foodItem) => {
  const itemExists = cart.find(item => item.id === foodItem.id);

  let updatedCart;
  if (itemExists) {
    updatedCart = cart.map(item =>
      item.id === foodItem.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  } else {
    updatedCart = [...cart, { ...foodItem, quantity: 1 }];
  }

  setCart(updatedCart);
  saveCartToStorage(updatedCart); // Save the updated cart to AsyncStorage
};

// Remove item from cart
const removeFromCart = (foodId) => {
  const updatedCart = cart.filter(item => item.id !== foodId);
  setCart(updatedCart);
  saveCartToStorage(updatedCart); // Save the updated cart to AsyncStorage
};

const increaseQuantity = (foodId) => {
  const updatedCart = cart.map(item =>
    item.id === foodId ? { ...item, quantity: item.quantity + 1 } : item
  );
  setCart(updatedCart);
  saveCartToStorage(updatedCart); // Save the updated cart to AsyncStorage
};

const decreaseQuantity = (foodId) => {
  const updatedCart = cart.map(item =>
    item.id === foodId && item.quantity > 1
      ? { ...item, quantity: item.quantity - 1 }
      : item
  );
  setCart(updatedCart);
  saveCartToStorage(updatedCart); // Save the updated cart to AsyncStorage
};

useEffect(() => {
  const loadCartFromStorage = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.log('Error loading cart:', error);
    }
  };

  loadCartFromStorage();
}, []);


const calculateTotal = () => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};


/*
const handleOrderNow = async () => {
  try {
    const orderData = {
      buyerId: user.uid,
      buyerName: userDetails.fullName,
      buyerProfileImage: userDetails.profileImage,
      totalAmount: calculateTotal(),
      createdAt: new Date(),
      status: 'pending',
      items: cart.map(item => ({
        foodId: item.id,
        name: item.name,
        image: item.imageUrl,
        price: item.price,
        quantity: item.quantity,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
      })),
    };
    await addDoc(collection(db, 'orders'), orderData);
    alert('Order placed successfully!');
    setCart([]);  // Clear the cart after order
    setCartModalVisible(false);
  } catch (error) {
    console.error('Error placing order: ', error);
  }
};
*/

const handleOrderNow = async () => {
  try {
    const orderData = {
      buyerId: user.uid,
      buyerName: userDetails.fullName,
      buyerProfileImage: userDetails.profileImage,
      totalAmount: calculateTotal(),
      createdAt: new Date(),
      status: 'pending',  // Order starts as 'pending'
      items: cart.map(item => ({
        foodId: item.id,
        name: item.name,
        image: item.imageUrl,
        price: item.price,
        quantity: item.quantity,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
      })),
    };

    
     
    // Add the order to Firebase
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    
    // Fetch the newly created order
    const newOrder = {
      id: docRef.id,
      ...orderData,
    };
     
     

    setCurrentOrder(newOrder);  // Set the current order for tracking
    setTrackingModalVisible(true);  // Show the order tracking modal
    
    alert('Order placed successfully!');
    // Clear the cart after the order
    setCart([]);
    setCartModalVisible(false);

  } catch (error) {
    console.error('Error placing order: ', error);
  }
};

{/*

// Fetch order details by order ID (after placing the order)
const fetchOrderDetails = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (orderDoc.exists()) {
      setCurrentOrder(orderDoc.data());
      setOrderTrackingModalVisible(true); // Show the tracking modal
    }
  } catch (error) {
    console.error('Error fetching order details:', error);
  }
}; */}

  return (
    <ScrollView style={styles.container}>
      {/* Greeting Section */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>{`${greeting}, ${firstName}`}</Text>
        <TouchableOpacity onPress={() => setCartModalVisible(true)}>
          <Ionicons name="cart-outline" size={30} color="black" />
        {/**   {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )} */}
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
      {/*  <TouchableOpacity 
                  style={styles.cartIconContainer} 
                  onPress={() => addToCart(food)}
                >
                  <Ionicons name="cart-outline" size={24} color="green" />
    </TouchableOpacity> */}
        <TouchableOpacity 
          style={styles.orderButton}
          onPress={() => {
            setSelectedFood(food);
            setModalVisible(true);
          }}
        >
          <Text style={styles.orderButtonText}>Order</Text>
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

      {/* Cart Modal 
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
      */}

<Modal
  visible={cartModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setCartModalVisible(false)}
>
  <View style={styles.modalContainer}>
    {/* Close Button */}
    <TouchableOpacity
      style={styles.closeButton}
      onPress={() => setCartModalVisible(false)}
    >
      <Ionicons name="close-circle" size={32} color="#fff" />
    </TouchableOpacity>

    {/* Modal Content */}
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Your Cart</Text>
      
      {/* Scrollable Cart Items */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {cart.length > 0 ? (
          cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={{ uri: item.imageUrl }} style={styles.cartItemImage} />
              <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemPrice}>GHS {item.price}</Text>

                {/* Quantity Controls */}
                <View style={styles.quantityControl}>
                  <TouchableOpacity onPress={() => decreaseQuantity(item.id)}>
                    <Ionicons name="remove-circle-outline" size={24} color="#f00" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => increaseQuantity(item.id)}>
                    <Ionicons name="add-circle-outline" size={24} color="#00f" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remove from Cart */}
              <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noFoodText}>Your cart is empty.</Text>
        )}
      </ScrollView>

      {/* Total and Order Button */}
      <View style={styles.totalSection}>
        <Text style={styles.totalText}>Total: GHS {calculateTotal()}</Text>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrderNow}>
          <Text style={styles.orderButtonText}>Order Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


{/* Tracking Modal Component */}
<Modal 
  visible={trackingModalVisible}
  transparent={true}
  animationType="slide"
>
  <View style={styles.buyerOrderOverlay}>
    <View style={styles.buyerOrderBottomModalContainer}>
      <View style={styles.buyerOrderDragIndicator} />
      
      <ScrollView style={styles.buyerOrderScrollView}>
        <Text style={styles.buyerOrderThankYouText}>Thank you for your order!</Text>

        {/* Order Details */}
        {currentOrder && (
          <>
            <Text style={styles.buyerOrderSummaryTitle}>Order Summary:</Text>
            <View style={styles.buyerOrderItem}>
              <Image source={{ uri: currentOrder.image }} style={styles.buyerOrderItemImage} />
              <View style={styles.buyerOrderItemDetails}>
                <Text style={styles.buyerOrderItemName}>{currentOrder.name}</Text>
                <Text style={styles.buyerOrderItemPrice}>GHS {currentOrder.price}</Text>
              </View>
            </View>
          </>
        )}

        {/* Order ID */}
        {currentOrder && (
          <Text style={styles.buyerOrderId}>Order ID: {currentOrder.id}</Text>
        )}

        {/* Order Status */}
        <View style={styles.buyerOrderStatusContainer}>
          <Text style={styles.buyerOrderStatusTitle}>Order Status:</Text>

          {/* Vertical Progress Line */}
          <View style={styles.buyerOrderVerticalStatusContainer}>
            <View style={styles.buyerOrderStatusStep}>
               <View style={[styles.buyerOrderProgressLine, { backgroundColor: 'green' }]} />
              <Ionicons name="hourglass-outline" size={24} color="green" />
              <View style={styles.buyerOrderStatusTextContainer}>
                <Text style={[styles.buyerOrderStatusText, { color: 'green' }]}>Pending</Text>
                <Text style={[styles.buyerOrderStatusDate, { color: 'green' }]}>{currentOrder?.createdAt}</Text>
              </View>
            </View>

            <View style={styles.buyerOrderStatusStep}>
              <View style={[styles.buyerOrderProgressLine, { backgroundColor: 'gray' }]} />
              <Ionicons name="construct-outline" size={24} color="gray" />
              <View style={styles.buyerOrderStatusTextContainer}>
                <Text style={[styles.buyerOrderStatusText, { color: 'gray' }]}>Processing</Text>
              </View>
            </View>

            <View style={styles.buyerOrderStatusStep}>
              <View style={[styles.buyerOrderProgressLine, { backgroundColor: 'gray' }]} />
              <Ionicons name="checkmark-done-outline" size={24} color="gray" />
              <View style={styles.buyerOrderStatusTextContainer}>
                <Text style={[styles.buyerOrderStatusText, { color: 'gray' }]}>Delivered</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setTrackingModalVisible(false)}
          style={styles.buyerOrderCloseButton}
        >
          <Text style={styles.buyerOrderCloseButtonText}>Close</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  </View>
</Modal>


{/*
<Modal
  visible={trackingModalVisible}
  transparent={true}
  animationType="slide"
>
  <View style={styles.buyerOrderOverlay}>
    <View style={styles.buyerOrderBottomModalContainer}>
      <View style={styles.buyerOrderDragIndicator} />
      
      <ScrollView style={styles.buyerOrderScrollView}>
        <Text style={styles.buyerOrderThankYouText}>Thank you for your order!</Text>

        
        {currentOrder && (
          <>
            <Text style={styles.buyerOrderSummaryTitle}>Order Summary:</Text>
            {currentOrder.items.map((item, index) => (
              <View key={index} style={styles.buyerOrderItem}>
                <Image source={{ uri: item.image }} style={styles.buyerOrderItemImage} />
                <View style={styles.buyerOrderItemDetails}>
                  <Text style={styles.buyerOrderItemName}>{item.name}</Text>
                  <Text style={styles.buyerOrderItemPrice}>GHS {item.price}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        
        {currentOrder && (
          <Text style={styles.buyerOrderId}>Order ID: {currentOrder.id}</Text>
        )}

       
        <View style={styles.buyerOrderStatusContainer}>
          <Text style={styles.buyerOrderStatusTitle}>Order Status:</Text>

         
          <View style={styles.buyerOrderVerticalStatusContainer}>
            <View style={styles.buyerOrderStatusStep}>
               
               <View style={[styles.buyerOrderProgressLine, { backgroundColor: 'green' }]} />
              
              <Ionicons name="hourglass-outline" size={24} color="green" />
              <View style={styles.buyerOrderStatusTextContainer}>
                <Text style={[styles.buyerOrderStatusText, { color: 'green' }]}>Pending</Text>
                <Text style={[styles.buyerOrderStatusDate, { color: 'green' }]}>{currentOrder?.createdAt.toDateString()}</Text>
              </View>
             
            </View>

            <View style={styles.buyerOrderStatusStep}>
            <View style={[styles.buyerOrderProgressLine, { backgroundColor: 'gray' }]} />
              <Ionicons name="construct-outline" size={24} color="gray" />
              <View style={styles.buyerOrderStatusTextContainer}>
                <Text style={[styles.buyerOrderStatusText, { color: 'gray' }]}>Processing</Text>
              </View>
              
            </View>

            <View style={styles.buyerOrderStatusStep}>
            <View style={[styles.buyerOrderProgressLine, { backgroundColor: 'gray' }]} />
              <Ionicons name="checkmark-done-outline" size={24} color="gray" />
              <View style={styles.buyerOrderStatusTextContainer}>
                <Text style={[styles.buyerOrderStatusText, { color: 'gray' }]}>Delivered</Text>
              </View>
              
            </View>

            <View style={styles.buyerOrderStatusStep}>
            <View style={[styles.buyerOrderProgressLine, { backgroundColor: 'gray' }]} />
              <Ionicons name="checkbox-outline" size={24} color="gray" />
              <View style={styles.buyerOrderStatusTextContainer}>
                <Text style={[styles.buyerOrderStatusText, { color: 'gray' }]}>Confirmed</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setTrackingModalVisible(false)}
          style={styles.buyerOrderCloseButton}
        >
          <Text style={styles.buyerOrderCloseButtonText}>Close</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  </View>
</Modal>

        */}


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




  cartBadge: {
    position: 'absolute',
    right: -10,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
/*
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  cartItemName: {
    fontSize: 16,
    flex: 1,
    marginHorizontal: 10,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    margin: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
*/






  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '80%', // Modal occupies 80% of the screen height
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  scrollViewContent: {
    paddingBottom: 20, // Extra padding for better scroll experience
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  cartItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
  },
  cartItemPrice: {
    fontSize: 16,
    color: '#888',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  removeButton: {
    marginLeft: 10,
  },
  noFoodText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 16,
    marginVertical: 20,
  },
  totalSection: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },









  buyerOrderOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buyerOrderBottomModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%', // Ensures content is scrollable if needed
    width: '100%',
    alignSelf: 'center',
  },
  buyerOrderDragIndicator: {
    width: 50,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 15,
  },
  buyerOrderScrollView: {
    paddingBottom: 20,
  },
  buyerOrderThankYouText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buyerOrderSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  buyerOrderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  buyerOrderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 15,
  },
  buyerOrderItemDetails: {
    flex: 1,
  },
  buyerOrderItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  buyerOrderItemPrice: {
    fontSize: 14,
    color: '#999',
  },
  buyerOrderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginVertical: 10,
    textAlign: 'center',
  },
  buyerOrderStatusContainer: {
    marginTop: 20,
  },
  buyerOrderStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  buyerOrderVerticalStatusContainer: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  buyerOrderStatusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  buyerOrderStatusTextContainer: {
    marginLeft: 10,
  },
  buyerOrderStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buyerOrderStatusDate: {
    fontSize: 12,
  },
  buyerOrderProgressLine: {
    width: 3,
    height: 50,
    marginLeft: 11,
    marginRight: 5,
  },
  buyerOrderCloseButton: {
    backgroundColor: '#ff6347',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buyerOrderCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

