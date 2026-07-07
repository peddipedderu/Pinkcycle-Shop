import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const BookSession = ({ route, navigation }) => {
  const { id } = route.params || {};
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [meetingFormat, setMeetingFormat] = useState('Virtual');
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyAuthAndFetch = async () => {
      let token = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('userToken');
      }
      if (!token) {
        try {
          token = await AsyncStorage.getItem('token');
        } catch (e) {
          console.log('Error reading token', e);
        }
      }

      if (!token) {
        if (Platform.OS === 'web') {
          alert('Please login first to book a session.');
        } else {
          Alert.alert('Authentication Required', 'Please login first to book a session.');
        }
        navigation.navigate('Login');
        return;
      }

      try {
        setLoading(true);
        const response = await client.get('sessions/' + id + '/');
        setSession(response.data);
        setScheduledTime(response.data.time || '');
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch session. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      verifyAuthAndFetch();
    } else {
      setError('No session ID specified.');
      setLoading(false);
    }
  }, [id]);

  const handleConfirmBooking = async () => {
    if (!scheduledTime.trim()) {
      const msg = 'Please enter or confirm a scheduled time.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Field Required', msg);
      return;
    }

    try {
      setBookingLoading(true);
      const response = await client.post('bookings/', {
        session_id: id,
        scheduled_time: scheduledTime,
        notes: notes,
        meeting_format: meetingFormat,
      });

      navigation.navigate('BookingSuccess', {
        bookingId: response.data.id,
        booking: response.data,
      });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || 'Failed to book this session. Please try again.';
      if (Platform.OS === 'web') alert(errMsg);
      else Alert.alert('Booking Failed', errMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size='large' color='#d63384' />
        <Text style={styles.loadingText}>Loading booking form...</Text>
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name='alert-circle-outline' size={60} color='#c2185b' />
        <Text style={styles.errorText}>{error || 'Session not found.'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Confirm Your Booking</Text>
        <Text style={styles.headerSubtitle}>
          Complete the details below to finalize your session with {session.mentor_name}.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryCategory}>{session.category}</Text>
          <Text style={styles.summaryTitle}>{session.title}</Text>
          <View style={styles.summaryRow}>
            <Ionicons name='person-outline' size={16} color='#d63384' />
            <Text style={styles.summaryText}>Mentor: {session.mentor_name}</Text>
          </View>
          
          <View style={styles.meetingOptions}>
             <Text style={styles.optionLabel}>Choose Your Preferred Meeting Format:</Text>
             <View style={styles.optionRow}>
                <TouchableOpacity 
                   style={[styles.meetingOption, meetingFormat === 'Live' ? styles.optionActive : styles.optionInactive]}
                   onPress={() => setMeetingFormat('Live')}
                >
                   <Ionicons name='location' size={18} color={meetingFormat === 'Live' ? '#fff' : '#d63384'} />
                   <Text style={[styles.optionText, meetingFormat === 'Live' ? styles.optionTextActive : styles.optionTextInactive]}>Live Meeting</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                   style={[styles.meetingOption, meetingFormat === 'Virtual' ? styles.optionActive : styles.optionInactive]}
                   onPress={() => setMeetingFormat('Virtual')}
                >
                   <Ionicons name='logo-skype' size={18} color={meetingFormat === 'Virtual' ? '#fff' : '#d63384'} />
                   <Text style={[styles.optionText, meetingFormat === 'Virtual' ? styles.optionTextActive : styles.optionTextInactive]}>Virtual (Skype)</Text>
                </TouchableOpacity>
             </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Scheduled Date & Time</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name='calendar-outline' size={20} color='#aaa' style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={scheduledTime}
              onChangeText={setScheduledTime}
              placeholder='e.g. Monday, 10:00 AM'
              placeholderTextColor='#aaa'
            />
          </View>

          <Text style={styles.inputLabel}>Session Goals & Notes (Optional)</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <Ionicons
              name='document-text-outline'
              size={20}
              color='#aaa'
              style={[styles.inputIcon, { marginTop: 12 }]}
            />
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder='What do you want to achieve in this session?'
              placeholderTextColor='#aaa'
              multiline
              numberOfLines={4}
            />
          </View>

          {bookingLoading ? (
            <ActivityIndicator size='large' color='#d63384' style={{ marginVertical: 20 }} />
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleConfirmBooking}>
              <Ionicons name='checkmark-circle-outline' size={22} color='#fff' style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Confirm and Book</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff1f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff1f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#d63384',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#c2185b',
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#d63384',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#831843',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: '#d63384',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryCategory: {
    color: '#c2185b',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#831843',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  summaryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  meetingOptions: {
     marginTop: 20,
     paddingTop: 15,
     borderTopWidth: 1,
     borderTopColor: '#fce4ec',
  },
  optionLabel: {
     fontSize: 13,
     fontWeight: '700',
     color: '#831843',
     marginBottom: 15,
  },
  optionRow: {
     flexDirection: 'row',
     justifyContent: 'space-between',
  },
  meetingOption: {
     flex: 0.48,
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     paddingVertical: 14,
     borderRadius: 12,
     borderWidth: 1.5,
  },
  optionActive: {
     backgroundColor: '#d63384',
     borderColor: '#d63384',
  },
  optionInactive: {
     backgroundColor: '#fff',
     borderColor: '#fce4ec',
  },
  optionText: {
     fontSize: 12,
     fontWeight: '700',
     marginLeft: 8,
  },
  optionTextActive: {
     color: '#fff',
  },
  optionTextInactive: {
     color: '#d63384',
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    shadowColor: '#d63384',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#831843',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fce4ec',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#d63384',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#d63384',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default BookSession;