import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from "react-native";
import client from "../../api/client";

const { width } = Dimensions.get("window");

const InputField = ({ label, value, onChangeText, placeholder, error, style, keyboardType }) => (
  <View style={[styles.inputContainer, style]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType || "default"}
      autoCapitalize="none"
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const Donate = ({ navigation }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    amount: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const handleDonate = async () => {
    setErrors({});
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) {
      setErrors({ amount: "Please enter a valid donation amount." });
      return;
    }

    try {
      const response = await client.post("donations/", form);
      if (response.status === 201) {
        Alert.alert("Success", "Thank you for your generous donation!");
        navigation.navigate("PinkCycleHome");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again later.");
      }
    }
  };

  const setFixedAmount = (amount) => {
    setForm({ ...form, amount: amount.toString() });
  };

  return (
    <ScrollView style={styles.outerContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Make a Donation</Text>
        <Text style={styles.subtitle}>Your support helps us empower more women through technology.</Text>

        <View style={styles.amountPresets}>
          {[10, 25, 50, 100].map((amt) => (
            <TouchableOpacity 
              key={amt} 
              style={[styles.presetBtn, form.amount === amt.toString() && styles.presetBtnActive]}
              onPress={() => setFixedAmount(amt)}
            >
              <Text style={[styles.presetBtnText, form.amount === amt.toString() && styles.presetBtnTextActive]}>${amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <InputField
          label="Donation Amount ($)"
          placeholder="0.00"
          value={form.amount}
          onChangeText={(text) => setForm({ ...form, amount: text })}
          error={errors.amount}
          keyboardType="numeric"
        />

        <InputField
          label="Full Name"
          placeholder="Jane Doe"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          error={errors.name}
        />

        <InputField
          label="Email Address"
          placeholder="janedoe@example.com"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          error={errors.email}
          keyboardType="email-address"
        />

        <InputField
          label="Message (Optional)"
          placeholder="Why are you donating?"
          value={form.message}
          onChangeText={(text) => setForm({ ...form, message: text })}
          error={errors.message}
          style={styles.textArea}
        />

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleDonate}
        >
          <Text style={styles.primaryButtonText}>Donate Now</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
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
    maxWidth: 600,
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
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 30,
    textAlign: "center",
  },
  amountPresets: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f8bbd0",
    alignItems: "center",
    backgroundColor: "white",
  },
  presetBtnActive: {
    backgroundColor: "#d81b60",
    borderColor: "#d81b60",
  },
  presetBtnText: {
    color: "#d81b60",
    fontWeight: "bold",
  },
  presetBtnTextActive: {
    color: "white",
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
  primaryButton: {
    backgroundColor: "#d81b60",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
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
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#6c757d",
    fontSize: 16,
  },
});

export default Donate;
