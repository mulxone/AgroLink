

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
  Animated,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { supabase } from '../../supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

// Modern color palette
const COLORS = {
  primary: '#56bdbd', // Modern blue
  secondary: '#7C3AED', // Purple
  accent: '#F59E0B', // Amber
  success: '#10B981', // Emerald
  background: '#fdfdfd',
  cardBg: '#f3f4f7',
  textDark: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  danger: '#EF4444',
};

// Main Categories with subcategories
const CATEGORIES = [
  { 
    id: 'all',
    name: 'All',
    icon: 'grid',
    color: COLORS.primary
  },
  { 
    id: 'farm',
    name: 'Farm',
    icon: 'leaf',
    color: '#10B981',
    subcategories: ['Produce', 'Livestock', 'Equipment', 'Seeds', 'Fertilizers', 'Tools', 'Vets']
  },
  { 
    id: 'fashion',
    name: 'Fashion',
    icon: 'shirt',
    color: '#EC4899',
    subcategories: ['Clothing', 'Shoes', 'Accessories', 'Jewelry', 'Bags', 'Traditional Wear']
  },
  { 
    id: 'tech',
    name: 'Tech',
    icon: 'phone-portrait',
    color: '#3B82F6',
    subcategories: ['Phones', 'Laptops', 'Electronics', 'Accessories', 'Gaming', 'Home Appliances']
  },
  { 
    id: 'auto',
    name: 'Auto',
    icon: 'car',
    color: '#6B7280',
    subcategories: ['Cars', 'Parts', 'Motorcycles', 'Services', 'Accessories', 'Tires']
  },
  { 
    id: 'property',
    name: 'Property',
    icon: 'business',
    color: '#8B5CF6',
    subcategories: ['Houses', 'Land','Rentals','Commercial','Furniture']
  },
  { 
    id: 'services',
    name: 'Services',
    icon: 'construct',
    color: '#F59E0B',
    subcategories: ['Repairs', 'Cleaning', 'Consulting', 'Transport', 'Events', 'jobs']
  },
  { 
    id: 'health',
    name: 'Health',
    icon: 'medical',
    color: '#EF4444',
    subcategories: ['Personal Care','Wellness','Beauty','Fitness','Medicines', 'Equipment',]
  }
];

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sellerProfiles, setSellerProfiles] = useState<{ [key: string]: any }>({});
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
  const router = useRouter();
  const scrollY = new Animated.Value(0);

  // Animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [280 + STATUSBAR_HEIGHT, 200 + STATUSBAR_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  // Load listings
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
      
      // Load seller profiles
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

  const loadSellerProfiles = async (userIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, profile_photo, rating')
        .in('id', userIds);

      if (error) throw error;
      
      const profilesMap: { [key: string]: any } = {};
      data?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
      
      setSellerProfiles(profilesMap);
    } catch (error: any) {
      console.error('Error fetching seller profiles:', error.message);
    }
  };

  // Filter listings
  const filterListings = () => {
    let filtered = [...listings];
    
    // Filter by main category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.main_category === selectedCategory || 
        item.category === selectedCategory
      );
    }
    
    // Filter by subcategory
    if (selectedSubcategory) {
      filtered = filtered.filter(item => 
        item.subcategory === selectedSubcategory ||
        item.category === selectedSubcategory
      );
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredListings(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadListings();
  }, []);

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [selectedCategory, selectedSubcategory, searchQuery, listings]);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [])
  );

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || 'grid';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.color || COLORS.primary;
  };

  // Render listing card
  const renderListingCard = ({ item }: { item: any }) => {
    const seller = sellerProfiles[item.user_id];
    const categoryColor = getCategoryColor(item.main_category || item.category);
    const categoryName = CATEGORIES.find(c => c.id === (item.main_category || item.category))?.name || 
                        (item.main_category || item.category);
    
    return (
      <TouchableOpacity 
        style={[styles.card, activeTab === 'list' && styles.listCard]}
        onPress={() => router.push(`/listing/${item.id}`)}
        activeOpacity={0.9}
      >
        <View style={[styles.cardImageContainer, activeTab === 'list' && styles.listImageContainer]}>
          {item.images?.[0] ? (
            <Image source={{ uri: item.images[0] }} style={[styles.cardImage, activeTab === 'list' && styles.listImage]} />
          ) : (
            <View style={[styles.cardImage, styles.noImage, { backgroundColor: categoryColor + '20' }]}>
              <Ionicons name={getCategoryIcon(item.main_category || item.category) as any} 
                size={activeTab === 'grid' ? 32 : 24} 
                color={categoryColor} 
              />
            </View>
          )}
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
          )}
        </View>
        
        <View style={[styles.cardContent, activeTab === 'list' && styles.listContent]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={activeTab === 'grid' ? 2 : 1}>
              {item.title}
            </Text>
            <TouchableOpacity 
              style={styles.loveIcon}
              onPress={() => console.log('Add to favorites:', item.id)}
            >
              <Ionicons name="heart-outline" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
          
          {/* Category Tag Row - Replaces Description */}
          <View style={styles.categoryTagRow}>
            <View style={[styles.categoryTag, { backgroundColor: categoryColor }]}>
              <Ionicons 
                name={getCategoryIcon(item.main_category || item.category) as any} 
                size={12} 
                color="#FFF" 
                style={styles.categoryTagIcon}
              />
              <Text style={styles.categoryTagText} numberOfLines={1}>
                {categoryName}
              </Text>
            </View>
            
            {/* Subcategory Tag (if exists) */}
            {item.subcategory && (
              <View style={[styles.subcategoryTag, { borderColor: categoryColor }]}>
                <Text style={[styles.subcategoryTagText, { color: categoryColor }]} numberOfLines={1}>
                  {item.subcategory}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceCurrency}>K</Text>
              <Text style={styles.price}>{item.price.toLocaleString()}</Text>
              {item.original_price && (
                <Text style={styles.originalPrice}>
                  K{item.original_price.toLocaleString()}
                </Text>
              )}
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={COLORS.accent} />
              <Text style={styles.ratingText}>
                {seller?.rating || 'New'}
              </Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={12} color={COLORS.textLight} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location || 'Nationwide'}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              {seller?.profile_photo ? (
                <Image source={{ uri: seller.profile_photo }} style={styles.sellerImage} />
              ) : (
                <Ionicons name="person-circle-outline" size={16} color={categoryColor} />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render category button
  const renderCategoryButton = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && { backgroundColor: item.color + '20' }
      ]}
      onPress={() => {
        setSelectedCategory(item.id);
        setSelectedSubcategory(null);
      }}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={20} color="#FFF" />
      </View>
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item.id && { color: item.color, fontWeight: '700' }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render subcategory chip
  const renderSubcategoryChip = ({ item }: { item: string }) => {
    const category = CATEGORIES.find(c => c.id === selectedCategory);
    const categoryColor = category?.color || COLORS.primary;
    
    return (
      <TouchableOpacity
        style={[
          styles.subcategoryChip,
          selectedSubcategory === item && { backgroundColor: categoryColor, borderColor: categoryColor }
        ]}
        onPress={() => setSelectedSubcategory(selectedSubcategory === item ? null : item)}
      >
        <Text style={[
          styles.subcategoryChipText,
          selectedSubcategory === item && { color: '#FFF' }
        ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Animated Header Background */}
      <Animated.View style={[
        styles.headerBackground, 
        { 
          height: headerHeight,
          opacity: headerOpacity 
        }
      ]} />
      
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
          {/* Header */}
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.welcomeText}>Welcome to</Text>
                <Text style={styles.title}>MaShop</Text>
                <Text style={styles.subtitle}>Find your products & services across Zambia</Text>
              </View>
              <TouchableOpacity 
                style={styles.cartButton}
                onPress={() => router.push('/cart')}
              >
                <Ionicons name="cart-outline" size={24} color="#FFF" />
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textLight} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search across all categories..."
                placeholderTextColor={COLORS.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Shop by Category</Text>
                <TouchableOpacity onPress={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory(null);
                }}>
                  <Text style={styles.seeAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={CATEGORIES}
                renderItem={renderCategoryButton}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />
            </View>

            {/* Subcategories (if selected) */}
            {selectedCategory !== 'all' && CATEGORIES.find(c => c.id === selectedCategory)?.subcategories && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Subcategories</Text>
                  <TouchableOpacity onPress={() => setSelectedSubcategory(null)}>
                    <Text style={styles.seeAllText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={CATEGORIES.find(c => c.id === selectedCategory)?.subcategories || []}
                  renderItem={renderSubcategoryChip}
                  keyExtractor={(item) => item}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.subcategoriesList}
                />
              </View>
            )}

            {/* Listings Header */}
            <View style={styles.listingsHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'all' ? 'All Products' : 
                   CATEGORIES.find(c => c.id === selectedCategory)?.name}
                </Text>
                <Text style={styles.resultsCount}>
                  {filteredListings.length} products found
                </Text>
              </View>
              <View style={styles.viewToggle}>
                <TouchableOpacity 
                  style={[styles.toggleButton, activeTab === 'grid' && styles.toggleButtonActive]}
                  onPress={() => setActiveTab('grid')}
                >
                  <Ionicons 
                    name="grid" 
                    size={20} 
                    color={activeTab === 'grid' ? COLORS.primary : COLORS.textLight} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleButton, activeTab === 'list' && styles.toggleButtonActive]}
                  onPress={() => setActiveTab('list')}
                >
                  <Ionicons 
                    name="list" 
                    size={20} 
                    color={activeTab === 'list' ? COLORS.primary : COLORS.textLight} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Listings */}
            {loading ? (
              <View style={styles.loadingContainer}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={[styles.loadingCard, activeTab === 'list' && styles.listCard]}>
                    <View style={[styles.cardImage, styles.loadingImage]} />
                    <View style={styles.loadingContent}>
                      <View style={styles.loadingLine} />
                      <View style={[styles.loadingLine, { width: '70%' }]} />
                      <View style={[styles.loadingLine, { width: '50%' }]} />
                    </View>
                  </View>
                ))}
              </View>
            ) : filteredListings.length > 0 ? (
              activeTab === 'grid' ? (
                <View style={styles.listingsGrid}>
                  {filteredListings.map((item) => (
                    <View key={item.id} style={styles.gridItem}>
                      {renderListingCard({ item })}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.listingsList}>
                  {filteredListings.map((item) => (
                    <View key={item.id} style={styles.listItem}>
                      {renderListingCard({ item })}
                    </View>
                  ))}
                </View>
              )
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={80} color={COLORS.border} />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery ? 'No results found' : 'No listings yet'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery 
                    ? 'Try different keywords or categories'
                    : 'Be the first to list your products!'
                  }
                </Text>
                <TouchableOpacity 
                  style={styles.sellButton}
                  onPress={() => router.push('/sell')}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.sellButtonText}>List Your Product</Text>
                </TouchableOpacity>
              </View>
            )}
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: STATUSBAR_HEIGHT + 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cartButton: {
    padding: 10,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.danger,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  mainContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    minHeight: '100%',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoriesList: {
    paddingRight: 20,
    gap: 16,
  },
  categoryButton: {
    alignItems: 'center',
    width: 70,
    padding: 8,
    borderRadius: 16,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  subcategoriesList: {
    paddingRight: 20,
    gap: 8,
  },
  subcategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subcategoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary + '10',
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
  listingsList: {
    gap: 16,
  },
  listItem: {
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
  listCard: {
    flexDirection: 'row',
    height: 140,
  },
  cardImageContainer: {
    position: 'relative',
  },
  listImageContainer: {
    width: 140,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  listImage: {
    height: '100%',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  cardContent: {
    padding: 14,
  },
  listContent: {
    flex: 1,
    paddingVertical: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 8,
  },
  loveIcon: {
    padding: 2,
  },
  categoryTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: '70%',
  },
  categoryTagIcon: {
    marginRight: 4,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'capitalize',
  },
  subcategoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#FFF',
    maxWidth: '30%',
  },
  subcategoryTagText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textLight,
    flex: 1,
  },
  sellerInfo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    width: (width - 40 - 12) / 2,
  },
  loadingImage: {
    height: 120,
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
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sellButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});