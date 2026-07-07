import React, { useRef, useState } from 'react';
import { 
  TextInput, 
  TouchableOpacity, 
  Text, 
  View, 
  SafeAreaView, 
  Platform, 
  Animated, 
  ScrollView 
} from 'react-native';
import { Formik } from 'formik';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import client from './../../api/client';
import styles from './loginForm_styles';
import validationSchema from './login_valid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AbstractShapes = () => (
  <>
    <View style={[styles.abstractShape, { width: 100, height: 100, top: '10%', left: '5%' }]} />
    <View style={[styles.abstractShape, { width: 150, height: 150, bottom: '15%', right: '10%' }]} />
    <View style={[styles.abstractShape, { width: 80, height: 80, top: '40%', right: '5%' }]} />
  </>
);

const LoginForm = ({ navigation, route }) => {
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (values) => {
    try {
      setLoginError('');
      console.log('Attempting login for:', values.username);
      const response = await client.post('login/', values);
      const { token } = response.data;
      
      if (token) {
        if (Platform.OS === 'web') {
          localStorage.setItem('userToken', token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        console.log('Login successful');
        const returnTo = route.params?.returnTo;
        const room = route.params?.room;
        const title = route.params?.title;
        
        if (Platform.OS === 'web') {
          if (returnTo === 'ChatServer') {
            window.location.href = '/join-us/forums/chat/' + room;
          } else {
            window.location.href = '/account';
          }
        } else {
          if (returnTo === 'ChatServer') {
            navigation.navigate('ChatServer', { room, title });
          } else {
            navigation.navigate('Account');
          }
        }
      } else {
        setLoginError('Login failed: No token received from server.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      const msg = error.response?.data?.detail || error.message || '';
      if (msg.toLowerCase().includes('credential') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('not found')) {
        setLoginError('Username or password incorrect');
      } else {
        setLoginError(msg || 'Username or password incorrect');
      }
    }
  };

  const handleSocialLogin = (platform) => {
    if (Platform.OS !== 'web') {
      alert('Social login is only available on web for now.');
      return;
    }
    const origin = window.location.origin.replace(/\/$/, '');
    const redirectUri = encodeURIComponent(origin + '/account');
    let authUrl = '';
    if (platform === 'google') {
      authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=189134411609-am4nojahfj6sku5phuekpbtjme4q66h7.apps.googleusercontent.com&redirect_uri=' + redirectUri + '&scope=openid%20profile%20email&prompt=consent';
    }
    if (authUrl) window.location.href = authUrl;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fff1f5', '#ffe4e6']}
        style={styles.gradient}
      >
        <AbstractShapes />
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', width: '100%', alignItems: 'center' }}>
          <View style={styles.card}>
            <Text style={styles.title}>Sign into your account</Text>
            
            <Formik
              initialValues={{ username: 'babu008', password: '' }}
              onSubmit={handleSubmit}
              validationSchema={validationSchema}
            >
              {({ handleChange, handleSubmit, values, errors }) => (
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                      style={styles.textBox}
                      value={values.username}
                      placeholder='babu008'
                      placeholderTextColor="#9ca3af"
                      onChangeText={handleChange('username')}
                      autoCapitalize='none'
                    />
                    {errors.username && <Text style={styles.error}>{errors.username}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.textBox}
                        value={values.password}
                        placeholder='••••••••'
                        placeholderTextColor="#9ca3af"
                        secureTextEntry
                        onChangeText={handleChange('password')}
                      />
                    </View>
                    {errors.password && <Text style={styles.error}>{errors.password}</Text>}
                    
                    <TouchableOpacity 
                      style={styles.forgotPassword}
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          window.location.href = '/forgot_password';
                        } else {
                          navigation.navigate('ForgotPassword');
                        }
                      }}
                    >
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>

                  {loginError ? (
                    <Text style={[styles.error, { textAlign: 'center', marginBottom: 12, marginTop: 4, fontWeight: '600', fontSize: 13 }]}>
                      {loginError}
                    </Text>
                  ) : null}

                  <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit</Text>
                  </TouchableOpacity>

                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or, login with</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.socialContainer}>
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => handleSocialLogin('google')}
                    >
                      <FontAwesome5 name="google" size={24} color="#EA4335" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.footerText}>
                    New here? Create an account{' '}
                    <Text style={styles.loginLink} onPress={() => navigation.navigate('Registration')}>
                      Register
                    </Text>
                  </Text>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LoginForm;
