import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
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
    <TouchableOpacity style={styles.orderCard}>
      <Image source={{ uri: item.image }} style={styles.orderImage} />
      <View style={styles.orderDetails}>
        <Text style={styles.orderName}>{item.name}</Text>
        <Text style={styles.orderPrice}>${item.price}</Text>
        <Text style={styles.orderStatus}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

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
});
