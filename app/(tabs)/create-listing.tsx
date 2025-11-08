

import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export default function CreateListing() {
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // updated for Expo
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      // result.assets contains the selected images
      const selected = result.assets.map((asset: any) => asset.uri);
      setImages(selected);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const filename = uri.split('/').pop() as string;
      const response = await fetch(uri);
      const blob = await response.blob();
      const { data, error } = await supabase.storage
        .from('listings')
        .upload(`images/${Date.now()}_${filename}`, blob);

      if (error) throw error;

      // get public URL
      const { data: urlData } = supabase.storage
        .from('listings')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error: any) {
      console.log('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!title || !category || !price || !unit || !phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Upload all images
      const uploadedUrls = [];
      for (const img of images) {
        const url = await uploadImage(img);
        if (url) uploadedUrls.push(url);
      }

      // Get current user
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        setLoading(false);
        return;
      }

      // Insert listing
      const { error } = await supabase.from('listings').insert([{
        user_id: user.id,
        title,
        category,
        description,
        price: parseFloat(price),
        unit,
        images: uploadedUrls,
        phone,
      }]);

      if (error) throw error;

      Alert.alert('Success', 'Listing created successfully!');
      navigation.navigate('Home');
    } catch (error: any) {
      console.log('Error creating listing:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />

      <Text style={styles.label}>Category</Text>
      <TextInput value={category} onChangeText={setCategory} style={styles.input} />

      <Text style={styles.label}>Description</Text>
      <TextInput value={description} onChangeText={setDescription} style={styles.input} multiline />

      <Text style={styles.label}>Price</Text>
      <TextInput value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />

      <Text style={styles.label}>Unit</Text>
      <TextInput value={unit} onChangeText={setUnit} style={styles.input} />

      <Text style={styles.label}>Phone</Text>
      <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />

      <Button title="Pick Images" onPress={pickImages} color="#16a34a" />

      <ScrollView horizontal style={{ marginVertical: 10 }}>
        {images.map((img, idx) => (
          <Image key={idx} source={{ uri: img }} style={{ width: 100, height: 100, marginRight: 10 }} />
        ))}
      </ScrollView>

      <Button title={loading ? 'Creating...' : 'Create Listing'} onPress={handleSubmit} color="#16a34a" disabled={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
  },
});
