import axios from 'axios';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { auth } from '../../FirebaseConfig';
import { createUser } from '../../backend/api';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function createUserInMongo(firebaseUserId: string) {
    try {
      const userObject = {
        firebaseUserId: firebaseUserId,
        name: name,
        email: email,
        points: 0,
        createdAt: new Date().toISOString(),
      }
      await createUser(userObject);
      console.log("User created in MongoDB:", userObject);
    } catch (error) {
      console.error("Error creating user in MongoDB:", error);
      Alert.alert("Error", "Failed to create user profile");
    }
  }

  const handleSignUp = async (): Promise<string | false> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User signed up:", userCredential.user);
      Alert.alert("Success", "Account created!");
      return userCredential.user.uid;
    } catch (error: any) {
      console.error("Error signing up:", error);
      Alert.alert("Error", error.message);
      return false;
    }
  };

  return (
    <View style={styles.container}>
      {/* App Logo or Icon */}
      <View style={styles.logoContainer}>
        {/* Replace with your logo if available */}
        <Image
          source={require('../../assets/dootopia-logo.png')}
          style={styles.logo}
        />
      </View>
      <Text style={styles.appName}>Dootopia</Text>
      <Text style={styles.subtitle}>Create your account and start leveling up your life!</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const firebaseUserId = await handleSignUp();
            if (firebaseUserId) {
              await createUserInMongo(firebaseUserId);
              router.replace("/screens/MainApp");
            }
          }}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('./HomeScreen')}>
          <Text style={styles.secondaryButtonText}>Already have an account? Go back</Text>
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