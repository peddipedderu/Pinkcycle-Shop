import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import client from "../../api/client";

const Orders = ({ navigation, route }) => {
  const [orders, setOrders] = useState([]);
  const [totals, setTotals] = useState({ grand_total: "0.00", unpaid_total: "0.00" });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

            const deleteOrder = async (orderId) => {
    console.log("Deleting order immediately:", orderId);
    try {
        await client.delete(`orders/${orderId}/`);
        getOrders(); 
        
        if (typeof window !== "undefined") {
            window.location.reload();
        }
    } catch (error) {
        console.error("Delete failed:", error);
    }
  };

  const getOrders = async () => {
    try {
      setLoading(true);
      const response = await client.get("orders/");
      // The backend now returns { orders: [], grand_total: "", unpaid_total: "" }
      if (response.data.orders) {
        setOrders(response.data.orders);
        setTotals({
            grand_total: response.data.grand_total,
            unpaid_total: response.data.unpaid_total
        });
      } else {
        // Fallback for old API format
        setOrders(response.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.fromCheckout && route.params?.amount) {
      setCheckoutMessage(`Success! Your cart total of ${parseFloat(route.params.amount).toFixed(2)} KES is ready for review.`);
      navigation.setParams({ fromCheckout: false });
    }
  }, [route.params]);

  const clearOrders = async () => {
    Alert.alert(
      "Clear All Orders",
      "Are you sure you want to delete all order history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: async () => {
            try {
              await client.delete("orders/clear/");
              setOrders([]);
              setTotals({ grand_total: "0.00", unpaid_total: "0.00" });
              Alert.alert("Success", "All orders cleared.");
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Could not clear orders.");
            }
          }
        }
      ]
    );
  };

  const getOrderItems = async (orderId) => {
    try {
      setLoadingItems(true);
      setModalVisible(true);
      const response = await client.get(`orders/${orderId}/items/`);
      setOrderItems(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch order items.");
      setModalVisible(false);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getOrders();
    });
    return unsubscribe;
  }, [navigation]);

  const renderOrderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemName}>{item.product}</Text>
      <Text style={styles.itemQty}>x{item.quantity}</Text>
      <Text style={styles.itemPrice}>{parseFloat(item.price).toFixed(2)} KES</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <View style={{flexDirection: "row", alignItems: "center"}}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <TouchableOpacity onPress={() => deleteOrder(item.id)} style={{marginLeft: 10}}>
              <Ionicons name="trash-outline" size={18} color="#f44336" />
            </TouchableOpacity>
          </View>
          <Text style={styles.orderDate}>
            {new Date(item.created).toLocaleDateString()}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.paid ? "#e8f5e9" : "#fff3e0" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.paid ? "#2e7d32" : "#ef6c00" },
            ]}
          >
            {item.paid ? "PAID" : "UNPAID"}
          </Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        <Text style={styles.infoLabel}>Address:</Text>
        <Text style={styles.infoValue}>
          {item.address}, {item.city}
        </Text>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity 
          style={styles.detailsBtn}
          onPress={() => {
            setSelectedOrder(item);
            getOrderItems(item.id);
          }}
        >
          <Text style={styles.detailsBtnText}>View Items</Text>
          <Ionicons name="list" size={16} color="#d63384" />
        </TouchableOpacity>

        {!item.paid && (
          <TouchableOpacity
            style={styles.payNowBtn}
            onPress={() => {
              if (typeof window !== "undefined") {
                  // Automatic browser-level redirect for web
                  window.location.href = "/Payment";
              } else {
                  navigation.navigate("Payment", { amount: item.total_cost });
              }
            }}
          >
            <Text style={styles.payNowText}>Pay Now</Text>
            <Ionicons name="chevron-forward" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>{parseFloat(item.total_cost).toFixed(2)} KES</Text>
        </View>
      </View>
    </View>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d63384" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Pink Orders</Text>
        <View style={styles.headerIcons}>
          {orders.length > 0 && (
            <TouchableOpacity onPress={clearOrders} style={styles.headerBtn}>
              <Ionicons name="trash-outline" size={24} color="#f44336" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={getOrders} style={styles.headerBtn}>
            <Ionicons name="refresh" size={24} color="#d63384" />
          </TouchableOpacity>
        </View>
      </View>

      {checkoutMessage ? (
        <View style={styles.checkoutNotify}>
          <Text style={styles.checkoutNotifyText}>{checkoutMessage}</Text>
          <TouchableOpacity onPress={() => setCheckoutMessage("")}>
            <Ionicons name="close-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ) : null}

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#f8bbd0" />
          <Text style={styles.emptyText}>No orders found yet</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("Shop", { screen: "Products" })}
          >
            <Text style={styles.shopBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
          
          <View style={styles.grandTotalContainer}>
            <View style={styles.totalInfo}>
              <View>
                <Text style={styles.grandTotalLabel}>Grand Total (All Orders):</Text>
                <Text style={styles.grandTotalValue}>{parseFloat(totals.grand_total).toFixed(2)} KES</Text>
              </View>
              {parseFloat(totals.unpaid_total) > 0 && (
                <View style={styles.unpaidBadge}>
                    <Text style={styles.unpaidBadgeText}>Unpaid: {parseFloat(totals.unpaid_total).toFixed(2)} KES</Text>
                </View>
              )}
            </View>
            
            {parseFloat(totals.unpaid_total) > 0 && (
              <TouchableOpacity 
                style={styles.payAllBtn}
                onPress={() => navigation.navigate("Shop", { screen: "Payment", params: { amount: totals.unpaid_total } })}
              >
                <Text style={styles.payAllText}>Pay Unpaid</Text>
                <Ionicons name="wallet-outline" size={20} color="white" style={{marginLeft: 5}} />
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details #{selectedOrder?.id}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#d63384" />
              </TouchableOpacity>
            </View>

            {loadingItems ? (
              <ActivityIndicator size="large" color="#d63384" style={{margin: 20}} />
            ) : (
              <FlatList
                data={orderItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderOrderItem}
                ListHeaderComponent={() => (
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemHeaderText, {flex: 2}]}>Product</Text>
                    <Text style={[styles.itemHeaderText, {flex: 1}]}>Qty</Text>
                    <Text style={[styles.itemHeaderText, {flex: 1}]}>Price</Text>
                  </View>
                )}
              />
            )}
            
            <View style={styles.modalFooter}>
              <Text style={styles.modalTotalLabel}>Total:</Text>
              <Text style={styles.modalTotalValue}>{parseFloat(selectedOrder?.total_cost || 0).toFixed(2)} KES</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff1f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    elevation: 4,
  },
  headerIcons: {
    flexDirection: "row",
  },
  headerBtn: {
    marginLeft: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#d63384",
  },
  checkoutNotify: {
    backgroundColor: "#4caf50",
    margin: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },
  checkoutNotifyText: {
    color: "white",
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  listContent: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 12,
    color: "#888",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  orderBody: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 12,
    color: "#888",
  },
  infoValue: {
    fontSize: 14,
    color: "#444",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f8bbd0",
  },
  detailsBtnText: {
    color: "#d63384",
    marginRight: 5,
    fontWeight: "600",
  },
  payNowBtn: {
    flexDirection: "row",
    backgroundColor: "#d63384",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  payNowText: {
    color: "white",
    fontWeight: "bold",
    marginRight: 5,
  },
  orderFooter: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  totalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#888",
    marginRight: 5,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#c2185b",
  },
  grandTotalContainer: {
    backgroundColor: "#d63384",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  totalInfo: {
    flex: 1,
  },
  grandTotalLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  grandTotalValue: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  unpaidBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  unpaidBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  payAllBtn: {
    backgroundColor: "#f06292",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  payAllText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    marginVertical: 20,
  },
  shopBtn: {
    backgroundColor: "#d63384",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopBtnText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  itemHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
    marginBottom: 10,
  },
  itemHeaderText: {
    fontWeight: "bold",
    color: "#888",
    fontSize: 12,
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  itemName: {
    flex: 2,
    fontSize: 14,
    color: "#333",
  },
  itemQty: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#d63384",
    textAlign: "right",
  },
  modalFooter: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalTotalLabel: {
    fontSize: 16,
    color: "#888",
    marginRight: 10,
  },
  modalTotalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#d63384",
  },
});

export default Orders;
