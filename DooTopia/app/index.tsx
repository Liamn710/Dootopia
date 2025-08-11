import { auth } from "@/FirebaseConfig";
import { router } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
const index = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("User state changed:", user);
      setUser(user);
      setIsInitializing(false); // Firebase has finished checking auth state
      
      if (user) {
        // User is authenticated, go to main app
        router.replace("/screens/MainApp");
      } else {
        // User is not authenticated, go to login
        router.replace("/screens/HomeScreen"); 
      }
    });

    // Cleanup function to prevent memory leaks
    return () => unsubscribe();
  }, []);

  // Show loading screen while Firebase is checking auth state
  if (isInitializing) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  // This will rarely render since we redirect above
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Redirecting...</Text>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D6ECF2', 
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
  },
});