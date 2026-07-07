import React, { useState, useEffect } from "react";
import { StyleSheet, SafeAreaView, FlatList, View, TouchableOpacity, Text, TextInput, ActivityIndicator } from "react-native";
import client from "../../api/client";
import Card from "../components/shared/card";

const ProductList = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getProducts = async () => {
    setLoading(true);
    try {
      console.log("Fetching all products...");
      const response = await client.get('products/');
      if (response.data) {
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (response.data.results && Array.isArray(response.data.results)) {
          setProducts(response.data.results);
        } else {
          console.error("Invalid response format:", response.data);
        }
      }
    } catch (error) {
      console.error("Critical Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const filteredBySearch = products.filter(p =>
    p.name && p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={styles.loadingText}>Fetching Products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Our Pink Shop</Text>

        <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor="#f06292"
            value={search}
            onChangeText={setSearch}
        />

        <FlatList
          numColumns={2}
          columnWrapperStyle={styles.row}
          data={filteredBySearch}
          keyExtractor={(item) => (item.id || Math.random()).toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>No products found.</Text>}
          refreshing={loading}
          onRefresh={getProducts}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ flex: 1, margin: 5 }}
              onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
            >
              <Card
                logo={item.image}
                title={item.name}
                details={`KES ${parseFloat(item.price).toLocaleString()}`}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    color: "#db2777",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 2,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a0614",
    textAlign: "left",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  searchInput: {
      backgroundColor: "#fdf2f8",
      padding: 15,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: "#fce7f3",
      color: "#db2777",
      fontSize: 14,
  },
  row: {
    justifyContent: "space-between",
  },
  emptyText: {
    textAlign: 'center',
    color: '#9d174d',
    marginTop: 50,
    opacity: 0.5,
  },
});

export default ProductList;
