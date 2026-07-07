import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
  
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import client from '../../api/client';

const { width } = Dimensions.get('window');

const GlassCard = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>
    {children}
  </View>
);

const StatItem = ({ icon, label, value, color }) => (
  <View style={styles.statItem}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const Account = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '' });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const processingAuth = useRef(false);
  useEffect(() => {
    const initAccount = async () => {
      if (processingAuth.current) return;
      
      if (Platform.OS === 'web') {
        const hash = window.location.hash;
        const search = window.location.search;

        if (hash && hash.includes('access_token')) {
          processingAuth.current = true;
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          if (accessToken) {
            try {
              const response = await client.post('account/google_login/', { access_token: accessToken });
              if (response.data.token) {
                localStorage.setItem('userToken', response.data.token);
                window.location.hash = '';
                await fetchUserData(response.data.token);
                return;
              }
            } catch (err) {
              console.error("Token exchange failed:", err);
            }
          }
          processingAuth.current = false;
        }

        if (search && search.includes('code=')) {
          processingAuth.current = true;
          const searchParams = new URLSearchParams(search);
          const code = searchParams.get('code');
          if (code) {
            try {
              const redirect_uri = window.location.origin.split('?')[0].split('#')[0].replace(/\/$/, '') + '/account';
              
              console.log("Exchanging code for token...");
              console.log("Sending code to backend with redirect_uri:", redirect_uri);
              const response = await client.post('account/google_login/', {
                code: code,
                redirect_uri: redirect_uri,
              });
              console.log("Backend response:", response.data);
              if (response.data.token) {
                localStorage.setItem('userToken', response.data.token);
                if (window.history && window.history.replaceState) {
                  window.history.replaceState({}, document.title, window.location.pathname);
                }
                await fetchUserData(response.data.token);
                return;
              }
            } catch (err) {
              console.error("Google token exchange failed:", err);
            }
          }
          processingAuth.current = false;
        }
      }
      
      if (Platform.OS !== 'web' || (typeof window !== 'undefined' && !window.location.search.includes('code=') && !window.location.hash.includes('access_token'))) {
        await fetchUserData();
      }
    };
    initAccount();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const fetchUserData = async (providedToken = null) => {
    try {
      const token = providedToken || (Platform.OS === 'web' ? localStorage.getItem('userToken') : null);
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await client.get('account/', {
        headers: { Authorization: 'Token ' + token },
      });
      setUser(response.data);
      setEditForm({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
      });
    } catch (error) {
      console.error("Error fetching user data:", error.message, error.response?.data);
      navigation.navigate('Login');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = Platform.OS === 'web' ? localStorage.getItem('userToken') : null;
      const response = await client.put('account/update_profile/', editForm, {
        headers: { Authorization: 'Token ' + token },
      });
      setUser(response.data);
      setEditingField(null);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') localStorage.removeItem('userToken');
    navigation.navigate('Login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#db2777" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          
          {/* Header Profile Section */}
          <View style={styles.headerSection}>
            <View style={styles.profileInfo}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitial}>
                    {user?.first_name ? user.first_name[0].toUpperCase() : (user?.username ? user.username[0].toUpperCase() : '?')}
                  </Text>
                </View>
                <TouchableOpacity style={styles.editAvatarBtn}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.nameSection}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.first_name} {user?.last_name || user?.username}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text style={styles.verifiedText}>Verified Member</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#831843" />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <StatItem icon="shopping-outline" label="Orders" value={(user && user.orders_count) || 0} color="#db2777" />
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <StatItem icon="calendar-check-outline" label="Bookings" value={(user && user.bookings_count) || 0} color="#be185d" />
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <StatItem icon="certificate-outline" label="Programs" value={(user && user.enrollments_count) || 0} color="#9d174d" />
            </GlassCard>
          </View>

          <View style={styles.detailsGrid}>
            {/* Personal Information */}
            <GlassCard style={styles.detailsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Personal Information</Text>
                <TouchableOpacity onPress={() => setEditingField('name')}>
                  <Text style={styles.editLink}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>First Name</Text>
                <Text style={styles.infoValue}>{user?.first_name || 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Name</Text>
                <Text style={styles.infoValue}>{user?.last_name || 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <View style={styles.emailValueContainer}>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                  <View style={styles.googleBadge}>
                    <FontAwesome5 name="google" size={10} color="#831843" />
                    <Text style={styles.googleBadgeText}>Linked</Text>
                  </View>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                </Text>
              </View>
            </GlassCard>

            {/* Quick Actions / Security */}
            <GlassCard style={styles.detailsCard}>
              <Text style={styles.cardTitle}>Account Security</Text>
              
              <TouchableOpacity style={styles.actionItem}>
                <View style={styles.actionIcon}>
                  <Ionicons name="shield-checkmark-outline" size={22} color="#db2777" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Two-Factor Auth</Text>
                  <Text style={styles.actionDesc}>Add an extra layer of security</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <View style={styles.actionIcon}>
                  <Ionicons name="key-outline" size={22} color="#db2777" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Change Password</Text>
                  <Text style={styles.actionDesc}>Update your login credentials</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <View style={styles.actionIcon}>
                  <Ionicons name="notifications-outline" size={22} color="#db2777" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Notification Prefs</Text>
                  <Text style={styles.actionDesc}>Manage how we contact you</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </GlassCard>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Modern Modal for Editing */}
      {editingField === 'name' && (
        <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Profile</Text>
              <Text style={styles.modalSubtitle}>Enhance your identity on Pink Cycle</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput 
                  style={styles.modalInput} 
                  value={editForm.first_name} 
                  onChangeText={(t) => setEditForm({...editForm, first_name: t})} 
                  placeholder="First Name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput 
                  style={styles.modalInput} 
                  value={editForm.last_name} 
                  onChangeText={(t) => setEditForm({...editForm, last_name: t})} 
                  placeholder="Last Name"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalBtnSave} onPress={handleSaveProfile}>
                  <Text style={styles.modalBtnText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setEditingField(null)}>
                  <Text style={[styles.modalBtnText, { color: '#64748b' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
           </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainContent: {
    padding: width > 800 ? 40 : 20,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    flexWrap: 'wrap',
    gap: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#db2777',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '800',
    color: '#db2777',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#db2777',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameSection: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff1f2',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#831843',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: width > 800 ? 0 : '100%',
    padding: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: width > 1000 ? 'row' : 'column',
    gap: 30,
  },
  detailsCard: {
    flex: 1,
    padding: 30,
  },
  glassCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  editLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#db2777',
  },
  infoRow: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '600',
  },
  emailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fce7f3',
  },
  googleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#831843',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff1f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  actionDesc: {
    fontSize: 13,
    color: '#94a3b8',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 40,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#0f172a',
  },
  modalButtons: {
    marginTop: 10,
    gap: 12,
  },
  modalBtnSave: {
    backgroundColor: '#db2777',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#db2777',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalBtnCancel: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});

export default Account;
