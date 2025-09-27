import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { auth } from '../../FirebaseConfig';

export default function HomeScreen() {
  const [email, setEmail]=useState("");
  const [password , setPassword]=useState("");
  const router = useRouter();

  const signIn = async () => {
    try { 
      const user = await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Logged in successfully!");
      router.replace("/components/BottomTabNavigation");
    }catch (error) {
      Alert.alert("Error", "Failed to log in.");
    }
  }

  return (
    <View style={styles.container}>
      {/* App Logo or Icon */}
      <View style={styles.logoContainer}>
        {/* You can replace this with your own logo image */}
        <Image
          source={require('../../assets/dootopia-logo.png')}
          style={styles.logo}
        />
      </View>
      {/* App Name */}
      <Text style={styles.appName}>Dootopia</Text>
      {/* Subtitle */}
      <Text style={styles.subtitle}>Organize your tasks. Earn points. Level up your life!</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={signIn}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('./SignUp')}>
          <Text style={styles.secondaryButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#D6ECF2",
  },
  logoContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: "#5A8A93",
  },
  appName: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#5A8A93",
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: "#9DBCC3",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
    fontStyle: "italic",
  },
  form: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#5A8A93",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    backgroundColor: "#EAF6F9",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#9DBCC3",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#5A8A93",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: "#EAF6F9",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#5A8A93",
  },
  secondaryButtonText: {
    color: "#5A8A93",
    fontSize: 16,
    fontWeight: "600",
  },
});