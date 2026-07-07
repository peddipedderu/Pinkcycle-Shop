import React, { useState, useEffect } from 'react';
import { 
  TextInput, 
  TouchableOpacity, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  Platform 
} from 'react-native';
import { Formik } from 'formik';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from './../../api/client';
import styles from './loginForm_styles';
import validationSchema from './reg_valid';

const THEMES = [
  {
    id: 'pink',
    name: 'Sakura Dream',
    gradientColors: ['#fff1f5', '#ffe4e6'],
    primary: '#831843',
    cardBg: '#ffffff',
    text: '#1f2937',
    titleColor: '#831843',
    labelColor: '#4b5563',
    inputBg: '#f3f4f6',
    inputBorder: '#e5e7eb',
    inputText: '#1f2937',
    buttonBg: '#831843',
    buttonText: '#ffffff',
    linkText: '#831843',
    footerText: '#6b7280'
  },
  {
    id: 'dark',
    name: 'Midnight Neon',
    gradientColors: ['#0f172a', '#1e1b4b'],
    primary: '#6366f1',
    cardBg: '#1e293b',
    text: '#f8fafc',
    titleColor: '#a5b4fc',
    labelColor: '#cbd5e1',
    inputBg: '#334155',
    inputBorder: '#475569',
    inputText: '#f8fafc',
    buttonBg: '#6366f1',
    buttonText: '#ffffff',
    linkText: '#a5b4fc',
    footerText: '#94a3b8'
  },
  {
    id: 'teal',
    name: 'Teal Forest',
    gradientColors: ['#f0fdf4', '#dcfce7'],
    primary: '#0d9488',
    cardBg: '#ffffff',
    text: '#1f2937',
    titleColor: '#115e59',
    labelColor: '#374151',
    inputBg: '#f0fdf4',
    inputBorder: '#ccfbf1',
    inputText: '#111827',
    buttonBg: '#0d9488',
    buttonText: '#ffffff',
    linkText: '#0d9488',
    footerText: '#4b5563'
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    gradientColors: ['#fffbeb', '#fef3c7'],
    primary: '#d97706',
    cardBg: '#ffffff',
    text: '#1f2937',
    titleColor: '#92400e',
    labelColor: '#4b5563',
    inputBg: '#fffbeb',
    inputBorder: '#fef3c7',
    inputText: '#1f2937',
    buttonBg: '#d97706',
    buttonText: '#ffffff',
    linkText: '#d97706',
    footerText: '#6b7280'
  },
  {
    id: 'nordic',
    name: 'Nordic Frost',
    gradientColors: ['#f0f9ff', '#e0f2fe'],
    primary: '#0284c7',
    cardBg: '#ffffff',
    text: '#1f2937',
    titleColor: '#0369a1',
    labelColor: '#4b5563',
    inputBg: '#f0f9ff',
    inputBorder: '#e0f2fe',
    inputText: '#1f2937',
    buttonBg: '#0284c7',
    buttonText: '#ffffff',
    linkText: '#0284c7',
    footerText: '#6b7280'
  }
];

const AbstractShapes = ({ selectedThemeId }) => {
  const shapeOpacity = selectedThemeId === 'dark' ? 0.05 : 0.3;
  return (
    <>
      <View style={[styles.abstractShape, { width: 100, height: 100, top: '10%', left: '5%', backgroundColor: `rgba(255, 255, 255, ${shapeOpacity})` }]} />
      <View style={[styles.abstractShape, { width: 150, height: 150, bottom: '15%', right: '10%', backgroundColor: `rgba(255, 255, 255, ${shapeOpacity})` }]} />
      <View style={[styles.abstractShape, { width: 80, height: 80, top: '40%', right: '5%', backgroundColor: `rgba(255, 255, 255, ${shapeOpacity})` }]} />
    </>
  );
};

