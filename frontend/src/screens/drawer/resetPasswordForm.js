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
  password: Yup.string()
    .min(6, "Must be at least 6 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

const AbstractShapes = () => (
  <>
    <View style={[styles.abstractShape, { width: 100, height: 100, top: '10%', left: '5%' }]} />
    <View style={[styles.abstractShape, { width: 150, height: 150, bottom: '15%', right: '10%' }]} />
    <View style={[styles.abstractShape, { width: 80, height: 80, top: '40%', right: '5%' }]} />
  </>
);

const ResetPasswordForm = ({ navigation, route }) => {
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Extract uid and token from route.params or URL search query on web
  let uid = route.params?.uid;
  let token = route.params?.token;

  if (Platform.OS === 'web') {
    const searchParams = new URLSearchParams(window.location.search);
    uid = uid || searchParams.get('uid');
    token = token || searchParams.get('token');
  }

  const handleSubmit = async (values) => {
    if (!uid || !token) {
      setErrorMessage('Invalid reset link: missing token or user identifier.');
      return;
    }

    try {
      setStatusMessage('');
      setErrorMessage('');
      setLoading(true);
      const response = await client.post('password_reset_confirm/', {
        uid: uid,
        token: token,
        password: values.password,
        confirm_password: values.confirmPassword,
      });
      
      setStatusMessage(response.data.detail || 'Password reset successfully.');
      setTimeout(() => {
        if (Platform.OS === 'web') {
          window.location.href = '/login';
        } else {
          navigation.navigate('Login');
        }
      }, 2000);
    } catch (error) {
      console.error('Reset Password Confirm Error:', error);
      const msg = error.response?.data?.detail || 'Failed to reset password. Link may be invalid or expired.';
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={{ textAlign: 'center', color: '#6b7280', marginBottom: 20, fontSize: 14 }}>
              Enter your new password below.
            </Text>
            
            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              onSubmit={handleSubmit}
              validationSchema={validationSchema}
            >
              {({ handleChange, handleSubmit, values, errors }) => (
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Create Password</Text>
                    <TextInput
                      style={styles.textBox}
                      value={values.password}
                      placeholder='••••••••'
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      onChangeText={handleChange('password')}
                    />
                    {errors.password && <Text style={styles.error}>{errors.password}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Verify Password</Text>
                    <TextInput
                      style={styles.textBox}
                      value={values.confirmPassword}
                      placeholder='••••••••'
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      onChangeText={handleChange('confirmPassword')}
                    />
                    {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
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
                    <Text style={styles.buttonText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ResetPasswordForm;
