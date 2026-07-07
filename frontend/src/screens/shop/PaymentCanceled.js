import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import client from "../../api/client";

const { width } = Dimensions.get("window");

const PaymentCanceled = ({ navigation }) => {
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;
  const slideUp1 = useRef(new Animated.Value(40)).current;
  const slideUp2 = useRef(new Animated.Value(40)).current;
  const slideUp3 = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await client.get("payment/summary/");
        setPaymentSummary(response.data);
      } catch (err) {
        console.error("Failed to fetch payment summary on cancellation:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

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
          Animated.timing(iconAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        Animated.stagger(100, [
          Animated.spring(slideUp1, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
          Animated.spring(slideUp2, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
          Animated.spring(slideUp3, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        ]),
      ]).start();

      // Floating dots pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotsAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(dotsAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [loading]);

  const dotColors = ["#FF9800", "#FFB74D", "#d63384", "#f06292", "#FFA726", "#FFE0B2"];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={[styles.title, { marginTop: 20, fontSize: 20 }]}>Loading details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floating animated dots */}
      {dotColors.map((color, i) => (
        <Animated.View
          key={i}
          style={[
            styles.floatingDot,
            {
              backgroundColor: color,
              left: `${15 + i * 14}%`,
              top: `${8 + (i % 3) * 5}%`,
              opacity: dotsAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: i % 2 === 0 ? [0.3, 0.8, 0.3] : [0.8, 0.3, 0.8],
              }),
              transform: [
                {
                  translateY: dotsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, i % 2 === 0 ? -15 : 15],
                  }),
                },
                {
                  scale: dotsAnim.interpolate({
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
        {/* Cancel Circle */}
        <Animated.View
          style={[
            styles.cancelCircleOuter,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.cancelCircleMiddle}>
            <View style={styles.cancelCircle}>
              <Animated.View style={{ opacity: iconAnim }}>
                <Ionicons name="close" size={52} color="#fff" />
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>Payment Canceled</Text>
          <Text style={styles.message}>
            Your payment was not completed and the transaction has been canceled. Don't worry — no charges have been made to your account.
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
              <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoLabel}>No Charges Made</Text>
              <Text style={styles.infoValue}>Your card has not been charged for this transaction</Text>
            </View>
          </View>
        </Animated.View>

        {paymentSummary && paymentSummary.items && paymentSummary.items.length > 0 && (
          <Animated.View
            style={[
              styles.infoCard,
              { opacity: fadeAnim, transform: [{ translateY: slideUp2 }] },
            ]}
          >
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: "#ffebee" }]}>
                <Ionicons name="cart-outline" size={20} color="#f44336" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.infoLabel}>Unpaid Cart Details</Text>
                <Text style={styles.infoValue}>
                  Total Amount: ${parseFloat(paymentSummary.total_amount).toFixed(2)}{"\n"}
                  Items: {paymentSummary.items.map(i => `${i.product} (x${i.quantity})`).join(", ")}
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
            <View style={[styles.infoIcon, { backgroundColor: "#fff3e0" }]}>
              <Ionicons name="cart-outline" size={20} color="#FF9800" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoLabel}>Items Preserved</Text>
              <Text style={styles.infoValue}>Your cart items are still available for checkout</Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideUp3 }], width: "100%" }}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Shop", { screen: "Payment" })}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Shop", { screen: "Cart" })}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={20} color="#d63384" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryButtonText}>View Cart</Text>
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
  floatingDot: {
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
  cancelCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 152, 0, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  cancelCircleMiddle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 152, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF9800",
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

export default PaymentCanceled;