const RegForm = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState('pink');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        let savedTheme = null;
        if (Platform.OS === 'web') {
          savedTheme = localStorage.getItem('registrationTheme');
        } else {
          savedTheme = await AsyncStorage.getItem('registrationTheme');
        }
        if (savedTheme && THEMES.some(t => t.id === savedTheme)) {
          setSelectedThemeId(savedTheme);
        }
      } catch (e) {
        console.warn('Error loading theme:', e);
      }
    };
    loadTheme();
  }, []);

  const handleThemeChange = async (themeId) => {
    setSelectedThemeId(themeId);
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('registrationTheme', themeId);
      } else {
        await AsyncStorage.setItem('registrationTheme', themeId);
      }
    } catch (e) {
      console.warn('Error saving theme:', e);
    }
  };

  const currentTheme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];

  const handleSubmit = async (values) => {
    try {
      console.log('Attempting registration:', values);
      const data = {
        username: values.username,
        email: values.email,
        password: values.password,
        full_name: values.fullName,
      };
      await client.post('register/', data);
      
      if (Platform.OS === 'web') {
          window.location.href = '/login';
      } else {
          navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      if (Platform.OS === 'web') {
          window.location.href = '/login';
      } else {
          navigation.navigate('Login');
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
    if (platform === 'google') {
       window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=189134411609-am4nojahfj6sku5phuekpbtjme4q66h7.apps.googleusercontent.com&redirect_uri=' + redirectUri + '&scope=openid%20profile%20email';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={currentTheme.gradientColors}
        style={styles.gradient}
      >
        <AbstractShapes selectedThemeId={selectedThemeId} />
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', width: '100%', alignItems: 'center' }}>
          <View style={[styles.card, { backgroundColor: currentTheme.cardBg }]}>
            
            {/* Elegant Theme Picker */}
            <View style={{ marginBottom: 20, alignItems: 'center' }}>
              <Text style={{ 
                fontSize: 11, 
                fontWeight: '700', 
                color: currentTheme.labelColor, 
                textTransform: 'uppercase', 
                letterSpacing: 1, 
                marginBottom: 10 
              }}>
                Choose Page Theme
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                {THEMES.map((theme) => (
                  <TouchableOpacity
                    key={theme.id}
                    onPress={() => handleThemeChange(theme.id)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: theme.primary,
                      borderWidth: selectedThemeId === theme.id ? 2.5 : 0.5,
                      borderColor: selectedThemeId === theme.id 
                        ? (theme.id === 'dark' ? '#ffffff' : '#111827') 
                        : 'rgba(156, 163, 175, 0.5)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.15,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                    activeOpacity={0.8}
                  >
                    {selectedThemeId === theme.id && (
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={[styles.title, { color: currentTheme.titleColor, marginBottom: 16 }]}>
              Create your account
            </Text>

            <Formik
              initialValues={{ fullName: '', username: '', email: '', password: '', confirmPassword: '' }}
              onSubmit={handleSubmit}
              validationSchema={validationSchema}
            >
              {({ handleChange, handleSubmit, values, errors }) => (
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: currentTheme.labelColor }]}>Full Name</Text>
                    <TextInput
                      style={[styles.textBox, { 
                        backgroundColor: currentTheme.inputBg, 
                        borderColor: currentTheme.inputBorder, 
                        color: currentTheme.inputText 
                      }]}
                      value={values.fullName}
                      placeholder='John Doe'
                      placeholderTextColor={selectedThemeId === 'dark' ? '#94a3b8' : '#9ca3af'}
                      onChangeText={handleChange('fullName')}
                    />
                    {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: currentTheme.labelColor }]}>Username</Text>
                    <TextInput
                      style={[styles.textBox, { 
                        backgroundColor: currentTheme.inputBg, 
                        borderColor: currentTheme.inputBorder, 
                        color: currentTheme.inputText 
                      }]}
                      value={values.username}
                      placeholder='babu008'
                      placeholderTextColor={selectedThemeId === 'dark' ? '#94a3b8' : '#9ca3af'}
                      onChangeText={handleChange('username')}
                      autoCapitalize='none'
                    />
                    {errors.username && <Text style={styles.error}>{errors.username}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: currentTheme.labelColor }]}>Email Address</Text>
                    <TextInput
                      style={[styles.textBox, { 
                        backgroundColor: currentTheme.inputBg, 
                        borderColor: currentTheme.inputBorder, 
                        color: currentTheme.inputText 
                      }]}
                      value={values.email}
                      placeholder='you@example.com'
                      placeholderTextColor={selectedThemeId === 'dark' ? '#94a3b8' : '#9ca3af'}
                      onChangeText={handleChange('email')}
                      autoCapitalize='none'
                      keyboardType='email-address'
                    />
                    {errors.email && <Text style={styles.error}>{errors.email}</Text>}
                  </View>

                  <View style={styles.rowContainer}>
                    <View style={[styles.inputGroup, styles.halfInput]}>
                      <Text style={[styles.label, { color: currentTheme.labelColor }]}>Password</Text>
                      <View style={styles.passwordContainer}>
                        <TextInput
                          style={[styles.textBox, { 
                            backgroundColor: currentTheme.inputBg, 
                            borderColor: currentTheme.inputBorder, 
                            color: currentTheme.inputText,
                            width: '100%'
                          }]}
                          value={values.password}
                          placeholder='••••••••'
                          placeholderTextColor={selectedThemeId === 'dark' ? '#94a3b8' : '#9ca3af'}
                          secureTextEntry={!showPassword}
                          onChangeText={handleChange('password')}
                        />
                        <TouchableOpacity 
                          style={styles.eyeIcon} 
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Ionicons 
                            name={showPassword ? "eye-off" : "eye"} 
                            size={20} 
                            color={currentTheme.primary} 
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.password && <Text style={styles.error}>{errors.password}</Text>}
                    </View>

                    <View style={[styles.inputGroup, styles.halfInput]}>
                      <Text style={[styles.label, { color: currentTheme.labelColor }]}>Confirm Password</Text>
                      <View style={styles.passwordContainer}>
                        <TextInput
                          style={[styles.textBox, { 
                            backgroundColor: currentTheme.inputBg, 
                            borderColor: currentTheme.inputBorder, 
                            color: currentTheme.inputText,
                            width: '100%'
                          }]}
                          value={values.confirmPassword}
                          placeholder='••••••••'
                          placeholderTextColor={selectedThemeId === 'dark' ? '#94a3b8' : '#9ca3af'}
                          secureTextEntry={!showConfirmPassword}
                          onChangeText={handleChange('confirmPassword')}
                        />
                        <TouchableOpacity 
                          style={styles.eyeIcon} 
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <Ionicons 
                            name={showConfirmPassword ? "eye-off" : "eye"} 
                            size={20} 
                            color={currentTheme.primary} 
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.addButton, { 
                      backgroundColor: currentTheme.buttonBg,
                      shadowColor: currentTheme.buttonBg 
                    }]} 
                    onPress={handleSubmit}
                  >
                    <Text style={[styles.buttonText, { color: currentTheme.buttonText }]}>Register</Text>
                  </TouchableOpacity>

                  <View style={styles.dividerContainer}>
                    <View style={[styles.dividerLine, { backgroundColor: selectedThemeId === 'dark' ? '#475569' : '#e5e7eb' }]} />
                    <Text style={[styles.dividerText, { color: selectedThemeId === 'dark' ? '#94a3b8' : '#9ca3af' }]}>Or, register with</Text>
                    <View style={[styles.dividerLine, { backgroundColor: selectedThemeId === 'dark' ? '#475569' : '#e5e7eb' }]} />
                  </View>

                  <View style={styles.socialContainer}>
                    <TouchableOpacity 
                      style={[styles.socialButton, { 
                        backgroundColor: currentTheme.cardBg, 
                        borderColor: currentTheme.inputBorder 
                      }]}
                      onPress={() => handleSocialLogin('google')}
                    >
                      <FontAwesome5 name="google" size={24} color="#EA4335" />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.footerText, { color: currentTheme.footerText }]}>
                    Already have an account?{' '}
                    <Text 
                      style={[styles.loginLink, { color: currentTheme.linkText }]} 
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          window.location.href = '/login';
                        } else {
                          navigation.navigate('Login');
                        }
                      }}
                    >
                      Sign in
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

export default RegForm;
