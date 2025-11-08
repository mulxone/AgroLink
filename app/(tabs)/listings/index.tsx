// app/(tabs)/listings/index.tsx
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define your stack params
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  ListingDetail: { id: string };
};

// Type the navigation
type ListingsFeedNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

// Categories
const categories = ['Produce', 'Tools', 'Seeds', 'Fertilizers', 'Equipment'];

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  images: string[];
  phone: string;
}

export default function ListingsFeed() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const navigation = useNavigation<ListingsFeedNavigationProp>();

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase.from('listings').select('*').eq('status', 'active');

    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) console.log('Error fetching listings:', error);
    else setListings(data as Listing[]);

    setLoading(false);
  };

  const renderListing = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
    >
      {item.images?.length > 0 && (
        <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardPrice}>{item.price} {item.unit}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryPill,
        selectedCategory === category && styles.categorySelected
      ]}
      onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === category && styles.categoryTextSelected
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        renderItem={({ item }) => renderCategory(item)}
        keyExtractor={(item) => item}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 20 }} />
      ) : listings.length === 0 ? (
        <Text style={styles.emptyText}>No listings available</Text>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderListing}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingTop: 10
  },
  categoryList: {
    marginBottom: 10
  },
  categoryPill: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8
  },
  categorySelected: {
    backgroundColor: '#16a34a'
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  categoryTextSelected: {
    color: '#fff'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  cardImage: {
    width: '100%',
    height: 180
  },
  cardContent: {
    padding: 12
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  cardCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 6
  },
  cardDescription: {
    fontSize: 14,
    color: '#374151'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#6b7280',
    fontSize: 16
  }
});
