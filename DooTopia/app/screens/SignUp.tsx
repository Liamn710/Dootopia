import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../FirebaseConfig'; // Adjust path if needed
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  function createUserInMongo() {
    let userObject = {
      name: name,
      email: email,
      points: 0,
      createdAt: new Date().toISOString(),
    }
    axios.post('http://localhost:3000/users', userObject)
  }

  const handleSignUp = async (): Promise<boolean> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User signed up:", userCredential.user);
    Alert.alert("Success", "Account created!");
    return true;
  } catch (error: any) {
    console.error("Error signing up:", error);
    Alert.alert("Error", error.message);
    return false;
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
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
          const success = await handleSignUp();
          if (success) {
            await createUserInMongo();
            router.back(); // You can pass user data here
          }
        }}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ marginTop: 20, color: '#555' }}>Already have an account? Go back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#D6ECF2' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  input: {
    backgroundColor: '#9DBCC3',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#5A8A93',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
