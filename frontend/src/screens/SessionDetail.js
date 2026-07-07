import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import client from "../api/client";

const SessionDetail = ({ route, navigation }) => {
  const { id } = route.params || {};
  const [session, setSession] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [detailRes, availRes] = await Promise.all([
        client.get(`sessions/${id}/`),
        client.get(`sessions/${id}/availability/`),
      ]);
      setSession(detailRes.data);
      setAvailability(availRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load session details. Please try again.");
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    } else {
      setError("No session ID specified.");
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d63384" />
        <Text style={styles.loadingText}>Fetching details...</Text>
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#c2185b" />
        <Text style={styles.errorText}>{error || "Session not found."}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFullyBooked = availability?.fully_booked;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim }}
      >
        {/* Header Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {session.category || "Workshop"}
            </Text>
          </View>
          <Text style={styles.title}>{session.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color="#d63384" />
              <Text style={styles.metaText}>{session.duration || "1 hour"}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={18} color="#d63384" />
              <Text style={styles.metaText}>{session.time}</Text>
            </View>
          </View>
        </View>

        {/* Availability Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={22} color="#831843" />
            <Text style={styles.cardHeaderTitle}>Available Slots</Text>
          </View>
          {availability && (
            <View style={styles.availabilityRow}>
              <View style={styles.availCol}>
                <Text style={styles.availNumber}>
                  {availability.slots_remaining}
                </Text>
                <Text style={styles.availLabel}>Left</Text>
              </View>
              <View style={styles.availDivider} />
              <View style={styles.availCol}>
                <Text style={styles.availNumber}>{availability.capacity}</Text>
                <Text style={styles.availLabel}>Capacity</Text>
              </View>
              <View style={styles.availDivider} />
              <View style={styles.availCol}>
                <Text style={styles.availNumber}>
                  {isFullyBooked ? "No" : "Yes"}
                </Text>
                <Text style={styles.availLabel}>Open</Text>
              </View>
            </View>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.sectionContent}>{session.description}</Text>
        </View>

        {/* Mentor Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Mentor</Text>
          <View style={styles.mentorBox}>
            <View style={styles.mentorAvatar}>
              <Ionicons name="person" size={28} color="#d63384" />
            </View>
            <View style={styles.mentorInfo}>
              <Text style={styles.mentorName}>{session.mentor_name}</Text>
              <Text style={styles.mentorBio}>
                {session.mentor_bio || "Experienced mentor guiding youth."}
              </Text>
            </View>
          </View>
        </View>

        {/* Syllabus / Content Section */}
        {session.syllabus ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Syllabus & Agenda</Text>
            {session.syllabus.split("\n").map((line, index) => (
              <View key={index} style={styles.syllabusRow}>
                <View style={styles.syllabusBullet} />
                <Text style={styles.syllabusText}>{line}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Prerequisites Section */}
        {session.prerequisites ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prerequisites</Text>
            <View style={styles.warningBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#831843"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.warningText}>{session.prerequisites}</Text>
            </View>
          </View>
        ) : null}

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.bookButton,
            isFullyBooked && styles.disabledButton,
          ]}
          disabled={isFullyBooked}
          onPress={() =>
            navigation.navigate("BookSession", { id: session.id })
          }
        >
          <Ionicons
            name={isFullyBooked ? "close-circle-outline" : "calendar-outline"}
            size={22}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.bookButtonText}>
            {isFullyBooked ? "Session Fully Booked" : "Schedule Booking Now"}
          </Text>
        </TouchableOpacity>
      </Animated.ScrollView>
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
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: "#c2185b",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#d63384",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  heroSection: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryBadge: {
    backgroundColor: "#fce4ec",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryBadgeText: {
    color: "#c2185b",
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#831843",
    marginBottom: 15,
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginVertical: 4,
  },
  metaText: {
    marginLeft: 6,
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#fce4ec",
    paddingBottom: 10,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#831843",
    marginLeft: 8,
  },
  availabilityRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  availCol: {
    alignItems: "center",
    flex: 1,
  },
  availNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#d63384",
  },
  availLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  availDivider: {
    width: 1,
    height: 35,
    backgroundColor: "#fce4ec",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#831843",
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  mentorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mentorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fce4ec",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#c2185b",
    marginBottom: 4,
  },
  mentorBio: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  syllabusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  syllabusBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d63384",
    marginTop: 8,
    marginRight: 10,
  },
  syllabusText: {
    flex: 1,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f7",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#d63384",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#831843",
    fontWeight: "500",
  },
  bookButton: {
    backgroundColor: "#d63384",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#d63384",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#b0bec5",
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});

export default SessionDetail;
