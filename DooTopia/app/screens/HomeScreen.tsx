

import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth functions
import { memo, useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from '../../FirebaseConfig'; // Adjust the import path as necessary

const HomeScreen = memo(() => {
  const [data, setData] = useState([]); // State to hold fetched data
  const [email, setEmail]=useState("");//state variable for setting an email
  const [password , setPassword]=useState("");// state variable for the password
  const router = useRouter();


  const signIn = useCallback(async () => {
    try { 
      const user = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", user);
      Alert.alert("Success", "Logged in successfully!");
      router.replace("/components/BottomTabNavigation");
    }catch (error) {
      console.error("Error signing in:", error);
      Alert.alert("Error", "Failed to log in.");
    }
  }, [email, password, router]);

  return (
    <View style={styles.container}>

      <Text style = {styles.title}> Welcome </Text>

      <View style = {styles.form}>
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
      <TouchableOpacity style={styles.button} onPress={() => router.push('./SignUp')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>


      </View>
    </View>
  );
});

export default HomeScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#D6ECF2", 
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  form: {
    width: "100%",
    maxWidth: 300,
  },
  input: {
    backgroundColor: "#9DBCC3",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#5A8A93",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    margin: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
