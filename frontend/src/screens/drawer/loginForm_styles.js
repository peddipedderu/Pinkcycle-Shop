import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 450,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignSelf: "center",
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    color: "#831843", // Maroon/Burgundy
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 24,
    fontFamily: "serif",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  textBox: {
    backgroundColor: "#f3f4f6", // Very light blue/grey tint
    borderColor: "#374151", // Clean dark outline
    borderWidth: 1,
    height: 52,
    fontSize: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    color: "#1f2937",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfInput: {
    width: "48%",
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: "#831843",
    fontSize: 14,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#831843", // Deep maroon
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    width: "100%",
    shadowColor: "#831843",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#9ca3af",
    fontSize: 14,
  },
  socialContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  footerText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 15,
  },
  loginLink: {
    color: "#831843",
    fontWeight: "bold",
  },
  error: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  abstractShape: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 100,
  },
});

export default styles;
