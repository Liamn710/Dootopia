

import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth functions
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from '../../FirebaseConfig'; // Adjust the import path as necessary
export default function HomeScreen() {
  const [data, setData] = useState([]); // State to hold fetched data
  const [email, setEmail]=useState("");//state variable for setting an email
  const [password , setPassword]=useState("");// state variable for the password
  const router = useRouter();
  // //login handling 
  // const handleLogin = ()=> {s
  //  if (!email || !password)
  //   {
  //     Alert.alert("Error","Please fiil in all fields");
  //     return;
  //   }
  // console.log("Login attempted with",email,password);
  // }


  const signIn = async () => {
    try { 
      const user = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", user);
    }catch (error) {
      console.error("Error signing in:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert("Error", errorMessage);
    }
  }

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
}


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
