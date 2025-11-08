import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Signup({ navigation }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Inline success/error message

  const handleSignup = async () => {
    setMessage(''); // clear previous messages

    if (!name || !phone || !password) {
      setMessage('Please enter name, phone, and password');
      return;
    }

    try {
      // Sign up user in Supabase Auth (email pseudo using phone)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: phone + '@agrolink.com',
        password,
      });
      if (authError) throw authError;

      // Insert into users table (name + phone)
      const { error: dbError } = await supabase.from('users').insert([{ name, phone }]);
      if (dbError) throw dbError;

      setMessage('Account created successfully! Redirecting to Login...');
      
      // Automatically navigate to Login after 1.5s
      setTimeout(() => navigation.navigate('Login'), 1500);

    } catch (error: any) {
      setMessage('Error: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
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

      <Button title="Sign Up" onPress={handleSignup} />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10, borderRadius: 5 },
  message: { marginTop: 15, textAlign: 'center', color: 'green', fontWeight: '500' },
  loginLink: { marginTop: 10, textAlign: 'center', color: '#007BFF', fontWeight: '500' },
});
