import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Modal,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { supabase } from '../../supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');
const COLORS = {
  primary: '#2d6a4f',
  secondary: '#40916c',
  lightGreen: '#d8f3dc',
  background: '#f8f9fa',
  cardBg: '#ffffff',
  textDark: '#1b4332',
  textLight: '#52796f',
  accent: '#f48c06',
  border: '#e9ecef',
  error: '#e63946',
  success: '#2a9d8f',
};

export default function ListingDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showPhone, setShowPhone] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const scrollX = new Animated.Value(0);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*, profiles(username, avatar_url)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setListing(data);
      
      // Fetch user data if available
      if (data.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user_id)
          .single();
        setUserData(profileData);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      Alert.alert('Error', 'Could not load listing details');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (listing?.phone) {
      Linking.openURL(`tel:${listing.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (listing?.phone) {
      const message = `Hi! I'm interested in your listing: ${listing.title}`;
      const url = `https://wa.me/${listing.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      Linking.openURL(url);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this listing: ${listing.title} - $${listing.price} per ${listing.unit}`,
        url: `https://yourapp.com/listing/${id}`,
        title: listing.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Listing',
      'Are you sure you want to report this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: () => {
            // Implement report functionality
            Alert.alert('Reported', 'Thank you for your report. We will review this listing.');
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingImage} />
          <View style={styles.loadingContent}>
            <View style={styles.loadingLine} />
            <View style={[styles.loadingLine, { width: '70%' }]} />
            <View style={[styles.loadingLine, { width: '50%' }]} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
          <Text style={styles.errorTitle}>Listing Not Found</Text>
          <Text style={styles.errorText}>This listing may have been removed or is no longer available.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Back to Marketplace</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            {listing.images?.map((image: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedImage(index);
                  setModalVisible(true);
                }}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.mainImage}
                  onLoadEnd={() => setImageLoading(false)}
                />
                {imageLoading && (
                  <View style={styles.imageLoading}>
                    <Ionicons name="leaf-outline" size={40} color={COLORS.textLight} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Image Pagination */}
          {listing.images?.length > 1 && (
            <View style={styles.pagination}>
              {listing.images.map((_: any, i: number) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.8, 1.4, 0.8],
                  extrapolate: 'clamp',
                });
                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.4, 1, 0.4],
                  extrapolate: 'clamp',
                });
                
                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.paginationDot,
                      {
                        transform: [{ scale }],
                        opacity,
                      },
                    ]}
                  />
                );
              })}
            </View>
          )}
          
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButtonFloating}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          
          {/* Share Button */}
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Ionicons name="pricetag-outline" size={14} color={COLORS.primary} />
            <Text style={styles.categoryText}>{listing.category}</Text>
          </View>

          {/* Title and Price */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.title}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceCurrency}>$</Text>
              <Text style={styles.price}>{listing.price}</Text>
              <Text style={styles.unit}>/{listing.unit}</Text>
            </View>
          </View>

          {/* Seller Info */}
          <TouchableOpacity style={styles.sellerContainer}>
            <View style={styles.sellerAvatar}>
              {userData?.avatar_url ? (
                <Image source={{ uri: userData.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>
                {userData?.username || 'Local Farmer'}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={COLORS.accent} />
                <Text style={styles.ratingText}>4.8 • 50+ sales</Text>
              </View>
              <Text style={styles.sellerStatus}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                <Text> Verified Seller</Text>
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <Text style={styles.description}>{listing.description || 'No description provided.'}</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textLight} />
                <View>
                  <Text style={styles.detailLabel}>Listed</Text>
                  <Text style={styles.detailValue}>
                    {new Date(listing.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="scale-outline" size={20} color={COLORS.textLight} />
                <View>
                  <Text style={styles.detailLabel}>Quantity Available</Text>
                  <Text style={styles.detailValue}>
                    {listing.quantity ? `${listing.quantity} ${listing.unit}` : 'Contact for availability'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="cube-outline" size={20} color={COLORS.textLight} />
                <View>
                  <Text style={styles.detailLabel}>Condition</Text>
                  <Text style={styles.detailValue}>Fresh</Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="refresh-circle-outline" size={20} color={COLORS.textLight} />
                <View>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Available</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <Text style={styles.locationText}>
                {listing.location || 'Location not specified'}
              </Text>
            </View>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.mapText}>Interactive map would appear here</Text>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Seller</Text>
            <Text style={styles.contactDescription}>
              Get in touch with the seller for more details or to arrange pickup/delivery.
            </Text>
            
            <View style={styles.contactButtons}>
              <TouchableOpacity 
                style={[styles.contactButton, styles.callButton]}
                onPress={handleCall}
              >
                <Ionicons name="call-outline" size={22} color="#fff" />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.contactButton, styles.whatsappButton]}
                onPress={handleWhatsApp}
              >
                <Ionicons name="logo-whatsapp" size={22} color="#fff" />
                <Text style={styles.contactButtonText}>WhatsApp</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.contactButton, styles.messageButton]}
                onPress={() => setShowPhone(!showPhone)}
              >
                <Ionicons name="chatbubble-outline" size={22} color="#fff" />
                <Text style={styles.contactButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
            
            {showPhone && (
              <View style={styles.phoneContainer}>
                <Text style={styles.phoneLabel}>Phone Number:</Text>
                <Text style={styles.phoneNumber}>{listing.phone}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => {
                    // Implement copy to clipboard
                    Alert.alert('Copied!', 'Phone number copied to clipboard');
                  }}
                >
                  <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.copyText}>Copy</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Safety Tips */}
          <View style={styles.safetySection}>
            <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.success} />
            <View style={styles.safetyContent}>
              <Text style={styles.safetyTitle}>Safety Tips</Text>
              <Text style={styles.safetyText}>
                • Meet in public places{'\n'}
                • Inspect items before buying{'\n'}
                • Avoid sharing personal information{'\n'}
                • Report suspicious activity
              </Text>
            </View>
          </View>

          {/* Report Button */}
          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Ionicons name="flag-outline" size={18} color={COLORS.error} />
            <Text style={styles.reportText}>Report Listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View>
            <Text style={styles.bottomPriceLabel}>Total Price</Text>
            <View style={styles.bottomPriceContainer}>
              <Text style={styles.bottomPriceCurrency}>$</Text>
              <Text style={styles.bottomPrice}>{listing.price}</Text>
              <Text style={styles.bottomUnit}>/{listing.unit}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.inquiryButton}
            onPress={() => setShowPhone(true)}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
            <Text style={styles.inquiryButtonText}>Contact Seller</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          
          <ScrollView 
            horizontal 
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.modalScrollView}
          >
            {listing.images?.map((image: string, index: number) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          
          <View style={styles.modalPagination}>
            {listing.images?.map((_: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.modalDot,
                  selectedImage === i && styles.modalDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    height: 380,
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 380,
    resizeMode: 'cover',
  },
  imageLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  backButtonFloating: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 120, // Extra padding for bottom bar
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 16,
    lineHeight: 30,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  unit: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGreen,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  sellerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  sellerStatus: {
    fontSize: 12,
    color: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 15,
    color: COLORS.textDark,
    marginLeft: 8,
    flex: 1,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 4,
    gap: 8,
  },
  callButton: {
    backgroundColor: COLORS.primary,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  messageButton: {
    backgroundColor: COLORS.secondary,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  phoneContainer: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  phoneLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  copyText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  safetySection: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGreen,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  safetyContent: {
    flex: 1,
    marginLeft: 12,
  },
  safetyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  safetyText: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  reportText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  bottomPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPriceCurrency: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  bottomUnit: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  inquiryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  inquiryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  modalScrollView: {
    width: width,
  },
  modalImage: {
    width: width,
    height: 400,
  },
  modalPagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  modalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  modalDotActive: {
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
  },
  loadingImage: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.border,
    borderRadius: 16,
    marginBottom: 20,
  },
  loadingContent: {
    padding: 20,
  },
  loadingLine: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    marginBottom: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});