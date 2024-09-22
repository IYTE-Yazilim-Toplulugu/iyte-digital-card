import { Link, Stack } from "expo-router";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useState } from "react";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function Login() {
  const [studentID, setstudentID] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = (): void => {
    const studentIDRegex = /^\d{9}Y?$/;
    if (!studentIDRegex.test(studentID)) {
      Alert.alert(
        "Invalid studentID",
        "Student ID must be 9 digits: \n123456789 or 123456789Y"
      );
      return;
    }
    console.log("studentID:", studentID, "Password:", password);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Login" }} />
      <ThemedView style={styles.container}>
        <Image
          source={require("@/assets/images/iyte-logo-transparan-360px.png")}
          style={styles.logo}
        />

        <ThemedText type="title" style={styles.title}>
          IYTE DIJITAL CARD
        </ThemedText>

        <TextInput
          style={styles.input}
          placeholder="studentID"
          placeholderTextColor="#999"
          value={studentID}
          onChangeText={setstudentID}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <ThemedText type="default">Login</ThemedText>
        </TouchableOpacity>

        <Link href="/signup" style={styles.link}>
          {/* signup route is not defined */}
          <ThemedText type="link">Sign up for IYTE Digital Card</ThemedText>
        </Link>

        <Link href="/recover" style={styles.link}>
          {/* recover route is not defined */}
          <ThemedText type="link">Forgotten account?</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  link: {
    marginTop: 20,
  },
});
