import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabase';

export default function Sell() {
  const router = useRouter();

  // Demo user email
  const userEmail = 'demo@agrolink.com';

  const handleTestSell = () => {
    Alert.alert('Sell Tab', `Hello ${userEmail}, this is a test button`);
  };

  const handleLogout = async () => {
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
      <Text style={styles.title}>Sell Your Products</Text>
      <Text style={styles.info}>
        This is where you can create a listing for your farm produce or tools.
      </Text>

      <Button title="Test Sell Action" onPress={handleTestSell} color="green" />
      <View style={{ height: 20 }} />
      <Button title="Logout" onPress={handleLogout} color="red" />
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
