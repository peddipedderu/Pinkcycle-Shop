import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import client from "../../api/client";

const Categories = ({ navigation }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    client.get("categories/").then((res) => {
        const data = res.data.results || res.data;
        setCategories(data);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
          <Text style={styles.title}>Categories</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddCategory")}
          >
              <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("Products", { categoryId: item.id })}
          >
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff1f5",
    padding: 20,
  },
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d63384",
  },
  addButton: {
      backgroundColor: '#d63384',
      padding: 8,
      borderRadius: 8,
  },
  addButtonText: {
      color: 'white',
      fontWeight: 'bold'
  },
  item: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f8bbd0",
  },
  name: {
    fontSize: 18,
    color: "#c2185b",
  },
});

export default Categories;
