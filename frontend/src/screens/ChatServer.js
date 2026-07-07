import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import client from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatServer = ({ route, navigation }) => {
  const { room, title } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const ws = useRef(null);
  const scrollViewRef = useRef();

  useEffect(() => {
    const checkAuth = async () => {
      let userToken = null;
      if (Platform.OS === 'web') {
        userToken = localStorage.getItem('userToken');
      }
      if (!userToken) {
        userToken = await AsyncStorage.getItem('token');
      }

      if (!userToken) {
        navigation.navigate('Login', { returnTo: 'ChatServer', room, title });
        return;
      }

      setToken(userToken);
      fetchHistory();
      connectWebSocket(userToken);
    };

    checkAuth();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [room]);

  const fetchHistory = async () => {
    try {
      const res = await client.get('join-us/chat/history/' + room + '/');
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = (userToken) => {
    const host = Platform.OS === 'web' ? window.location.host : '102.220.169.172';
    const wsUrl = 'ws://' + host + '/ws/chat/' + room + '/?token=' + userToken;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, {
        username: data.username,
        message: data.message,
        timestamp: new Date().toISOString()
      }]);
    };

    ws.current.onerror = (e) => {
      console.error('WebSocket Error:', e.message);
    };

    ws.current.onclose = (e) => {
      console.log('WebSocket Closed:', e.code, e.reason);
    };
  };

  const sendMessage = () => {
    if (inputText.trim() === '' || !ws.current) return;

    const data = {
      message: inputText,
      username: 'User'
    };

    ws.current.send(JSON.stringify(data));
    setInputText('');
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#C27D86" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#4A1521" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((m, index) => (
          <View key={index} style={[
            styles.messageBubble,
            m.username === 'User' ? styles.myMessage : styles.theirMessage
          ]}>
            <Text style={styles.username}>{m.username}</Text>
            <Text style={styles.messageText}>{m.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <MaterialCommunityIcons name="send" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A1521',
  },
  messageList: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#C27D86',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FCECEF',
    borderWidth: 1,
    borderColor: '#FCECEF',
  },
  username: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A1521',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#4A1521',
  },
  timestamp: {
    fontSize: 10,
    color: '#C27D86',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#FCECEF',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    color: '#4A1521',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C27D86',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatServer;
