import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MessageReceived = ({ route, navigation }) => {
  const data = route.params?.data || {
    status: 'success',
    message: 'Your message has been processed by our systems.'
  };

  const loading = false;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#db2777" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#db2777" />
          </View>
          <Text style={styles.title}>{data?.status === 'success' ? 'Success!' : 'Received'}</Text>
          <Text style={styles.message}>
            {data?.message || 'Your message has been processed by our systems.'}
          </Text>
          <TouchableOpacity 
            style={styles.btn} 
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.btnText}>Back to Homepage</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff1f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff1f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#db2777',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#831843',
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    color: '#831843',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    opacity: 0.8,
  },
  btn: {
    backgroundColor: '#db2777',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default MessageReceived;
