

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
  Image,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import { supabase } from '../../supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['Produce', 'Tools', 'Seeds', 'Fertilizers', 'Equipment', 'Livestock'];

export default function SellScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    location: '',
    quantity: '',
    phone: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
    loadProfile();
  }, []);

  // Ask for camera & media library permissions
  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
      Alert.alert(
        'Permissions required',
        'Camera and media library permissions are required to upload images.'
      );
    }
  };

  // Load existing phone from profile if available
  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .single();

    if (data?.phone) {
      setForm((prev) => ({ ...prev, phone: data.phone }));
    }
  };

  // Pick image from library with cropping
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setImages([...images, ...uris].slice(0, 5)); // Limit to 5 images
    }
  };

  // Take photo using camera with cropping
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (images.length < 5) {
        setImages([...images, uri]);
      } else {
        Alert.alert('Limit reached', 'Maximum 5 images allowed');
      }
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Upload a single image to Supabase storage
  const uploadImage = async (uri: string) => {
    try {
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const fileData = Buffer.from(base64, 'base64');

      const { error } = await supabase.storage
        .from('uploads')
        .upload(fileName, fileData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      return publicUrl;

    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  // Submit the listing
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'You must be logged in to post a listing.');
        return;
      }

      // VALIDATION
      if (!form.title || !form.price || !form.category) {
        Alert.alert('Error', 'Please fill all required fields.');
        return;
      }

      if (!form.location) {
        Alert.alert('Error', 'Location is required.');
        return;
      }

      if (!form.phone) {
        Alert.alert('Error', 'Phone number is required.');
        return;
      }

      if (images.length === 0) {
        Alert.alert('Error', 'Please add at least one image.');
        return;
      }

      // Upload all images
      const imageUrls: string[] = [];
      for (let uri of images) {
        const url = await uploadImage(uri);
        if (url) imageUrls.push(url);
      }

      // Insert listing into Supabase
      const { error } = await supabase.from('listings').insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price),
        location: form.location,
        quantity: form.quantity ? parseFloat(form.quantity) : null,
        images: imageUrls,
        phone: form.phone,
        status: 'active',
      });

      if (error) throw error;

      // Success message
      Alert.alert('Success', 'Your listing has been created!');

      // Reset form
      setForm({
        title: '',
        description: '',
        category: '',
        price: '',
        location: '',
        quantity: '',
        phone: '',
      });
      setImages([]);

      // Navigate back
      router.replace({
        pathname: '/(tabs)',
        params: { refresh: 'true', ts: Date.now() },
      });

    } catch (error: any) {
      console.error('Listing error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Sell Your Product</Text>
          <Text style={styles.subtitle}>Fill in the details below to list your item</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>PRODUCT INFORMATION</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Product Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Fresh Organic Tomatoes"
              placeholderTextColor="#9ca3af"
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product in detail..."
              placeholderTextColor="#9ca3af"
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    form.category === cat && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setForm({ ...form, category: cat })}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      form.category === cat && styles.categoryTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 0.6 }]}>
              <Text style={styles.inputLabel}>Price *</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>K</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  value={form.price}
                  onChangeText={(text) => setForm({ ...form, price: text })}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 0.38 }]}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Lusaka"
                placeholderTextColor="#9ca3af"
                value={form.location}
                onChangeText={(text) => setForm({ ...form, location: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantity (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10 bags"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={form.quantity}
              onChangeText={(text) => setForm({ ...form, quantity: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="0974567890"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>PHOTOS ({images.length}/5)</Text>
          <Text style={styles.sectionDescription}>Add clear photos of your product</Text>
          
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color="#158F37" />
              <Text style={styles.imageButtonText}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="#158F37" />
              <Text style={styles.imageButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Ionicons name="add" size={32} color="#9ca3af" />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#158F37" />
            <Text style={styles.loadingText}>Creating listing...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Publish Listing</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        <Text style={styles.requiredNote}>* Required fields</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 12, // Reduced top padding for dynamic island
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#158F37',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6', // Gray background
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  priceInput: {
    paddingLeft: 32,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonSelected: {
    backgroundColor: '#158F37',
    borderColor: '#158F37',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#158F37',
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  submitButton: {
    backgroundColor: '#158F37',
    padding: 18,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    shadowColor: '#158F37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  requiredNote: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    color: '#9ca3af',
  },
});