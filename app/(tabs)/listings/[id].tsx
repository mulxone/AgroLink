
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { supabase } from '../../../lib/supabase';

const screenWidth = Dimensions.get('window').width;

interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  description?: string;
  images?: string[];
  phone?: string;
  location?: string;
  quantity?: number;
}

export default function ListingDetails({ route }: any) {
  const { id } = route.params;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.log('Error fetching listing:', error);
      } else {
        setListing(data as Listing);
      }
      setLoading(false);
    };

    fetchListing();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} color="#16a34a" />;
  if (!listing) return <Text style={{ textAlign: 'center', marginTop: 50 }}>Listing not found.</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* Images */}
      {listing.images && listing.images.length > 0 ? (
        <FlatList
          horizontal
          data={listing.images}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.image} />
          )}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
        />
      ) : (
        <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>No Image</Text>
        </View>
      )}

      {/* Listing Info */}
      <Text style={styles.title}>{listing.title}</Text>
      <Text style={styles.category}>{listing.category}</Text>
      <Text style={styles.price}>
        {listing.price} {listing.unit}
      </Text>
      {listing.quantity && <Text style={styles.detail}>Quantity: {listing.quantity}</Text>}
      {listing.location && <Text style={styles.detail}>Location: {listing.location}</Text>}
      {listing.description && <Text style={styles.description}>{listing.description}</Text>}
      <Text style={styles.phone}>Contact: {listing.phone}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  image: {
    width: screenWidth - 30,
    height: 250,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 15,
    marginRight: 10,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  category: { fontSize: 16, color: '#666', marginBottom: 5 },
  price: { fontSize: 18, fontWeight: '600', color: '#16a34a', marginBottom: 5 },
  description: { fontSize: 16, color: '#333', marginBottom: 10 },
  phone: { fontSize: 16, fontWeight: '500', marginTop: 10 },
  detail: { fontSize: 14, color: '#333', marginBottom: 5 },
});
