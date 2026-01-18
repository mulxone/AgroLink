import React, { useState, useEffect, useCallback } from 'react';
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
  StatusBar,
  Platform,
} from 'react-native';
import { supabase } from '../../supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

// Color palette
const COLORS = {
  primary: '#158F37',
  primaryDark: '#0d6e2a',
  secondary: '#40B385',
  accent: '#FF6B35',
  background: '#FAFAFA',
  cardBg: '#FFFFFF',
  textDark: '#1A1A1A',
  textMedium: '#666666',
  textLight: '#999999',
  border: '#EEEEEE',
  success: '#4CAF50',
  shadow: 'rgba(0, 0, 0, 0.08)',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  lightGreen: '#d8f3dc',
};

export default function SellerShop() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [seller, setSeller] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch seller info and their listings
  const loadShopData = async () => {
    setLoading(true);
    try {
      // Fetch seller info
      const { data: sellerData, error: sellerError } = await supabase
        .from('users')
        .select('id, name, profile_photo')
        .eq('id', id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      // Fetch seller's listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;
      setListings(listingsData || []);
    } catch (error: any) {
      console.error('Error loading shop data:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadShopData();
  }, []);

  // Initialize
  useEffect(() => {
    loadShopData();
  }, [id]);

  // Filter listings based on search
  const filteredListings = searchQuery.trim() === '' 
    ? listings 
    : listings.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Render each listing card
  const renderListingCard = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/listing/${item.id}`)}
        activeOpacity={0.95}
      >
        <View style={styles.cardImageContainer}>
          {item.images?.[0] ? (
            <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.noImage]}>
              <Ionicons name="leaf-outline" size={36} color={COLORS.textLight} />
            </View>
          )}
          
          {/* Category badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceCurrency}>K</Text>
            <Text style={styles.priceMain}>{item.price}</Text>
            <Text style={styles.eachText}> each</Text>
          </View>
          
          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textMedium} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location || 'Location not specified'}
            </Text>
          </View>
          
          {/* Quantity */}
          <View style={styles.quantityContainer}>
            <Ionicons name="cube-outline" size={12} color={COLORS.textLight} />
            <Text style={styles.quantityText}>
              {item.quantity} {item.unit}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render skeleton loading card
  const renderSkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '60%' }]} />
        <View style={[styles.skeletonLine, { width: '40%' }]} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      
      {/* Header background */}
      <View style={styles.headerBackground} />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              progressBackgroundColor={COLORS.white}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header with seller info */}
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            <View style={styles.sellerHeader}>
              <View style={styles.sellerAvatar}>
                {seller?.profile_photo ? (
                  <Image 
                    source={{ uri: seller.profile_photo }} 
                    style={styles.sellerImage} 
                  />
                ) : (
                  <Ionicons name="person-circle-outline" size={70} color={COLORS.white} />
                )}
              </View>
              
              <Text style={styles.sellerName}>
                {seller?.name || 'Loading...'}
              </Text>
              
              <View style={styles.sellerStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{listings.length}</Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>4.8</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>50+</Text>
                  <Text style={styles.statLabel}>Sales</Text>
                </View>
              </View>
              
              <View style={styles.sellerVerified}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.verifiedText}>Verified Seller</Text>
              </View>
            </View>
            
            {/* Search bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search in this shop..."
                placeholderTextColor="#95a5a6"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Main content */}
          <View style={styles.mainContent}>
            {/* Shop info */}
            <View style={styles.shopInfo}>
              <View style={styles.shopInfoHeader}>
                <Ionicons name="storefront-outline" size={24} color={COLORS.primary} />
                <Text style={styles.shopTitle}>{seller?.name || 'Seller'}'s Shop</Text>
              </View>
              <Text style={styles.shopDescription}>
                Browse all products from this trusted seller. All items are fresh and ready for purchase.
              </Text>
            </View>

            {/* Products section */}
            <View style={styles.productsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  All Products ({filteredListings.length})
                </Text>
                <View style={styles.filterContainer}>
                  <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="filter-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.filterText}>Filter</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {loading ? (
                <View style={styles.loadingGrid}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View key={i} style={styles.gridItem}>
                      {renderSkeletonCard()}
                    </View>
                  ))}
                </View>
              ) : filteredListings.length > 0 ? (
                <View style={styles.listingsGrid}>
                  {filteredListings.map((item) => (
                    <View key={item.id} style={styles.gridItem}>
                      {renderListingCard({ item })}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateIcon}>
                    <Ionicons name="bag-handle-outline" size={48} color={COLORS.border} />
                  </View>
                  <Text style={styles.emptyStateTitle}>
                    {searchQuery ? 'No matching products' : 'No products yet'}
                  </Text>
                  <Text style={styles.emptyStateText}>
                    {searchQuery 
                      ? 'Try different search terms'
                      : 'This seller hasn\'t listed any products yet'
                    }
                  </Text>
                </View>
              )}
            </View>

            {/* Seller info card */}
            <View style={styles.sellerInfoCard}>
              <Text style={styles.infoCardTitle}>About This Seller</Text>
              <View style={styles.infoCardContent}>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Response Time</Text>
                    <Text style={styles.infoValue}>Usually responds within 1 hour</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="checkmark-done-outline" size={18} color={COLORS.primary} />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Transaction Success</Text>
                    <Text style={styles.infoValue}>98% positive feedback</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="star-outline" size={18} color={COLORS.primary} />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Seller Rating</Text>
                    <Text style={styles.infoValue}>4.8 out of 5 stars</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Safety note */}
            <View style={styles.safetyNote}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.success} />
              <Text style={styles.safetyText}>
                Shop with confidence. All sellers on AgroLink are verified for your safety.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  safeArea: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: COLORS.primaryDark,
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
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  sellerHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sellerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  sellerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  sellerName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sellerVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  verifiedText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  clearButton: {
    padding: 2,
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
  shopInfo: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  shopInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginLeft: 12,
  },
  shopDescription: {
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  productsSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 40 - 12) / 2,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  cardImageContainer: {
    position: 'relative',
    height: 140,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
    lineHeight: 18,
    minHeight: 36,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceMain: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  eachText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
    marginLeft: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginLeft: 4,
    flexShrink: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  quantityText: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '700',
    marginLeft: 4,
  },
  skeletonCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  skeletonImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.border,
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginTop: 10,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  sellerInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  infoCardContent: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textMedium,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGreen,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  safetyText: {
    fontSize: 14,
    color: COLORS.textDark,
    flex: 1,
    lineHeight: 20,
  },
});