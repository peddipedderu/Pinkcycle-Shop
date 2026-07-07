import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Linking,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import client from "../../api/client";

const { width } = Dimensions.get("window");

const Payment = ({ navigation, route }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("0743192968");
  const [paying, setPaying] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    // Shimmer loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const getPaymentInfo = async () => {
    try {
      setLoading(true);
      const response = await client.get("payment/summary/");
      setPaymentData(response.data);
    } catch (error) {
      console.error(error);
      // Fallback: try the old endpoint
      try {
        const fallback = await client.get("payment/");
        setPaymentData(fallback.data);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPaymentInfo();
  }, []);

  const handleMpesa = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Please enter your M-Pesa phone number.");
      return;
    }

    const orderId = route.params?.checkoutId 
      ? route.params.checkoutId.replace("chk_", "") 
      : (paymentData?.order_id || "1");

    try {
      setPaying(true);
      startPulse();
      const response = await client.post("payment/lipa_na_mpesa/", {
        phone_number: phoneNumber,
        amount: Math.round(parseFloat(amount)),
        order_id: orderId,
      });
      
      Alert.alert("M-Pesa Prompt Sent", "Please check your phone, enter your M-Pesa PIN, and authorize the transaction.");

      // Start polling for payment success
      let attempts = 0;
      const maxAttempts = 30; // 60 seconds (2s interval)
      const interval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await client.get(`payment/status/?order_id=${orderId}`);
          if (statusRes.data && statusRes.data.paid) {
            clearInterval(interval);
            setPaying(false);
            Alert.alert("Payment Successful", "Your payment has been successfully processed!", [
              {
                text: "OK",
                onPress: () => {
                  navigation.navigate("PaymentSuccess");
                }
              }
            ]);
          }
        } catch (pollErr) {
          console.error("Error polling payment status:", pollErr);
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPaying(false);
          Alert.alert("Payment Verification Timeout", "We couldn't verify your payment in time. If you authorized it, it will reflect in your account profile shortly.");
        }
      }, 2000);

    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.detail || "M-Pesa transaction failed. Please try again.";
      Alert.alert("Payment Error", errMsg);
      setPaying(false);
    }
  };

  const handleStripe = async () => {
    try {
      setStripeLoading(true);
      startPulse();
      
      // Call the backend to create a Stripe checkout session
      const response = await client.post("payment/process/");
      
      if (response.data && response.data.checkout_url) {
        // Redirect to Stripe checkout
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = response.data.checkout_url;
        } else {
          Linking.openURL(response.data.checkout_url);
        }
      } else {
        Alert.alert("Payment Error", "Could not initialize Stripe checkout. No checkout URL received.");
      }
    } catch (error) {
      console.error("Stripe error:", error);
      if (error.response?.status === 400 && error.response?.data?.detail?.includes("No items")) {
        Alert.alert(
          "No Items to Pay",
          "Please add items to your cart and place an order first.",
          [
            { text: "Go to Shop", onPress: () => navigation.navigate("Shop", { screen: "Products" }) },
            { text: "OK", style: "cancel" }
          ]
        );
      } else if (error.response?.data?.detail) {
        Alert.alert("Payment Error", error.response.data.detail);
      } else {
        Alert.alert("Payment Error", "Stripe initialization failed. Please try again.");
      }
    } finally {
      setStripeLoading(false);
    }
  };

  const handlePaypal = async () => {
    try {
      setPaypalLoading(true);
      startPulse();

      const orderId = route.params?.checkoutId 
        ? route.params.checkoutId.replace("chk_", "") 
        : (paymentData?.order_id || "1");
      
      // Call the backend to create a PayPal checkout session
      const response = await client.post("payment/paypal/create/", {
        order_id: orderId
      });
      
      if (response.data && response.data.approval_url) {
        // Redirect to PayPal checkout
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = response.data.approval_url;
        } else {
          Linking.openURL(response.data.approval_url);
        }
      } else {
        Alert.alert("Payment Error", "Could not initialize PayPal. No approval URL received.");
      }
    } catch (error) {
      console.error("PayPal error:", error);
      const errMsg = error.response?.data?.detail || "PayPal initialization failed. Please try again.";
      Alert.alert("Payment Error", errMsg);
    } finally {
      setPaypalLoading(false);
    }
  };

  const confirmDeleteOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel and delete this order? This will empty your active checkout session.",
      [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel Order", style: "destructive", onPress: handleDeleteOrder }
      ]
    );
  };

  const handleDeleteOrder = async () => {
    try {
      setLoading(true);
      const orderId = route.params?.checkoutId 
        ? route.params.checkoutId.replace("chk_", "") 
        : (paymentData?.order_id || "1");

      await client.delete(`payment/cancel/?order_id=${orderId}`);
      
      Alert.alert("Success", "Your order has been cancelled and deleted.");
      navigation.navigate("Shop", { screen: "Cart" });
    } catch (error) {
      console.error("Error deleting order:", error);
      const errMsg = error.response?.data?.detail || "Could not delete order. Please try again.";
      Alert.alert("Error", errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !paymentData) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#d63384" />
          <Text style={styles.loadingText}>Loading payment details...</Text>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    opacity: shimmerAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: i === 0 ? [0.3, 1, 0.3] : i === 1 ? [1, 0.3, 1] : [0.3, 1, 0.3],
                    }),
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  const amount = route.params?.amount 
    ? parseFloat(route.params.amount).toFixed(2) 
    : parseFloat(paymentData?.total_amount || paymentData?.total_price || 0).toFixed(2);

  const items = paymentData?.items || paymentData?.order_items || [];
  const hasItems = items.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Banner */}
      <Animated.View
        style={[
          styles.headerBanner,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerGradient}>
          <View style={styles.headerIconRow}>
            <View style={styles.secureIconBg}>
              <Ionicons name="shield-checkmark" size={28} color="#fff" />
            </View>
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={styles.headerTitle}>Secure Payment</Text>
              <Text style={styles.headerSubtitle}>
                Your payment is protected with 256-bit SSL encryption
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Order Summary Card */}
      <Animated.View
        style={[
          styles.summaryCard,
          {
            opacity: fadeAnim,
            transform: [{ scale: cardScale }],
          },
        ]}
      >
        <View style={styles.summaryHeader}>
          <Ionicons name="receipt-outline" size={22} color="#d63384" />
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>{items.length} items</Text>
          </View>
        </View>

        {hasItems ? (
          <>
            {items.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <View style={styles.itemDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryItemName}>
                    {item.product || item.name}
                  </Text>
                  <Text style={styles.summaryItemQty}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.summaryItemPrice}>
                  ${parseFloat(item.total || (parseFloat(item.price) * item.quantity)).toFixed(2)}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={48} color="#f8bbd0" />
            <Text style={styles.noItems}>No items pending payment</Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => navigation.navigate("Shop", { screen: "Products" })}
            >
              <Text style={styles.browseBtnText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <View style={styles.totalValueContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.totalValue}>{amount}</Text>
          </View>
        </View>

        {hasItems && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.cancelOrderBtn}
              onPress={confirmDeleteOrder}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#e53935" style={{ marginRight: 6 }} />
              <Text style={styles.cancelOrderBtnText}>Cancel & Delete Order</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>

      {/* Payment Method Selection Label */}
      <Animated.View style={[styles.methodLabel, { opacity: fadeAnim }]}>
        <Text style={styles.methodLabelText}>Choose Payment Method</Text>
        <View style={styles.methodLabelLine} />
      </Animated.View>

      {/* M-Pesa Payment Card */}
      <Animated.View
        style={[
          styles.paymentCard,
          activeMethod === "mpesa" && styles.paymentCardActive,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.paymentCardHeader}
          onPress={() => setActiveMethod(activeMethod === "mpesa" ? null : "mpesa")}
          activeOpacity={0.8}
        >
          <View style={styles.paymentMethodIcon}>
            <View style={[styles.iconCircle, { backgroundColor: "#4CAF50" }]}>
              <Ionicons name="phone-portrait-outline" size={22} color="#fff" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.paymentMethodTitle}>M-Pesa</Text>
              <Text style={styles.paymentMethodSub}>Mobile money payment</Text>
            </View>
          </View>
          <Ionicons
            name={activeMethod === "mpesa" ? "chevron-up" : "chevron-down"}
            size={22}
            color="#999"
          />
        </TouchableOpacity>

        {activeMethod === "mpesa" && (
          <View style={styles.paymentBody}>
            <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#4CAF50" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="07XXXXXXXX"
                placeholderTextColor="#ccc"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.payButton, styles.mpesaButton, paying && styles.disabledBtn]}
              onPress={handleMpesa}
              disabled={paying || stripeLoading || paypalLoading}
              activeOpacity={0.8}
            >
              {paying ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="flash" size={20} color="white" style={{ marginRight: 10 }} />
                  <Text style={styles.payButtonText}>Pay ${amount} with M-Pesa</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Stripe Card Payment */}
      <Animated.View
        style={[
          styles.paymentCard,
          activeMethod === "stripe" && styles.paymentCardActiveStripe,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: activeMethod === "stripe" ? pulseAnim : 1 },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.paymentCardHeader}
          onPress={() => setActiveMethod(activeMethod === "stripe" ? null : "stripe")}
          activeOpacity={0.8}
        >
          <View style={styles.paymentMethodIcon}>
            <View style={[styles.iconCircle, { backgroundColor: "#635BFF" }]}>
              <Ionicons name="card-outline" size={22} color="#fff" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.paymentMethodTitle}>Card Payment</Text>
              <Text style={styles.paymentMethodSub}>Visa, Mastercard, Amex & more</Text>
            </View>
          </View>
          <View style={styles.stripeBadge}>
            <Text style={styles.stripeBadgeText}>STRIPE</Text>
          </View>
        </TouchableOpacity>

        {activeMethod === "stripe" && (
          <View style={styles.paymentBody}>
            {/* Card Brands */}
            <View style={styles.cardBrands}>
              {["💳 Visa", "💳 Mastercard", "💳 Amex", "💳 Discover"].map((brand, i) => (
                <View key={i} style={styles.cardBrand}>
                  <Text style={styles.cardBrandText}>{brand}</Text>
                </View>
              ))}
            </View>

            <View style={styles.securityNote}>
              <Ionicons name="lock-closed" size={16} color="#635BFF" />
              <Text style={styles.securityNoteText}>
                You'll be securely redirected to Stripe's checkout page to complete your payment.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.payButton, styles.stripeButton, stripeLoading && styles.disabledBtn]}
              onPress={handleStripe}
              disabled={stripeLoading || paying || paypalLoading}
              activeOpacity={0.8}
            >
              {stripeLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={[styles.payButtonText, { marginLeft: 10 }]}>
                    Connecting to Stripe...
                  </Text>
                </View>
              ) : (
                <>
                  <Ionicons name="lock-closed" size={18} color="white" style={{ marginRight: 10 }} />
                  <Text style={styles.payButtonText}>Pay ${amount} with Card</Text>
                  <Ionicons name="arrow-forward" size={18} color="white" style={{ marginLeft: 10 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* PayPal Payment */}
      <Animated.View
        style={[
          styles.paymentCard,
          activeMethod === "paypal" && styles.paymentCardActivePaypal,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: activeMethod === "paypal" ? pulseAnim : 1 },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.paymentCardHeader}
          onPress={() => setActiveMethod(activeMethod === "paypal" ? null : "paypal")}
          activeOpacity={0.8}
        >
          <View style={styles.paymentMethodIcon}>
            <View style={[styles.iconCircle, { backgroundColor: "#0070ba" }]}>
              <Ionicons name="logo-paypal" size={22} color="#fff" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.paymentMethodTitle}>PayPal</Text>
              <Text style={styles.paymentMethodSub}>Pay with PayPal balance or Card</Text>
            </View>
          </View>
          <View style={styles.paypalBadge}>
            <Text style={styles.paypalBadgeText}>PAYPAL</Text>
          </View>
        </TouchableOpacity>

        {activeMethod === "paypal" && (
          <View style={styles.paymentBody}>
            <View style={styles.securityNote}>
              <Ionicons name="lock-closed" size={16} color="#0070ba" />
              <Text style={styles.securityNoteText}>
                You will be redirected to PayPal's secure checkout page to complete your payment.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.payButton, styles.paypalButton, paypalLoading && styles.disabledBtn]}
              onPress={handlePaypal}
              disabled={paypalLoading || paying || stripeLoading}
              activeOpacity={0.8}
            >
              {paypalLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={[styles.payButtonText, { marginLeft: 10 }]}>
                    Connecting to PayPal...
                  </Text>
                </View>
              ) : (
                <>
                  <Ionicons name="logo-paypal" size={18} color="white" style={{ marginRight: 10 }} />
                  <Text style={styles.payButtonText}>Pay ${amount} with PayPal</Text>
                  <Ionicons name="arrow-forward" size={18} color="white" style={{ marginLeft: 10 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Trust Indicators */}
      <View style={styles.trustSection}>
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
          <Text style={styles.trustText}>Secure</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Ionicons name="lock-closed-outline" size={20} color="#635BFF" />
          <Text style={styles.trustText}>Encrypted</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#d63384" />
          <Text style={styles.trustText}>Verified</Text>
        </View>
      </View>

      {/* Cancel Order Button */}
      {!!(route.params?.checkoutId || paymentData?.order_id) && (
        <TouchableOpacity
          style={styles.deleteOrderBtnBottom}
          onPress={confirmDeleteOrder}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={18} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.deleteOrderBtnBottomText}>Cancel & Delete This Order</Text>
        </TouchableOpacity>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={18} color="#f06292" style={{ marginRight: 6 }} />
        <Text style={styles.backBtnText}>Back to Shop</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf2f7",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fdf2f7",
  },
  loadingCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#888",
    fontWeight: "500",
  },
  loadingDots: {
    flexDirection: "row",
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d63384",
    marginHorizontal: 3,
  },
  // Header
  headerBanner: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  headerGradient: {
    backgroundColor: "#d63384",
    padding: 20,
    borderRadius: 20,
  },
  headerIconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  secureIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  // Summary
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d2d2d",
    marginLeft: 8,
    flex: 1,
  },
  itemCountBadge: {
    backgroundColor: "#fce4ec",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#d63384",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fafafa",
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f8bbd0",
    marginRight: 12,
  },
  summaryItemName: {
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
  summaryItemQty: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
  },
  summaryItemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d2d2d",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  noItems: {
    color: "#bbb",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 8,
    fontSize: 15,
  },
  browseBtn: {
    backgroundColor: "#fce4ec",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  browseBtnText: {
    color: "#d63384",
    fontWeight: "600",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  totalValueContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: "#d63384",
    marginTop: 4,
    marginRight: 2,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#d63384",
  },
  // Method Label
  methodLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  methodLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  methodLabelLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 12,
  },
  // Payment Cards
  paymentCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentCardActive: {
    borderColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.15,
  },
  paymentCardActiveStripe: {
    borderColor: "#635BFF",
    shadowColor: "#635BFF",
    shadowOpacity: 0.15,
  },
  paymentCardActivePaypal: {
    borderColor: "#0070ba",
    shadowColor: "#0070ba",
    shadowOpacity: 0.15,
  },
  paymentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  paymentMethodIcon: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d2d2d",
  },
  paymentMethodSub: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 1,
  },
  stripeBadge: {
    backgroundColor: "#635BFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stripeBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  paypalBadge: {
    backgroundColor: "#0070ba",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paypalBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  paymentBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#fafafa",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  // Card brands
  cardBrands: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  cardBrand: {
    backgroundColor: "#f8f7ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ede9fe",
  },
  cardBrandText: {
    fontSize: 12,
    color: "#635BFF",
    fontWeight: "600",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8f7ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  securityNoteText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  // Buttons
  payButton: {
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  mpesaButton: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
  },
  stripeButton: {
    backgroundColor: "#635BFF",
    shadowColor: "#635BFF",
  },
  paypalButton: {
    backgroundColor: "#0070ba",
    shadowColor: "#0070ba",
  },
  payButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  cancelOrderBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffcdd2",
    backgroundColor: "#ffebee",
  },
  cancelOrderBtnText: {
    color: "#c62828",
    fontSize: 14,
    fontWeight: "700",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Trust section
  trustSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 12,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  trustText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
    fontWeight: "500",
  },
  trustDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
  // Back
  backBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  backBtnText: {
    color: "#f06292",
    fontWeight: "600",
    fontSize: 15,
  },
  deleteOrderBtnBottom: {
    backgroundColor: "#d32f2f",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    shadowColor: "#d32f2f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  deleteOrderBtnBottomText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

export default Payment;
