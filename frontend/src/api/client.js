import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL set specifically to the products endpoint as requested
const client = axios.create({
  baseURL: "https://pinkcycle.co.ke/api/",
  timeout: 10000,
});

// Logging interceptors for debugging & injecting token
client.interceptors.request.use(async (request) => {
  let token = null;
  if (Platform.OS === 'web') {
    token = localStorage.getItem('userToken');
  }
  if (!token) {
    try {
      token = await AsyncStorage.getItem('token');
    } catch (e) {
      console.log('Error reading token from AsyncStorage', e);
    }
  }

  if (token) { console.log("Injecting token into request");
    request.headers.Authorization = `Token ${token}`;
  }

  console.log('API Request:', request.baseURL + (request.url || ''));
  return request;
});

client.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export default client;
