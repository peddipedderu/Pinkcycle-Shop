import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import client from "../../api/client";

const ProductDetail = ({ route, navigation }) => {
  const [product, setProduct] = useState(null);
  const { id } = route.params;

  const getProduct = async () => {
    try {
      const response = await client.get(`products/${id}/`);
      setProduct(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getProduct();
  }, [id]);

  if (!product) return <Text style={styles.loading}>Loading...</Text>;

  const getImageUrl = (path) => {
      if (!path) return "https://via.placeholder.com/250?text=No+Image";
      if (path.startsWith('http')) return path;
      return path;
  };

  const addToCart = async () => {
      try {
          await client.post('cart/add/', { product_id: product.id, quantity: 1, update: false });
          navigation.navigate('Shop', { screen: 'Cart' });
      } catch (error) {
          console.error(error);
          alert('Error adding to cart');
      }
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: getImageUrl(product.image) }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{product.category?.name}</Text>
        <Text style={styles.price}>{product.price} KES</Text>
        <Text style={styles.description}>{product.description}</Text>

        <TouchableOpacity style={styles.button} onPress={addToCart}>
            <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff1f5",
  },
  loading: {
    textAlign: "center",
    marginTop: 50,
    color: "#d63384",
  },
  image: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#d63384",
  },
  category: {
    fontSize: 18,
    color: "#f06292",
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "600",
    color: "#c2185b",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  button: {
    backgroundColor: "#d63384",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProductDetail;
