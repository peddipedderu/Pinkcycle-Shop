import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import client from "../../api/client";

const AddCategory = ({ navigation }) => {
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    try {
      const slug = name.toLowerCase().replace(/ /g, '-');
      await client.post("categories/", { name, slug });
      alert("Category added!");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      alert("Error adding category");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Category</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Category name"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save Category</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff1f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d63384",
    marginBottom: 20,
  },
  label: {
    color: "#c2185b",
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f8bbd0",
  },
  button: {
    backgroundColor: "#d63384",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddCategory;
