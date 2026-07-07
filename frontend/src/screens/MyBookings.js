import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

const MyBookings = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let token = null;
      if (Platform.OS === "web") {
        token = localStorage.getItem("userToken");
      }
      if (!token) {
        token = await AsyncStorage.getItem("token");
      }

      if (!token) {
        setError("Please login to view your bookings.");
        setLoading(false);
        return;
      }

      const response = await client.get("bookings/");
      // Sort bookings: active first, then newest first
      const sorted = response.data.sort((a, b) => {
        if (a.status === "active" && b.status !== "active") return -1;
        if (a.status !== "active" && b.status === "active") return 1;
        return new Date(b.booked_at) - new Date(a.booked_at);
      });
      setBookings(sorted);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = (bookingId) => {
    const cancelAction = async () => {
      try {
        setCancellingId(bookingId);
        await client.put(`bookings/${bookingId}/cancel/`);
        
        if (Platform.OS === "web") {
          alert("Booking cancelled successfully.");
        } else {
          Alert.alert("Success", "Booking cancelled successfully.");
        }
        
        // Refresh bookings list
        fetchBookings();
      } catch (err) {
        console.error(err);
        const errMsg = err.response?.data?.detail || "Could not cancel booking. Please try again.";
        if (Platform.OS === "web") {
          alert(errMsg);
        } else {
          Alert.alert("Cancellation Failed", errMsg);
        }
      } finally {
        setCancellingId(null);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to cancel this booking?")) {
        cancelAction();
      }
    } else {
      Alert.alert(
        "Cancel Booking",
        "Are you sure you want to cancel this booking?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes, Cancel", onPress: cancelAction, style: "destructive" },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={styles.loadingText}>Loading your scheduled sessions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings Portal</Text>
          <Text style={styles.headerSubtitle}>
            Manage your scheduled workshops, mentorship programs, and find your virtual meeting links.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={48} color="#c2185b" />
            <Text style={styles.errorText}>{error}</Text>
            {error.includes("login") ? (
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.loginBtnText}>Go to Login</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.retryBtn} onPress={fetchBookings}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="calendar-outline" size={40} color="#d63384" />
            </View>
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptySubtitle}>
              You haven't scheduled any mentorship or learning sessions yet. Empower your future today!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate("Booking")}
            >
              <Text style={styles.browseButtonText}>Browse Sessions</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bookings.map((booking) => {
            const isActive = booking.status === "active";
            const sessionName = booking.session?.title || booking.session_name || "Mentorship Session";
            const mentorName = booking.session?.mentor_name || "Mentor";
            const category = booking.session?.category || "Career";
            
            return (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.badgeCol}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{category}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusCancelled]}>
                    <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextCancelled]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.sessionTitle}>{sessionName}</Text>
                
                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={16} color="#aaa" />
                  <Text style={styles.detailText}>Mentor: {mentorName}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#aaa" />
                  <Text style={styles.detailText}>Time: {booking.scheduled_time}</Text>
                </View>

                {booking.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Your goals / goals of session:</Text>
                    <Text style={styles.notesText}>{booking.notes}</Text>
                  </View>
                ) : null}

                {/* Actions */}
                {isActive ? (
                  <View style={styles.actionsRow}>
                    {booking.meeting_link ? (
                      <TouchableOpacity
                        style={styles.meetButton}
                        onPress={() => Linking.openURL(booking.meeting_link)}
                      >
                        <Ionicons name="videocam-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.meetButtonText}>Join Meeting</Text>
                      </TouchableOpacity>
                    ) : null}

                    {cancellingId === booking.id ? (
                      <ActivityIndicator size="small" color="#c2185b" style={{ marginLeft: 15 }} />
                    ) : (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleCancelBooking(booking.id)}
                      >
                        <Ionicons name="close-circle-outline" size={18} color="#c2185b" style={{ marginRight: 4 }} />
                        <Text style={styles.cancelButtonText}>Cancel Session</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={styles.cancelledIndicator}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#aaa" style={{ marginRight: 6 }} />
                    <Text style={styles.cancelledIndicatorText}>Cancelled / Completed Session</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff1f5",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff1f5",
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#d63384",
    fontWeight: "600",
  },
  header: {
    marginBottom: 25,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#831843",
    marginBottom: 6,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 15,
  },
  errorBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  errorText: {
    fontSize: 15,
    color: "#c2185b",
    textAlign: "center",
    marginVertical: 15,
  },
  loginBtn: {
    backgroundColor: "#d63384",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  retryBtn: {
    borderWidth: 2,
    borderColor: "#fce4ec",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  retryBtnText: {
    color: "#d63384",
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginTop: 15,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff1f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#831843",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  browseButton: {
    backgroundColor: "#d63384",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 14,
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeCol: {
    flexDirection: "row",
  },
  categoryBadge: {
    backgroundColor: "#fff1f5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: "#c2185b",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "#e8f5e9",
  },
  statusCancelled: {
    backgroundColor: "#f5f5f5",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusTextActive: {
    color: "#2e7d32",
  },
  statusTextCancelled: {
    color: "#9e9e9e",
  },
  sessionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#831843",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  notesBox: {
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#fce4ec",
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#831843",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#fce4ec",
    paddingTop: 12,
  },
  meetButton: {
    backgroundColor: "#d63384",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  meetButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  cancelButton: {
    marginLeft: "auto",
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#c2185b",
    fontSize: 13,
    fontWeight: "700",
  },
  cancelledIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#fce4ec",
    paddingTop: 12,
  },
  cancelledIndicatorText: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: "600",
  },
});

export default MyBookings;
