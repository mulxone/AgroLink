


import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Button, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  images?: string[];
  phone?: string;
}

export default function Home() {
  const navigation = useNavigation<any>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch listings from Supabase
  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching listings:', error);
    } else {
      setListings(data as Listing[]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  // Refresh when screen is focused (e.g., after creating a new listing)
  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [])
  );

  // Pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} color="#16a34a" />;

  return (
    <View style={styles.container}>
      {/* Create Listing Button */}
      <View style={{ marginVertical: 10 }}>
        <Button
          title="Create Listing"
          color="#16a34a"
          onPress={() => navigation.navigate('CreateListing')}
        />
      </View>

      {/* If no listings */}
      {listings.length === 0 && (
        <View style={{ marginTop: 50, alignItems: 'center' }}>
          <Text>No listings available.</Text>
        </View>
      )}

      {/* Listings */}
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ListingDetails', { id: item.id })}
          >
            {item.images && item.images.length > 0 ? (
              <Image source={{ uri: item.images[0] }} style={styles.image} />
            ) : (
              <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>No Image</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.price}>
                {item.price} {item.unit}
              </Text>
              <Text style={styles.phone}>Contact: {item.phone}</Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  card: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  info: {
    padding: 10,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  category: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  price: { fontSize: 16, fontWeight: '600', color: '#16a34a' },
  phone: { fontSize: 14, color: '#000', marginTop: 4 },
});
