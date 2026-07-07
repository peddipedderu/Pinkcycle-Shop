import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import client from "../../api/client";

const { width } = Dimensions.get("window");

const PaymentSuccess = ({ navigation, route }) => {
  const { session_id, gateway, token } = route.params || {};

  const [loading, setLoading] = useState(!!session_id || gateway === "paypal");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const slideUp1 = useRef(new Animated.Value(40)).current;
  const slideUp2 = useRef(new Animated.Value(40)).current;
  const slideUp3 = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (session_id) {
      const verifyPayment = async () => {
        try {
          setLoading(true);
          const response = await client.get(`payment/verify-session/?session_id=${session_id}`);
          setPaymentDetails(response.data);
          setError(null);
        } catch (err) {
          console.error("Verification error:", err);
          setError(err.response?.data?.detail || "Failed to verify your payment status with Stripe.");
        } finally {
          setLoading(false);
        }
      };
      verifyPayment();
    } else if (gateway === "paypal" && token) {
      const capturePayment = async () => {
        try {
          setLoading(true);
          const response = await client.post("payment/paypal/capture/", {
            paypal_order_id: token
          });
          setPaymentDetails(response.data);
          setError(null);
        } catch (err) {
          console.error("PayPal Capture error:", err);
          setError(err.response?.data?.detail || "Failed to capture your PayPal payment.");
        } finally {
          setLoading(false);
        }
      };
      capturePayment();
    }
  }, [session_id, gateway, token]);

  useEffect(() => {
    if (!loading) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(checkAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        Animated.stagger(100, [
          Animated.spring(slideUp1, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
          Animated.spring(slideUp2, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
          Animated.spring(slideUp3, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        ]),
      ]).start();

      // Confetti pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(confettiAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [loading]);

  const confettiColors = ["#d63384", "#f06292", "#4CAF50", "#635BFF", "#FF9800", "#00BCD4"];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#d63384" />
          <Text style={[styles.title, { marginTop: 20, fontSize: 20 }]}>Verifying Payment...</Text>
          <Text style={styles.message}>
            We are confirming your transaction details. Please don't close this page.
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={[styles.successCircleOuter, { backgroundColor: "rgba(244, 67, 54, 0.08)" }]}>
            <View style={[styles.successCircleMiddle, { backgroundColor: "rgba(244, 67, 54, 0.15)" }]}>
              <View style={[styles.successCircle, { backgroundColor: "#F44336", shadowColor: "#F44336" }]}>
                <Ionicons name="alert-circle-outline" size={48} color="#fff" />
              </View>
            </View>
          </View>
          <Text style={[styles.title, { color: "#F44336" }]}>Verification Failed</Text>
          <Text style={styles.message}>{error}</Text>
          
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: "#F44336", shadowColor: "#F44336" }]}
            onPress={() => {
              if (session_id) {
                setLoading(true);
                // Re-trigger verification
                client.get(`payment/verify-session/?session_id=${session_id}`)
                  .then(response => {
                    setPaymentDetails(response.data);
                    setError(null);
                  })
                  .catch(err => {
                    setError(err.response?.data?.detail || "Failed to verify your payment status.");
                  })
                  .finally(() => setLoading(false));
              } else if (gateway === "paypal" && token) {
                setLoading(true);
                client.post("payment/paypal/capture/", { paypal_order_id: token })
                  .then(response => {
                    setPaymentDetails(response.data);
                    setError(null);
                  })
                  .catch(err => {
                    setError(err.response?.data?.detail || "Failed to capture your PayPal payment.");
                  })
                  .finally(() => setLoading(false));
              }
            }}
          >
            <Ionicons name="refresh-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Retry Verification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Shop", { screen: "Payment" })}
          >
            <Text style={styles.secondaryButtonText}>Back to Payment Screen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const amountDisplay = paymentDetails
    ? `$${(paymentDetails.amount_total / 100).toFixed(2)}`
    : null;

  return (
    <View style={styles.container}>
      {/* Floating confetti dots */}
      {confettiColors.map((color, i) => (
        <Animated.View
          key={i}
          style={[
            styles.confettiDot,
            {
              backgroundColor: color,
              left: `${15 + i * 14}%`,
              top: `${8 + (i % 3) * 5}%`,
              opacity: confettiAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: i % 2 === 0 ? [0.3, 0.8, 0.3] : [0.8, 0.3, 0.8],
              }),
              transform: [
                {
                  translateY: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, i % 2 === 0 ? -15 : 15],
                  }),
                },
                {
                  scale: confettiAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.2, 0.8],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      <View style={styles.card}>
        {/* Success Circle */}
        <Animated.View
          style={[
            styles.successCircleOuter,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successCircleMiddle}>
            <View style={styles.successCircle}>
              <Animated.View style={{ opacity: checkAnim }}>
                <Ionicons name="checkmark" size={52} color="#fff" />
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Payment Successful! 🎉</Text>
          <Text style={styles.message}>
            Thank you for your purchase! Your order has been confirmed and is now being processed for shipment.
          </Text>
        </Animated.View>

        {/* Info Cards */}
        <Animated.View
          style={[
            styles.infoCard,
            { opacity: fadeAnim, transform: [{ translateY: slideUp1 }] },
          ]}
        >
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: "#e8f5e9" }]}>
              <Ionicons name="mail-outline" size={20} color="#4CAF50" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoLabel}>Confirmation Email</Text>
              <Text style={styles.infoValue}>
                {paymentDetails?.customer_email
                  ? `Sent to ${paymentDetails.customer_email}`
                  : "A receipt has been sent to your email"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {paymentDetails && (
          <Animated.View
            style={[
              styles.infoCard,
              { opacity: fadeAnim, transform: [{ translateY: slideUp2 }] },
            ]}
          >
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: "#e0f2fe" }]}>
                <Ionicons name="card-outline" size={20} color="#0284c7" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.infoLabel}>Payment Breakdown</Text>
                <Text style={styles.infoValue}>
                  Amount: {amountDisplay} {paymentDetails.currency?.toUpperCase()}{"\n"}
                  Ref: {paymentDetails.payment_intent || "Stripe Session"}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.infoCard,
            { opacity: fadeAnim, transform: [{ translateY: slideUp2 }] },
          ]}
        >
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: "#f3e5f5" }]}>
              <Ionicons name="cube-outline" size={20} color="#9c27b0" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoLabel}>Order Processing</Text>
              <Text style={styles.infoValue}>Your items are being prepared for delivery</Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideUp3 }], width: "100%" }}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Shop", { screen: "Products" })}
            activeOpacity={0.8}
          >
            <Ionicons name="bag-handle-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Shop", { screen: "Orders" })}
            activeOpacity={0.8}
          >
            <Ionicons name="receipt-outline" size={20} color="#d63384" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryButtonText}>View My Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate("Home")}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={18} color="#aaa" style={{ marginRight: 6 }} />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf2f7",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confettiDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 32,
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  successCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successCircleMiddle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2d2d2d",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#fafafa",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
  },
  infoValue: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: "#d63384",
    paddingVertical: 16,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f8bbd0",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#d63384",
    fontSize: 16,
    fontWeight: "700",
  },
  homeButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  homeButtonText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default PaymentSuccess;
