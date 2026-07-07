import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const InstitutionalHome = ({ navigation }) => {
  const [loanAmount, setLoanAmount] = useState(1030000);
  const [term, setTerm] = useState(66);

  const monthlyRepayment = ((loanAmount / term) * 1.12).toFixed(2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Regulated Banner */}
        <View style={styles.topBanner}>
          <Text style={styles.topBannerText}>REGULATED INSTITUTIONAL CAPITAL PLATFORM</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>The Precision of</Text>
          <Text style={styles.heroTitleItalic}>Institutional Capital.</Text>
          <Text style={styles.heroSubtitle}>
            Silentium is an institutional financial firm providing structured lending,
            private credit, and bespoke capital solutions to qualified counterparties worldwide.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("Shop")}
            >
              <Text style={styles.primaryButtonText}>Our Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("Categories")}
            >
              <Text style={styles.secondaryButtonText}>Categories</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loan Calculator Card */}
        <View style={styles.calcCard}>
          <Text style={styles.calcTitle}>Institutional Loan Structuring</Text>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>LOAN AMOUNT</Text>
            <Text style={styles.calcValue}>${loanAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.sliderPlaceholder}>
             {/* Note: In a real app we'd use @react-native-community/slider */}
             <TextInput
                keyboardType="numeric"
                style={styles.textInput}
                onChangeText={(v) => setLoanAmount(Number(v) || 0)}
                value={loanAmount.toString()}
             />
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>TERM (MONTHS)</Text>
            <Text style={styles.calcValue}>{term}</Text>
          </View>
          <View style={styles.sliderPlaceholder}>
             <TextInput
                keyboardType="numeric"
                style={styles.textInput}
                onChangeText={(v) => setTerm(Number(v) || 0)}
                value={term.toString()}
             />
          </View>

          <View style={styles.calcResult}>
            <Text style={styles.calcLabelSmall}>ESTIMATED MONTHLY REPAYMENT</Text>
            <Text style={styles.calcBigValue}>${monthlyRepayment}</Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Built for Institutional Finance.</Text>
          <Text style={styles.sectionText}>
            Silentium structures capital solutions on a mandate-by-mandate basis,
            aligning risk, duration, and yield objectives through disciplined
            underwriting and governance-first decision making.
          </Text>

          <View style={styles.statsCard}>
            <Text style={styles.statsValue}>$4.2B</Text>
            <Text style={styles.statsLabel}>INSTITUTIONAL CAPITAL STRUCTURED</Text>
          </View>
        </View>

        {/* API Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleSmall}>Institutional Controls</Text>
          <View style={styles.grid}>
             <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate("Cart")}>
                <Text style={styles.gridIcon}>🛒</Text>
                <Text style={styles.gridLabel}>View Cart</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate("Orders")}>
                <Text style={styles.gridIcon}>📋</Text>
                <Text style={styles.gridLabel}>My Orders</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate("Payment")}>
                <Text style={styles.gridIcon}>💳</Text>
                <Text style={styles.gridLabel}>Payments</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate("Login")}>
                <Text style={styles.gridIcon}>🔐</Text>
                <Text style={styles.gridLabel}>Secure Portal</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Leadership Section */}
        <View style={[styles.section, { backgroundColor: '#fdf2f8' }]}>
          <Text style={styles.leadershipTitle}>Institutional Leadership.</Text>

          <View style={styles.leaderCard}>
            <Text style={styles.leaderName}>Marcus Thorne</Text>
            <Text style={styles.leaderRole}>MANAGING DIRECTOR</Text>
            <Text style={styles.leaderDesc}>
              Former institutional credit and risk executive overseeing global structured lending portfolios.
            </Text>
          </View>

          <View style={styles.leaderCard}>
            <Text style={styles.leaderName}>Ben</Text>
            <Text style={styles.leaderRole}>HEAD OF FINANCIAL SYSTEMS</Text>
            <Text style={styles.leaderDesc}>
              Leads internal underwriting systems, analytics platforms, and capital workflow infrastructure.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Silentium</Text>
          <Text style={styles.footerText}>
            Silentium is an independent institutional finance firm specializing in
            structured lending, private credit, and bespoke capital solutions for
            qualified counterparties.
          </Text>
          <Text style={styles.footerCopyright}>
            © 2026 SILENTIUM INTERNATIONAL ASSET MANAGEMENT
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  topBanner: {
    backgroundColor: "#111",
    paddingVertical: 10,
    alignItems: "center",
  },
  topBannerText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
  },
  heroSection: {
    backgroundColor: "#1a0614", // Dark pink/navy mix
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "300",
  },
  heroTitleItalic: {
    color: "#f9a8d4", // Pink accent
    fontSize: 48,
    fontWeight: "300",
    fontStyle: "italic",
    marginBottom: 20,
  },
  heroSubtitle: {
    color: "#fce7f3",
    fontSize: 18,
    lineHeight: 28,
    opacity: 0.8,
    marginBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 15,
  },
  primaryButton: {
    backgroundColor: "#db2777",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
  },
  calcCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 30,
    shadowColor: "#db2777",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  calcTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a0614",
    marginBottom: 30,
  },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  calcLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9d174d",
    letterSpacing: 1,
  },
  calcValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a0614",
  },
  textInput: {
    backgroundColor: "#fdf2f8",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: "#db2777",
    fontWeight: "600",
    marginBottom: 20,
  },
  calcResult: {
    borderTopWidth: 1,
    borderTopColor: "#fce7f3",
    paddingTop: 20,
    marginTop: 10,
  },
  calcLabelSmall: {
    fontSize: 9,
    fontWeight: "700",
    color: "#9d174d",
    marginBottom: 5,
  },
  calcBigValue: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1a0614",
  },
  section: {
    padding: 40,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: "400",
    color: "#1a0614",
    marginBottom: 20,
  },
  sectionTitleSmall: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a0614",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionText: {
    fontSize: 18,
    lineHeight: 28,
    color: "#701a75",
    opacity: 0.7,
    marginBottom: 40,
  },
  statsCard: {
    backgroundColor: "#1a0614",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
  },
  statsValue: {
    fontSize: 56,
    fontWeight: "800",
    color: "#f9a8d4",
  },
  statsLabel: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 3,
    marginTop: 10,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#fce7f3",
    alignItems: "center",
    marginBottom: 15,
  },
  gridIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#db2777",
  },
  leadershipTitle: {
    fontSize: 32,
    fontWeight: "400",
    color: "#1a0614",
    textAlign: "center",
    marginBottom: 40,
  },
  leaderCard: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fce7f3",
    marginBottom: 20,
  },
  leaderName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a0614",
  },
  leaderRole: {
    fontSize: 10,
    fontWeight: "800",
    color: "#db2777",
    letterSpacing: 1,
    marginVertical: 10,
  },
  leaderDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: "#701a75",
    opacity: 0.6,
  },
  footer: {
    backgroundColor: "#1a0614",
    padding: 40,
    paddingBottom: 60,
  },
  footerBrand: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  footerText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 40,
  },
  footerCopyright: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 10,
    fontWeight: "700",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 30,
    textAlign: "center",
  },
});

export default InstitutionalHome;
