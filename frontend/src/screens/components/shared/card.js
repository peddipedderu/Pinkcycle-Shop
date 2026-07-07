import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";

const Card = ({ logo, title, details }) => {
    // Robust image handling for relative paths from Django
    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/250?text=No+Image";
        if (path.startsWith('http')) return path;
        // Use relative path for web to work across different domains/localhost
        return path;
    };

    return (
        <View style={styles.container}>
            <Image
                style={styles.logo}
                source={{ uri: getImageUrl(logo) }}
                resizeMode="cover"
            />
            <View style={styles.inner}>
                <Text style={styles.title}>{ title }</Text>
                <Text style={styles.details}>{ details }</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        backgroundColor: "white",
        overflow: "hidden",
        flex: 1,
        borderRadius: 8, // Sharper corners for professional look
        borderWidth: 1,
        borderColor: "#fce7f3",
        elevation: 2,
        shadowColor: "#db2777",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    logo: {
        width: "100%",
        height: 250, // Resized for better visibility
    },
    inner: {
        padding: 20,
        flex: 1,
        justifyContent: "center",
        width: "100%",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 20,
        marginVertical: 5,
        fontWeight: "700",
        color: "#1a0614",
        textAlign: "left",
    },
    details: {
        fontSize: 16,
        marginVertical: 5,
        fontWeight: "600",
        color: "#db2777",
        textAlign: "left",
    },
});

export default Card;
