import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import client from "../../api/client";

const { width } = Dimensions.get("window");

const InputField = ({ label, value, onChangeText, placeholder, error, style }) => (
  <View style={[styles.inputContainer, style]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const Checkout = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
  });

  const [errors, setErrors] = useState({});

  const handleContinueToPayment = async () => {
    setErrors({});
    try {
      const response = await client.post("checkout/shipping/", form);
      if (response.data.success) {
        navigation.navigate("Shop", { 
          screen: "Payment", 
          params: { 
            checkoutId: response.data.data.checkoutId,
            amount: response.data.data.total_amount 
          } 
        });
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert("Error saving shipping details. Make sure your cart is not empty.");
      }
    }
  };

  return (
    <ScrollView style={styles.outerContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Shipping Details</Text>

        <View style={styles.row}>
          <InputField
            label="First Name"
            placeholder="Jane"
            value={form.firstName}
            onChangeText={(text) => setForm({ ...form, firstName: text })}
            error={errors.firstName}
            style={styles.flex1}
          />
          <View style={{ width: 15 }} />
          <InputField
            label="Last Name"
            placeholder="Doe"
            value={form.lastName}
            onChangeText={(text) => setForm({ ...form, lastName: text })}
            error={errors.lastName}
            style={styles.flex1}
          />
        </View>

        <InputField
          label="Email Address"
          placeholder="janedoe@example.com"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          error={errors.email}
        />

        <InputField
          label="Shipping Address"
          placeholder="123 Main Street, Apt 4B"
          value={form.address}
          onChangeText={(text) => setForm({ ...form, address: text })}
          error={errors.address}
        />

        <View style={styles.row}>
          <InputField
            label="Postal Code"
            placeholder="10001"
            value={form.postalCode}
            onChangeText={(text) => setForm({ ...form, postalCode: text })}
            error={errors.postalCode}
            style={styles.flex1}
          />
          <View style={{ width: 15 }} />
          <InputField
            label="City"
            placeholder="New York"
            value={form.city}
            onChangeText={(text) => setForm({ ...form, city: text })}
            error={errors.city}
            style={styles.flex1}
          />
        </View>

        <View style={[styles.row, styles.buttonRow]}>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Back to Cart</Text>
          </TouchableOpacity>
          <View style={{ width: 15 }} />
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleContinueToPayment}
          >
            <Text style={styles.primaryButtonText}>Continue to Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#fff0f6",
  },
  scrollContent: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: 700,
    backgroundColor: "white",
    padding: 30,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#c2185b",
    marginBottom: 30,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    width: "100%",
  },
  flex1: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f8bbd0",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
  buttonRow: {
    marginTop: 20,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: "#d81b60",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#d81b60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "white",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d81b60",
  },
  secondaryButtonText: {
    color: "#d81b60",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Checkout;
