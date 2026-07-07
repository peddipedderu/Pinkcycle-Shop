import React, { useState } from 'react';
import { 
  TextInput, 
  TouchableOpacity, 
  Text, 
  View, 
  SafeAreaView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { Formik } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Yup from "yup";
import client from './../../api/client';
import styles from './loginForm_styles';

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Required"),
});

const AbstractShapes = () => (
  <>
    <View style={[styles.abstractShape, { width: 100, height: 100, top: '10%', left: '5%' }]} />
    <View style={[styles.abstractShape, { width: 150, height: 150, bottom: '15%', right: '10%' }]} />
    <View style={[styles.abstractShape, { width: 80, height: 80, top: '40%', right: '5%' }]} />
  </>
);

const ForgotPasswordForm = ({ navigation }) => {
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setStatusMessage('');
      setErrorMessage('');
      setLoading(true);
      const response = await client.post('password_reset/', values);
      setStatusMessage(response.data.detail || 'Password reset link sent successfully.');
    } catch (error) {
      console.error('Forgot Password Error:', error);
      const msg = error.response?.data?.detail || 'An error occurred. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={{ textAlign: 'center', color: '#6b7280', marginBottom: 20, fontSize: 14 }}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            
            <Formik
              initialValues={{ email: '' }}
              onSubmit={handleSubmit}
              validationSchema={validationSchema}
            >
              {({ handleChange, handleSubmit, values, errors }) => (
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                      style={styles.textBox}
                      value={values.email}
                      placeholder='you@example.com'
                      placeholderTextColor="#9ca3af"
                      onChangeText={handleChange('email')}
                      autoCapitalize='none'
                      keyboardType='email-address'
                    />
                    {errors.email && <Text style={styles.error}>{errors.email}</Text>}
                  </View>

                  {statusMessage ? (
                    <Text style={{ textAlign: 'center', color: '#16a34a', marginBottom: 12, fontWeight: '600', fontSize: 13 }}>
                      {statusMessage}
                    </Text>
                  ) : null}

                  {errorMessage ? (
                    <Text style={[styles.error, { textAlign: 'center', marginBottom: 12, marginTop: 4, fontWeight: '600', fontSize: 13 }]}>
                      {errorMessage}
                    </Text>
                  ) : null}

                  <TouchableOpacity 
                    style={[styles.addButton, loading && { opacity: 0.7 }]} 
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Link'}</Text>
                  </TouchableOpacity>

                  <Text style={styles.footerText}>
                    Remembered password?{' '}
                    <Text 
                      style={styles.loginLink} 
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          window.location.href = '/login';
                        } else {
                          navigation.navigate('Login');
                        }
                      }}
                    >
                      Sign In
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

export default ForgotPasswordForm;
