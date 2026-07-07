import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native";
import client from "../../api/client";
import PhotoPicker from "../components/shared/photo";

const AddProduct = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [photo, setPhoto] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState("Select a category");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    available: true,
    category: "",
  });

  useEffect(() => {
    client.get("categories/").then(res => {
        const data = res.data.results || res.data;
        setCategories(data);
        if (data.length > 0) {
            setForm(f => ({ ...f, category: data[0].id }));
            setSelectedCategoryName(data[0].name);
        }
    });
  }, []);

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("name", form.name);
    data.append("slug", form.name.toLowerCase().replace(/ /g, '-'));
    data.append("category", form.category);
    data.append("description", form.description);
    data.append("price", form.price);
    data.append("available", form.available);

    if (photo) {
        data.append("image", {
          uri: photo,
          name: "product.jpg",
          type: "image/jpg",
        });
    }

    try {
      await client.post("products/", data, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Product added!");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      alert("Error adding product");
    }
  };

  const selectCategory = (cat) => {
      setForm({ ...form, category: cat.id });
      setSelectedCategoryName(cat.name);
      setShowCategoryDropdown(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

      <PhotoPicker photo={photo} onPressPhoto={setPhoto} />

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />

      <Text style={styles.label}>Category</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
      >
          <Text style={styles.dropdownButtonText}>{selectedCategoryName}</Text>
      </TouchableOpacity>

      {showCategoryDropdown && (
          <View style={styles.dropdownMenu}>
              {categories.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.dropdownItem}
                    onPress={() => selectCategory(c)}
                  >
                      <Text style={styles.dropdownItemText}>{c.name}</Text>
                  </TouchableOpacity>
              ))}
          </View>
      )}

      <Text style={styles.label}>Price (KES)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.price}
        onChangeText={(text) => setForm({ ...form, price: text })}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
      />

      <View style={styles.row}>
          <Text style={styles.label}>Available</Text>
          <Switch
            value={form.available}
            onValueChange={val => setForm({...form, available: val})}
            trackColor={{ false: "#767577", true: "#f8bbd0" }}
            thumbColor={form.available ? "#d63384" : "#f4f3f4"}
          />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save Product</Text>
      </TouchableOpacity>
    </ScrollView>
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
  dropdownButton: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#f8bbd0",
  },
  dropdownButtonText: {
    color: "#c2185b",
  },
  dropdownMenu: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f8bbd0",
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fff1f5",
  },
  dropdownItemText: {
    color: "#d63384",
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
  },
  button: {
    backgroundColor: "#d63384",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddProduct;
