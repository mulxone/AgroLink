import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabase';

export default function Profile() {
  const router = useRouter();

  // For demo, show a fixed email
  const userEmail = 'demo@agrolink.com';

  const handleLogout = async () => {
    // Demo logout
    try {
      await supabase.auth.signOut();
      Alert.alert('Logged out');
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.info}>Logged in as: {userEmail}</Text>
      <Button title="Logout" color="red" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'green', 
    marginBottom: 12 
  },
  info: { 
    fontSize: 16, 
    color: '#333', 
    textAlign: 'center', 
    marginBottom: 12 
  },
});
