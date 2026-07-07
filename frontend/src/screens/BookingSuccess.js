import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BookingSuccess = ({ route, navigation }) => {
  const { booking } = route.params || {};

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slideUp, { toValue: 0, tension: 40, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  if (!booking) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#c2185b" />
        <Text style={styles.errorText}>No booking details available.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Booking")}>
          <Text style={styles.buttonText}>Back to Booking</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sessionName = booking.session?.title || booking.session_name || "Mentorship Session";
  const mentorName = booking.session?.mentor_name || "Mentor";
  const scheduledTime = booking.scheduled_time || "As Scheduled";
  const refNumber = `PC-B${booking.id.toString().padStart(5, "0")}`;
  const meetingLink = booking.meeting_link;

  const handleAddToCalendar = () => {
    // Generate standard Google Calendar event template url
    const baseUrl = "https://www.google.com/calendar/render";
    const details = `Hi! You have scheduled a PinkCycle session.\n\nMentor: ${mentorName}\nVirtual Meeting Room: ${meetingLink}\n\nNotes: ${booking.notes || "None"}`;
    
    // Quick parse scheduledTime to a rough Google Calendar date format (approximate to today + next few days)
    // For simplicity, we create a template helper or just let user schedule it manually on redirect
    const url = `${baseUrl}?action=TEMPLATE&text=${encodeURIComponent(
      `PinkCycle: ${sessionName}`
    )}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(
      meetingLink
    )}`;
    
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open calendar link:", err)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Checkmark Circle */}
        <Animated.View
          style={[
            styles.successCircleOuter,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.successCircleMiddle}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={50} color="#fff" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUp }], width: "100%", alignItems: "center" }}>
          <Text style={styles.successTitle}>Booking Confirmed! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Your mentorship session is locked in. A calendar invitation has been sent to your email.
          </Text>

          {/* Details Card */}
          <View style={styles.infoCard}>
            <View style={styles.refRow}>
              <Text style={styles.refLabel}>Ticket Reference</Text>
              <Text style={styles.refValue}>{refNumber}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="bookmark-outline" size={18} color="#d63384" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Session</Text>
                <Text style={styles.infoValueText}>{sessionName}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color="#d63384" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Mentor</Text>
                <Text style={styles.infoValueText}>{mentorName}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color="#d63384" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Scheduled Time</Text>
                <Text style={styles.infoValueText}>{scheduledTime}</Text>
              </View>
            </View>

            {meetingLink ? (
              <View style={styles.infoRow}>
                <Ionicons name="videocam-outline" size={18} color="#d63384" />
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Virtual Meeting Room</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(meetingLink)}>
                    <Text style={[styles.infoValueText, styles.linkText]} numberOfLines={1}>
                      {meetingLink}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.calendarButton} onPress={handleAddToCalendar}>
            <Ionicons name="logo-google" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.calendarButtonText}>Add to Google Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("MyBookings")}
          >
            <Ionicons name="calendar-outline" size={18} color="#d63384" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.backHomeText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff1f5",
  },
  content: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff1f5",
  },
  errorText: {
    fontSize: 16,
    color: "#c2185b",
    marginVertical: 15,
  },
  button: {
    backgroundColor: "#d63384",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  successCircleOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(214, 51, 132, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successCircleMiddle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(214, 51, 132, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#d63384",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#831843",
    textAlign: "center",
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
    paddingHorizontal: 15,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 25,
  },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  refLabel: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: "600",
  },
  refValue: {
    fontSize: 15,
    color: "#d63384",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#fce4ec",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#aaa",
    fontWeight: "600",
    marginBottom: 2,
  },
  infoValueText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  linkText: {
    color: "#d63384",
    textDecorationLine: "underline",
  },
  calendarButton: {
    backgroundColor: "#4285F4",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#4285F4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 12,
  },
  calendarButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  primaryButton: {
    borderWidth: 2,
    borderColor: "#fce4ec",
    backgroundColor: "#fff",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 15,
  },
  primaryButtonText: {
    color: "#d63384",
    fontSize: 16,
    fontWeight: "700",
  },
  backHomeBtn: {
    paddingVertical: 8,
  },
  backHomeText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BookingSuccess;
