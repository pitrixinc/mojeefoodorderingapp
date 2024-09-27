import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import MapView, { Marker, Polyline } from 'react-native-maps';

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
const [currentOrder, setCurrentOrder] = useState(null);

  
  const bannerImages = [
    require('../../assets/images/banner1.jpg'),
    require('../../assets/images/banner2.jpg'),
    require('../../assets/images/banner3.jpg'),
    require('../../assets/images/banner4.jpg'),
    require('../../assets/images/banner5.jpg'),
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchText, activeTab, orders]);

  const fetchOrders = async () => {
    const ordersQuery = query(collection(db, 'orders'), where('buyerId', '==', auth.currentUser.uid));
    const orderSnapshot = await getDocs(ordersQuery);
    const orderList = orderSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setOrders(orderList);
    setFilteredOrders(orderList);
  };

  const filterOrders = () => {
    const filtered = orders.filter(order => {
      const matchesSearchText = order.name.toLowerCase().includes(searchText.toLowerCase()) ||
        order.price.toString().includes(searchText);
      const matchesTab = activeTab === 'all' || order.status.toLowerCase() === activeTab.toLowerCase();
      return matchesSearchText && matchesTab;
    });
    setFilteredOrders(filtered);
  };

  const renderBannerItem = ({ item }) => (
    <Image source={item} style={styles.bannerImage} />
  );

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
       style={styles.orderCard}
       onPress={() => {
        setCurrentOrder(item);  // Set the selected order
        setTrackingModalVisible(true);  // Show the modal
      }}>
      <Image source={{ uri: item.image }} style={styles.orderImage} />
      <View style={styles.orderDetails}>
        <Text style={styles.orderName}>{item.name}</Text>
        <Text style={styles.orderPrice}>${item.price}</Text>
        <Text style={styles.orderStatus}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const TrackingModal = () => {
   /* const vendorLocation = currentOrder?.vendorLocation;
    const buyerLocation = currentOrder?.buyerLocation;
  
    console.log("Vendor Location: ", vendorLocation);
console.log("Buyer Location: ", buyerLocation);
    // Fallback coordinates for the map in case locations are unavailable
    const defaultLocation = { latitude: 37.7749, longitude: -122.4194 }; // Example: San Francisco

  
    const initialRegion = {
      latitude: vendorLocation?.latitude || buyerLocation?.latitude || defaultLocation.latitude,
      longitude: vendorLocation?.longitude || buyerLocation?.longitude || defaultLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    
    // Log the coordinates if available
  if (vendorLocation) {
    console.log("Vendor Location Coordinates: ", {
      latitude: vendorLocation.latitude,
      longitude: vendorLocation.longitude,
    });
  } else {
    console.log("Vendor Location not available");
  }

  if (buyerLocation) {
    console.log("Buyer Location Coordinates: ", {
      latitude: buyerLocation.latitude,
      longitude: buyerLocation.longitude,
    });
  } else {
    console.log("Buyer Location not available");
  }

  
    // Ensure both vendorLocation and buyerLocation are available before rendering the map
    const areLocationsAvailable = vendorLocation && buyerLocation;
  */
    return (
      <Modal visible={trackingModalVisible} transparent={true} animationType="slide">
        <View style={styles.buyerOrderOverlay}>
          <View style={styles.buyerOrderBottomModalContainer}>
            <View style={styles.buyerOrderDragIndicator} />
  
            <ScrollView style={styles.buyerOrderScrollView}>
           {/*
              {areLocationsAvailable ? (
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={initialRegion}
                  >
                    
                    {vendorLocation && (
                      <Marker
                        coordinate={{
                          latitude: vendorLocation.latitude,
                          longitude: vendorLocation.longitude,
                        }}
                        title="Vendor Location"
                      />
                    )}
  
                    
                    {buyerLocation && (
                      <Marker
                        coordinate={{
                          latitude: buyerLocation.latitude,
                          longitude: buyerLocation.longitude,
                        }}
                        title="Buyer Location"
                      />
                    )}
  
                    
                    <Polyline
                      coordinates={[
                        { latitude: vendorLocation.latitude, longitude: vendorLocation.longitude },
                        { latitude: buyerLocation.latitude, longitude: buyerLocation.longitude },
                      ]}
                      strokeColor="green"
                      strokeWidth={5}
                    />
                  </MapView>
                </View>
              ) : (
                <Text style={styles.errorText}>Location data is not available.</Text>
              )}
              */}
              <Text style={styles.buyerOrderThankYouText}>Order Details</Text>
  
              {currentOrder && (
                <>
                  <Text style={styles.buyerOrderSummaryTitle}>Order Summary:</Text>
                  <View style={styles.buyerOrderItem}>
                    <Image source={{ uri: currentOrder.image }} style={styles.buyerOrderItemImage} />
                    <View style={styles.buyerOrderItemDetails}>
                      <Text style={styles.buyerOrderItemName}>{currentOrder.name}</Text>
                      <Text style={styles.buyerOrderItemPrice}>GHS{currentOrder.price}</Text>
                    </View>
                  </View>
                  <Text style={styles.buyerOrderId}>Order ID: {currentOrder.id}</Text>
                </>
              )}
  
              {/* Tracking Status */}
              {/* Order Status */}
              <View style={styles.buyerOrderStatusContainer}>
                <Text style={styles.buyerOrderStatusTitle}>Order Status:</Text>
  
                {currentOrder ? (
                  <View style={styles.buyerOrderVerticalStatusContainer}>
                    {/* Pending Step */}
                    <View style={styles.buyerOrderStatusStep}>
                      <View
                        style={[
                          styles.buyerOrderProgressLine,
                          {
                            backgroundColor:
                              currentOrder.status === 'pending' ||
                              currentOrder.status === 'in progress' ||
                              currentOrder.status === 'delivered'
                                ? 'green'
                                : 'gray',
                          },
                        ]}
                      />
                      <Ionicons
                        name="hourglass-outline"
                        size={24}
                        color={
                          currentOrder.status === 'pending' ||
                          currentOrder.status === 'in progress' ||
                          currentOrder.status === 'delivered'
                            ? 'green'
                            : 'gray'
                        }
                      />
                      <View style={styles.buyerOrderStatusTextContainer}>
                        <Text
                          style={[
                            styles.buyerOrderStatusText,
                            {
                              color:
                                currentOrder.status === 'pending' ||
                                currentOrder.status === 'in progress' ||
                                currentOrder.status === 'delivered'
                                  ? 'green'
                                  : 'gray',
                            },
                          ]}
                        >
                          Pending
                        </Text>
                      </View>
                    </View>
  
                    {/* In Progress Step */}
                    <View style={styles.buyerOrderStatusStep}>
                      <View
                        style={[
                          styles.buyerOrderProgressLine,
                          {
                            backgroundColor:
                              currentOrder.status === 'in progress' || currentOrder.status === 'delivered'
                                ? 'green'
                                : 'gray',
                          },
                        ]}
                      />
                      <Ionicons
                        name="construct-outline"
                        size={24}
                        color={
                          currentOrder.status === 'in progress' || currentOrder.status === 'delivered'
                            ? 'green'
                            : 'gray'
                        }
                      />
                      <View style={styles.buyerOrderStatusTextContainer}>
                        <Text
                          style={[
                            styles.buyerOrderStatusText,
                            {
                              color:
                                currentOrder.status === 'in progress' || currentOrder.status === 'delivered'
                                  ? 'green'
                                  : 'gray',
                            },
                          ]}
                        >
                          In Progress
                        </Text>
                      </View>
                    </View>
  
                    {/* Delivered Step */}
                    <View style={styles.buyerOrderStatusStep}>
                      <View
                        style={[
                          styles.buyerOrderProgressLine,
                          { backgroundColor: currentOrder.status === 'delivered' ? 'green' : 'gray' },
                        ]}
                      />
                      <Ionicons
                        name="checkmark-done-outline"
                        size={24}
                        color={currentOrder.status === 'delivered' ? 'green' : 'gray'}
                      />
                      <View style={styles.buyerOrderStatusTextContainer}>
                        <Text
                          style={[
                            styles.buyerOrderStatusText,
                            { color: currentOrder.status === 'delivered' ? 'green' : 'gray' },
                          ]}
                        >
                          Delivered
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.errorText}>No order data available</Text>
                )}
              </View>
  
              <TouchableOpacity onPress={() => setTrackingModalVisible(false)} style={styles.buyerOrderCloseButton}>
                <Text style={styles.buyerOrderCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  

  return (
    <View style={styles.container}>
      {/* Banner Section */}
      <FlatList
        data={bannerImages}
        renderItem={renderBannerItem}
        horizontal
        pagingEnabled
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        style={styles.bannerContainer}
      />

      {/* Order Tracking Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Track all your orders here!</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders by name or price"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Tabs for Order Status */}
      <View style={styles.tabsContainer}>
        {['all', 'pending', 'in progress', 'delivered', 'canceled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        style={styles.orderList}
      />

       {/* Tracking Modal */}
    <TrackingModal />
    </View>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFDBBB',
  },
  bannerContainer: {
    height: 200,
    marginBottom: 20,
  },
  bannerImage: {
    width: 300,
    height: 200,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  messageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#007bff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#d3d3d3',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#d3d3d3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeTabButton: {
    backgroundColor: '#007bff',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
  },
  orderList: {
    marginHorizontal: 16,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  orderDetails: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderPrice: {
    fontSize: 14,
    color: '#777',
  },
  orderStatus: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 5,
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




  mapContainer: {
    width: Dimensions.get('window').width,
    height: 300,
    marginBottom: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
