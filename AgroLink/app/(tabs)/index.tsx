

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { supabase } from '../../supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
const CATEGORIES = ['All', 'Produce', 'Tools', 'Seeds', 'Fertilizers', 'Equipment', 'Vets','Livestock'];
const COLORS = {
  primary: '#158F37',
  secondary: '#40916c',
  lightGreen: '#d8f3dc',
  background: '#f8f9fa',
  cardBg: '#ffffff',
  textDark: '#1b4332',
  textLight: '#52796f',
  accent: '#f48c06',
  border: '#e9ecef',
};

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sellerProfiles, setSellerProfiles] = useState<{ [key: string]: any }>({});
  const router = useRouter();
  const scrollY = new Animated.Value(0);

  // Load listings from Supabase
  const loadListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
      setFilteredListings(data || []);
      
      // Load seller profiles for all listings
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(listing => listing.user_id))];
        await loadSellerProfiles(userIds);
      }
    } catch (error: any) {
      console.error('Error fetching listings:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load seller profiles
  const loadSellerProfiles = async (userIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, profile_photo')
        .in('id', userIds);

      if (error) throw error;
      
      // Create a map of user_id to profile
      const profilesMap: { [key: string]: any } = {};
      data?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
      
      setSellerProfiles(profilesMap);
    } catch (error: any) {
      console.error('Error fetching seller profiles:', error.message);
    }
  };

  // Filter listings based on category and search
  const filterListings = () => {
    let filtered = [...listings];
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }
    
    setFilteredListings(filtered);
  };

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadListings();
  }, []);

  // Initialize and refresh
  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [selectedCategory, searchQuery, listings]);

  // Refresh listings when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [])
  );

  // Calculate header height animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [280 + STATUSBAR_HEIGHT, 180 + STATUSBAR_HEIGHT],
    extrapolate: 'clamp',
  });

  const searchOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Render each listing card
  const renderListingCard = ({ item, index }: { item: any; index: number }) => {
    const seller = sellerProfiles[item.user_id];
    const sellerName = seller?.name || 'Local Farmer';
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/listing/${item.id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.cardImageContainer}>
          {item.images?.[0] ? (
            <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.noImage]}>
              <Ionicons name="leaf-outline" size={40} color={COLORS.textLight} />
            </View>
          )}
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
          {/* Love icon for favorites */}
          <TouchableOpacity 
            style={styles.loveIcon}
            onPress={() => console.log('Add to favorites:', item.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="heart-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.priceLocationRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceCurrency}>$</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
            
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color={COLORS.textLight} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location || 'Location not specified'}
              </Text>
            </View>
          </View>
          
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>
              Quantity: {item.quantity} {item.unit}
            </Text>
          </View>
          
          <View style={styles.sellerInfo}>
            <View style={styles.sellerAvatar}>
              {seller?.profile_photo ? (
                <Image 
                  source={{ uri: seller.profile_photo }} 
                  style={styles.sellerImage} 
                />
              ) : (
                <Ionicons name="person-circle-outline" size={16} color={COLORS.primary} />
              )}
            </View>
            <Text style={styles.sellerText} numberOfLines={1}>
              {sellerName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render category chip
  const renderCategoryChip = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipSelected,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item && styles.categoryChipTextSelected,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Green header background that extends to top */}
      <Animated.View style={[styles.headerBackground, { height: headerHeight }]} />
      
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header content with proper spacing */}
          <View style={styles.headerContent}>
            <View style={styles.headerInner}>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.title}>AgroLink</Text>
              <Text style={styles.subtitle}>
                Find local produce & services directly from farmers
              </Text>
            </View>
            
            <Animated.View style={[styles.searchContainer, { opacity: searchOpacity }]}>
              <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for produce, tools, seeds..."
                placeholderTextColor="#95a5a6"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>

          {/* Main content area (kept exactly as it was) */}
          <View style={styles.mainContent}>
            {/* Categories Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity onPress={() => setSelectedCategory('All')}>
                  <Text style={styles.seeAllText}>Reset</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={CATEGORIES}
                renderItem={renderCategoryChip}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />
            </View>

            {/* Listings Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'All' ? 'Latest Listings' : selectedCategory}
                </Text>
                <Text style={styles.resultsCount}>
                  {filteredListings.length} items
                </Text>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingCard}>
                    <View style={[styles.cardImage, styles.loadingImage]} />
                    <View style={styles.loadingContent}>
                      <View style={styles.loadingLine} />
                      <View style={[styles.loadingLine, { width: '70%' }]} />
                      <View style={[styles.loadingLine, { width: '50%' }]} />
                    </View>
                  </View>
                  <View style={styles.loadingCard}>
                    <View style={[styles.cardImage, styles.loadingImage]} />
                    <View style={styles.loadingContent}>
                      <View style={styles.loadingLine} />
                      <View style={[styles.loadingLine, { width: '70%' }]} />
                      <View style={[styles.loadingLine, { width: '50%' }]} />
                    </View>
                  </View>
                </View>
              ) : filteredListings.length > 0 ? (
                <View style={styles.listingsGrid}>
                  {filteredListings.map((item, index) => (
                    <View key={item.id} style={styles.gridItem}>
                      {renderListingCard({ item, index })}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="leaf-outline" size={60} color={COLORS.border} />
                  <Text style={styles.emptyStateTitle}>
                    {searchQuery ? 'No matching results' : 'No listings yet'}
                  </Text>
                  <Text style={styles.emptyStateText}>
                    {searchQuery 
                      ? 'Try different keywords or categories'
                      : 'Be the first to list your farm products!'
                    }
                  </Text>
                  <TouchableOpacity 
                    style={styles.sellButton}
                    onPress={() => router.push('/sell')}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.sellButtonText}>Sell Your Products</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  safeArea: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: STATUSBAR_HEIGHT + 0,
  },
  headerInner: {
    marginTop: 0,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.lightGreen,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.lightGreen,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  mainContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 24,
    marginTop: 20,
    minHeight: '100%',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 40 - 12) / 2,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.lightGreen,
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loveIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6, // Reduced from 12px
    lineHeight: 4, // Reduced from 20px
    minHeight: 36, // Reduced from 40px
  },
  priceLocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4, // Reduced from 8px
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },
  priceCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
    flexShrink: 1,
  },
  quantityRow: {
    marginBottom: 10, // Slightly reduced
  },
  quantityLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10, // Slightly reduced
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sellerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6, // Reduced from 8px
    overflow: 'hidden',
  },
  sellerImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  sellerText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingCard: {
    width: (width - 40 - 12) / 2,
    marginBottom: 16,
  },
  loadingImage: {
    backgroundColor: COLORS.border,
  },
  loadingContent: {
    padding: 14,
  },
  loadingLine: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  sellButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});