import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { supabase } from "../supabase";

const HomeScreen: React.FC = () => {
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AgroLink 🌱</Text>
      <Text style={styles.subtitle}>
        Your farming marketplace is ready for demo!
      </Text>

      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
});
