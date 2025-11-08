import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Login({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setMessage('');

    if (!phone || !password) {
      setMessage('Please enter both phone and password');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: phone + '@agrolink.com',
        password,
      });

      console.log('Supabase login response:', { data, error });

      if (error) throw error;
      if (!data?.user) {
        setMessage('No user found with this phone number.');
        return;
      }

      setMessage('Logged in successfully! Redirecting...');
      setTimeout(() => navigation.navigate('Home'), 1000);

    } catch (error: any) {
      setMessage('Error: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signupLink}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10, borderRadius: 5 },
  message: { marginTop: 15, textAlign: 'center', color: 'green', fontWeight: '500' },
  signupLink: { marginTop: 10, textAlign: 'center', color: '#007BFF', fontWeight: '500' },
});
