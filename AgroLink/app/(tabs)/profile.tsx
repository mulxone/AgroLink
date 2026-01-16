

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabase';

interface UserProfile {
  name: string | null;
  phone: string | null;
  profile_photo: string | null;
}

export default function Profile() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace('/(auth)/login');
          return;
        }

        const authUser = session.user;
        setUser({ id: authUser.id, email: authUser.email! });

        const { data: profileData, error } = await supabase
          .from('users')
          .select('name, phone, profile_photo')
          .eq('id', authUser.id)
          .single();

        if (error) console.log('Error fetching profile:', error.message);

        setProfile({
          name: profileData?.name ?? null,
          phone: profileData?.phone ?? null,
          profile_photo: profileData?.profile_photo ?? null,
        });

        setForm({
          name: profileData?.name ?? '',
          phone: profileData?.phone ?? '',
        });
      } catch (error: any) {
        console.log('Error fetching user:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateProfile = async () => {
    if (!user) return;
    if (!form.name || !form.phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: form.name, phone: form.phone })
        .eq('id', user.id); // ✅ Update by id, not email

      if (error) throw error;

      Alert.alert('Success', 'Profile updated!');
      setProfile({ ...profile!, name: form.name, phone: form.phone });
      setEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  if (!user || !profile) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My Profile</Text>

        {editing ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={form.phone}
              keyboardType="phone-pad"
              onChangeText={(text) => setForm({ ...form, phone: text })}
            />
            <TouchableOpacity style={styles.button} onPress={updateProfile}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.info}>Email: {user.email}</Text>
            <Text style={styles.info}>Name: {profile.name ?? 'Not set'}</Text>
            <Text style={styles.info}>Phone: {profile.phone ?? 'Not set'}</Text>

            <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: 'green', marginBottom: 24 },
  info: { fontSize: 18, marginBottom: 12 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: '#6c757d' },
  logoutButton: { backgroundColor: '#dc3545' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
