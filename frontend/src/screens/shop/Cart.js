import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import client from "../../api/client";

const Cart = ({ navigation }) => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCart = async () => {
    try {
      setLoading(true);
      const response = await client.get("cart/");
      setCartData(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not fetch cart data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getCart();
    });
    return unsubscribe;
  }, [navigation]);

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await client.put("cart/update_quantity/", {
        product_id: productId,
        quantity: quantity,
      });
      getCart();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not update quantity.");
    }
  };

  const removeItem = async (productId) => {
    try {
      await client.post("cart/remove/", { product_id: productId });
      getCart();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not remove item.");
    }
  };

  const clearCart = async () => {
    try {
      await client.delete("cart/clear/");
      getCart();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not clear cart.");
    }
  };

      const checkout = () => {
    navigation.navigate("Checkout");
  };

  const sendOrder = async () => {
    try {
      const response = await client.post("cart/send_order/");
      navigation.navigate("Shop", { screen: "Orders" });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not send order.");
    }
  };

  if (loading && !cartData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d63384" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.cartCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{parseFloat(item.price).toFixed(2)} KES</Text>
      </View>
      <View style={styles.actions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => updateQuantity(item.product_id, item.quantity - 1)}
            style={styles.qtyBtn}
          >
            <Ionicons name="remove-circle-outline" size={24} color="#d63384" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item.product_id, item.quantity + 1)}
            style={styles.qtyBtn}
          >
            <Ionicons name="add-circle-outline" size={24} color="#d63384" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => removeItem(item.product_id)}
          style={styles.removeBtn}
        >
          <Ionicons name="trash-outline" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.totalLabel}>Subtotal:</Text>
        <Text style={styles.totalValue}>{parseFloat(item.total_price).toFixed(2)} KES</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pink Cart</Text>
        {cartData?.items?.length > 0 && (
          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartData?.items?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#f8bbd0" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("Products")}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartData?.items}
            keyExtractor={(item) => item.product_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalValue}>
                {parseFloat(cartData?.total_price || 0).toFixed(2)} KES
              </Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.checkoutBtn]} onPress={checkout}>
                <Text style={styles.btnText}>Checkout</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.orderBtn]} onPress={sendOrder}>
                <Text style={styles.btnText}>Send Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
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
    backgroundColor: "#fff1f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d63384",
  },
  clearBtn: {
    padding: 5,
  },
  clearText: {
    color: "#f44336",
    fontWeight: "600",
  },
  listContent: {
    padding: 15,
  },
  cartCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#d63384",
  },
  itemInfo: {
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f5",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  qtyBtn: {
    padding: 5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: "center",
    color: "#d63384",
  },
  removeBtn: {
    padding: 5,
  },
  itemTotal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: "#888",
    marginRight: 5,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#c2185b",
  },
  footer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  grandTotalLabel: {
    fontSize: 18,
    color: "#333",
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d63384",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 0.48,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutBtn: {
    backgroundColor: "#f06292",
  },
  orderBtn: {
    backgroundColor: "#d63384",
  },
  btnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    color: "#f8bbd0",
    marginTop: 20,
    marginBottom: 30,
  },
  shopBtn: {
    backgroundColor: "#d63384",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  shopBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Cart;
