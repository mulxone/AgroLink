import { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Home({ navigation }: any) {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const currentUser = supabase.auth.getUser(); // get current user
        const { data: userData } = await supabase
          .from('users')
          .select('name, phone')
          .eq('phone', (await currentUser).data.user?.email?.split('@')[0]) // match phone from pseudo-email
          .single();

        if (userData) setUserName(userData.name);
      } catch (error) {
        console.log('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.navigate('Login');
  };

  if (loading) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {userName ? `Welcome, ${userName}!` : 'Welcome!'}
      </Text>

      <Text style={styles.subtitle}>This is your AgroLink Home.</Text>

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  loading: { flex: 1, textAlign: 'center', marginTop: 50, fontSize: 18 },
});
