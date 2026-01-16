import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Marketplace() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AgroLink</Text>
      <Text style={styles.subtitle}>
        Browse products, sell your items, and manage your shop from here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
