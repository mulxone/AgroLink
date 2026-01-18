


// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   Dimensions,
//   Animated,
//   Modal,
//   Share,
//   Alert,
//   Platform,
//   FlatList,
// } from 'react-native';
// import { supabase } from '../../supabase';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import * as Linking from 'expo-linking';

// const { width, height } = Dimensions.get('window');
// const COLORS = {
//   primary: '#2d6a4f',
//   secondary: '#40916c',
//   lightGreen: '#d8f3dc',
//   background: '#f8f9fa',
//   cardBg: '#ffffff',
//   textDark: '#1b4332',
//   textLight: '#52796f',
//   accent: '#f48c06',
//   border: '#e9ecef',
//   error: '#e63946',
//   success: '#2a9d8f',
// };

// export default function ListingDetail() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();
//   const [listing, setListing] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [userData, setUserData] = useState<any>(null);
//   const [showPhone, setShowPhone] = useState(false);
//   const [imageLoading, setImageLoading] = useState(true);
//   const scrollX = useRef(new Animated.Value(0)).current;
//   const flatListRef = useRef<FlatList>(null);

//   useEffect(() => {
//     fetchListing();
//   }, [id]);

//   const fetchListing = async () => {
//     try {
//       // First, fetch the listing
//       const { data: listingData, error: listingError } = await supabase
//         .from('listings')
//         .select('*')
//         .eq('id', id)
//         .single();

//       if (listingError) throw listingError;
//       setListing(listingData);
      
//       // Then fetch user data separately from 'users' table
//       if (listingData.user_id) {
//         const { data: userData, error: userError } = await supabase
//           .from('users')
//           .select('name, profile_photo')
//           .eq('id', listingData.user_id)
//           .single();
        
//         if (userError) {
//           console.warn('Error fetching user data:', userError.message);
//           setUserData({ name: 'Local Farmer', profile_photo: null });
//         } else {
//           setUserData(userData);
//         }
//       } else {
//         setUserData({ name: 'Local Farmer', profile_photo: null });
//       }
//     } catch (error: any) {
//       console.error('Error fetching listing:', error);
//       Alert.alert('Error', 'Could not load listing details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCall = () => {
//     if (listing?.phone) {
//       Linking.openURL(`tel:${listing.phone}`);
//     }
//   };

//   const handleShare = async () => {
//     try {
//       await Share.share({
//         message: `Check out this listing: ${listing.title} - K${listing.price} per ${listing.unit}`,
//         url: `https://yourapp.com/listing/${id}`,
//         title: listing.title,
//       });
//     } catch (error) {
//       console.error('Error sharing:', error);
//     }
//   };

//   const handleViewShop = () => {
//     if (listing?.user_id) {
//       router.push(`/shop/${listing.user_id}`);
//     } else {
//       Alert.alert('Error', 'Unable to view shop. Seller information not available.');
//     }
//   };

//   const handleReport = () => {
//     Alert.alert(
//       'Report Listing',
//       'Are you sure you want to report this listing?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Report', 
//           style: 'destructive',
//           onPress: () => {
//             Alert.alert('Reported', 'Thank you for your report. We will review this listing.');
//           }
//         },
//       ]
//     );
//   };

//   const handleImageSelect = (index: number) => {
//     setSelectedImage(index);
//     if (flatListRef.current) {
//       flatListRef.current.scrollToIndex({
//         index,
//         animated: true,
//       });
//     }
//   };

//   const renderImageThumbnail = ({ item, index }: { item: string; index: number }) => (
//     <TouchableOpacity
//       onPress={() => handleImageSelect(index)}
//       style={[
//         styles.thumbnailContainer,
//         selectedImage === index && styles.thumbnailContainerActive,
//       ]}
//     >
//       <Image
//         source={{ uri: item }}
//         style={styles.thumbnail}
//         resizeMode="cover"
//       />
//       {selectedImage === index && <View style={styles.thumbnailOverlay} />}
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <View style={styles.loadingImage} />
//         <View style={styles.loadingContent}>
//           <View style={styles.loadingLine} />
//           <View style={[styles.loadingLine, { width: '70%' }]} />
//           <View style={[styles.loadingLine, { width: '50%' }]} />
//         </View>
//       </View>
//     );
//   }

//   if (!listing) {
//     return (
//       <View style={styles.errorContainer}>
//         <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
//         <Text style={styles.errorTitle}>Listing Not Found</Text>
//         <Text style={styles.errorText}>This listing may have been removed or is no longer available.</Text>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <Ionicons name="arrow-back" size={20} color="#fff" />
//           <Text style={styles.backButtonText}>Back to Marketplace</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Image Carousel - Extended to top */}
//       <View style={styles.imageSection}>
//         <Animated.FlatList
//           ref={flatListRef}
//           data={listing.images}
//           horizontal
//           pagingEnabled
//           showsHorizontalScrollIndicator={false}
//           onScroll={Animated.event(
//             [{ nativeEvent: { contentOffset: { x: scrollX } } }],
//             { useNativeDriver: false }
//           )}
//           scrollEventThrottle={16}
//           onMomentumScrollEnd={(event) => {
//             const index = Math.round(event.nativeEvent.contentOffset.x / width);
//             setSelectedImage(index);
//           }}
//           renderItem={({ item, index }) => (
//             <TouchableOpacity
//               onPress={() => {
//                 setSelectedImage(index);
//                 setModalVisible(true);
//               }}
//               activeOpacity={0.9}
//             >
//               <Image
//                 source={{ uri: item }}
//                 style={styles.mainImage}
//                 onLoadEnd={() => setImageLoading(false)}
//               />
//               {imageLoading && (
//                 <View style={styles.imageLoading}>
//                   <Ionicons name="leaf-outline" size={40} color={COLORS.textLight} />
//                 </View>
//               )}
//             </TouchableOpacity>
//           )}
//           keyExtractor={(item, index) => index.toString()}
//         />
        
//         {/* Image Pagination */}
//         {listing.images?.length > 1 && (
//           <View style={styles.pagination}>
//             {listing.images.map((_: any, i: number) => {
//               const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
//               const scale = scrollX.interpolate({
//                 inputRange,
//                 outputRange: [0.8, 1.4, 0.8],
//                 extrapolate: 'clamp',
//               });
//               const opacity = scrollX.interpolate({
//                 inputRange,
//                 outputRange: [0.4, 1, 0.4],
//                 extrapolate: 'clamp',
//               });
              
//               return (
//                 <Animated.View
//                   key={i}
//                   style={[
//                     styles.paginationDot,
//                     {
//                       transform: [{ scale }],
//                       opacity,
//                     },
//                   ]}
//                 />
//               );
//             })}
//           </View>
//         )}
        
//         {/* Back Button */}
//         <TouchableOpacity 
//           style={styles.backButtonFloating}
//           onPress={() => router.back()}
//         >
//           <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
//         </TouchableOpacity>
        
//         {/* Share Button */}
//         <TouchableOpacity 
//           style={styles.shareButton}
//           onPress={handleShare}
//         >
//           <Ionicons name="share-outline" size={22} color={COLORS.textDark} />
//         </TouchableOpacity>
//       </View>

//       {/* Image Thumbnails - Only show if multiple images */}
//       {listing.images?.length > 1 && (
//         <View style={styles.thumbnailsContainer}>
//           <FlatList
//             data={listing.images}
//             renderItem={renderImageThumbnail}
//             keyExtractor={(item, index) => index.toString()}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.thumbnailsList}
//           />
//         </View>
//       )}

//       {/* Content */}
//       <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
//         <View style={styles.content}>
//           {/* Category Badge */}
//           <View style={styles.categoryBadge}>
//             <Ionicons name="pricetag-outline" size={14} color={COLORS.primary} />
//             <Text style={styles.categoryText}>{listing.category}</Text>
//           </View>

//           {/* Title and Price */}
//           <View style={styles.titleRow}>
//             <Text style={styles.title}>{listing.title}</Text>
//             <View style={styles.priceContainer}>
//               <Text style={styles.priceCurrency}>K</Text>
//               <Text style={styles.price}>{listing.price}</Text>
//               <Text style={styles.eachText}> each</Text>
//             </View>
//           </View>

//           {/* Seller Info with Shop Button */}
//           <View style={styles.sellerContainer}>
//             <View style={styles.sellerInfoLeft}>
//               <View style={styles.sellerAvatar}>
//                 {userData?.profile_photo ? (
//                   <Image source={{ uri: userData.profile_photo }} style={styles.avatarImage} />
//                 ) : (
//                   <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
//                 )}
//               </View>
//               <View style={styles.sellerInfo}>
//                 <Text style={styles.sellerName}>
//                   {userData?.name || 'Local Farmer'}
//                 </Text>
//                 <View style={styles.ratingContainer}>
//                   <Ionicons name="star" size={14} color={COLORS.accent} />
//                   <Text style={styles.ratingText}>4.8 • 50+ sales</Text>
//                 </View>
//               </View>
//             </View>
//             <TouchableOpacity 
//               style={styles.shopButton}
//               onPress={handleViewShop}
//             >
//               <Ionicons name="storefront-outline" size={18} color={COLORS.primary} />
//               <Text style={styles.shopButtonText}>Shop</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Divider */}
//           <View style={styles.divider} />

//           {/* Details Section */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Product Details</Text>
//             <Text style={styles.description}>{listing.description || 'No description provided.'}</Text>
            
//             <View style={styles.detailsGrid}>
//               <View style={styles.detailItem}>
//                 <Ionicons name="location-outline" size={20} color={COLORS.textLight} />
//                 <View>
//                   <Text style={styles.detailLabel}>Location</Text>
//                   <Text style={styles.detailValue}>
//                     {listing.location || 'Location not specified'}
//                   </Text>
//                 </View>
//               </View>
              
//               <View style={styles.detailItem}>
//                 <Ionicons name="scale-outline" size={20} color={COLORS.textLight} />
//                 <View>
//                   <Text style={styles.detailLabel}>Quantity Available</Text>
//                   <Text style={styles.detailValue}>
//                     {listing.quantity ? `${listing.quantity} ${listing.unit}` : 'Contact for availability'}
//                   </Text>
//                 </View>
//               </View>
              
//               <View style={styles.detailItem}>
//                 <Ionicons name="calendar-outline" size={20} color={COLORS.textLight} />
//                 <View>
//                   <Text style={styles.detailLabel}>Listed</Text>
//                   <Text style={styles.detailValue}>
//                     {new Date(listing.created_at).toLocaleDateString()}
//                   </Text>
//                 </View>
//               </View>
              
//               <View style={styles.detailItem}>
//                 <Ionicons name="refresh-circle-outline" size={20} color={COLORS.textLight} />
//                 <View>
//                   <Text style={styles.detailLabel}>Status</Text>
//                   <View style={styles.statusBadge}>
//                     <View style={styles.statusDot} />
//                     <Text style={styles.statusText}>Available</Text>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </View>

//           {/* Contact Section */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Contact Seller</Text>
//             <Text style={styles.contactDescription}>
//               Get in touch with the seller for more details or to arrange pickup/delivery.
//             </Text>
            
//             <View style={styles.contactButtons}>
//               <TouchableOpacity 
//                 style={[styles.contactButton, styles.callButton]}
//                 onPress={handleCall}
//               >
//                 <Ionicons name="call-outline" size={22} color="#fff" />
//                 <Text style={styles.contactButtonText}>Call</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity 
//                 style={[styles.contactButton, styles.messageButton]}
//                 onPress={() => setShowPhone(!showPhone)}
//               >
//                 <Ionicons name="chatbubble-outline" size={22} color="#fff" />
//                 <Text style={styles.contactButtonText}>Message</Text>
//               </TouchableOpacity>
//             </View>
            
//             {showPhone && (
//               <View style={styles.phoneContainer}>
//                 <Text style={styles.phoneLabel}>Phone Number:</Text>
//                 <Text style={styles.phoneNumber}>{listing.phone}</Text>
//                 <TouchableOpacity 
//                   style={styles.copyButton}
//                   onPress={() => {
//                     Alert.alert('Copied!', 'Phone number copied to clipboard');
//                   }}
//                 >
//                   <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
//                   <Text style={styles.copyText}>Copy</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>

//           {/* Safety Tips */}
//           <View style={styles.safetySection}>
//             <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.success} />
//             <View style={styles.safetyContent}>
//               <Text style={styles.safetyTitle}>Safety Tips</Text>
//               <Text style={styles.safetyText}>
//                 • Meet in public places{'\n'}
//                 • Inspect items before buying{'\n'}
//                 • Avoid sharing personal information{'\n'}
//                 • Report suspicious activity
//               </Text>
//             </View>
//           </View>

//           {/* Report Button */}
//           <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
//             <Ionicons name="flag-outline" size={18} color={COLORS.error} />
//             <Text style={styles.reportText}>Report Listing</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Fixed Bottom Bar */}
//       <View style={styles.bottomBar}>
//         <View style={styles.bottomBarContent}>
//           <View>
//             <Text style={styles.bottomPriceLabel}>Price</Text>
//             <View style={styles.bottomPriceContainer}>
//               <Text style={styles.bottomPriceCurrency}>K</Text>
//               <Text style={styles.bottomPrice}>{listing.price}</Text>
//               <Text style={styles.bottomUnit}>/{listing.unit}</Text>
//             </View>
//           </View>
//           <TouchableOpacity 
//             style={styles.inquiryButton}
//             onPress={() => setShowPhone(true)}
//           >
//             <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
//             <Text style={styles.inquiryButtonText}>Contact Seller</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Image Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <TouchableOpacity 
//             style={styles.modalCloseButton}
//             onPress={() => setModalVisible(false)}
//           >
//             <Ionicons name="close" size={28} color="#fff" />
//           </TouchableOpacity>
          
//           <Animated.FlatList
//             data={listing.images}
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             initialScrollIndex={selectedImage}
//             onScroll={Animated.event(
//               [{ nativeEvent: { contentOffset: { x: scrollX } } }],
//               { useNativeDriver: false }
//             )}
//             onMomentumScrollEnd={(event) => {
//               const index = Math.round(event.nativeEvent.contentOffset.x / width);
//               setSelectedImage(index);
//             }}
//             renderItem={({ item }) => (
//               <Image
//                 source={{ uri: item }}
//                 style={styles.modalImage}
//                 resizeMode="contain"
//               />
//             )}
//             keyExtractor={(item, index) => index.toString()}
//           />
          
//           <View style={styles.modalPagination}>
//             {listing.images?.map((_: any, i: number) => (
//               <TouchableOpacity
//                 key={i}
//                 onPress={() => {
//                   setSelectedImage(i);
//                   if (flatListRef.current) {
//                     flatListRef.current.scrollToIndex({
//                       index: i,
//                       animated: true,
//                     });
//                   }
//                 }}
//               >
//                 <View
//                   style={[
//                     styles.modalDot,
//                     selectedImage === i && styles.modalDotActive,
//                   ]}
//                 />
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   imageSection: {
//     height: 400,
//     position: 'relative',
//   },
//   mainImage: {
//     width: width,
//     height: 400,
//     resizeMode: 'cover',
//   },
//   imageLoading: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: COLORS.lightGreen,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   pagination: {
//     flexDirection: 'row',
//     position: 'absolute',
//     bottom: 20,
//     alignSelf: 'center',
//   },
//   paginationDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#fff',
//     marginHorizontal: 4,
//   },
//   backButtonFloating: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 44 : 20,
//     left: 20,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     zIndex: 10,
//   },
//   shareButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 44 : 20,
//     right: 20,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     zIndex: 10,
//   },
//   thumbnailsContainer: {
//     backgroundColor: '#fff',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   thumbnailsList: {
//     paddingHorizontal: 16,
//   },
//   thumbnailContainer: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: 8,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   thumbnailContainerActive: {
//     borderColor: COLORS.primary,
//   },
//   thumbnail: {
//     width: '100%',
//     height: '100%',
//   },
//   thumbnailOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(45, 106, 79, 0.1)',
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   content: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 120,
//   },
//   categoryBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.lightGreen,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     alignSelf: 'flex-start',
//     marginBottom: 16,
//   },
//   categoryText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: COLORS.primary,
//     marginLeft: 6,
//   },
//   titleRow: {
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: COLORS.textDark,
//     marginBottom: 8,
//     lineHeight: 30,
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//   },
//   priceCurrency: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   price: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: COLORS.textDark,
//   },
//   eachText: {
//     fontSize: 14,
//     color: COLORS.textLight,
//     marginLeft: 4,
//   },
//   sellerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: COLORS.background,
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 24,
//   },
//   sellerInfoLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   sellerAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: COLORS.lightGreen,
//   },
//   avatarImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 25,
//   },
//   sellerInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   sellerName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.textDark,
//     marginBottom: 4,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   ratingText: {
//     fontSize: 13,
//     color: COLORS.textLight,
//     marginLeft: 4,
//   },
//   shopButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.lightGreen,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     gap: 6,
//   },
//   shopButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.primary,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: COLORS.border,
//     marginVertical: 8,
//   },
//   section: {
//     marginBottom: 28,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.textDark,
//     marginBottom: 12,
//   },
//   description: {
//     fontSize: 15,
//     color: COLORS.textLight,
//     lineHeight: 22,
//     marginBottom: 20,
//   },
//   detailsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   detailItem: {
//     width: '48%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.background,
//     padding: 14,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   detailLabel: {
//     fontSize: 12,
//     color: COLORS.textLight,
//     marginBottom: 2,
//     marginLeft: 8,
//   },
//   detailValue: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: COLORS.textDark,
//     marginLeft: 8,
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   statusDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: COLORS.success,
//     marginRight: 6,
//   },
//   statusText: {
//     fontSize: 13,
//     color: COLORS.success,
//     fontWeight: '600',
//   },
//   contactDescription: {
//     fontSize: 14,
//     color: COLORS.textLight,
//     marginBottom: 20,
//     lineHeight: 20,
//   },
//   contactButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//     gap: 12,
//   },
//   contactButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     borderRadius: 12,
//     gap: 8,
//   },
//   callButton: {
//     backgroundColor: COLORS.primary,
//   },
//   messageButton: {
//     backgroundColor: COLORS.secondary,
//   },
//   contactButtonText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 14,
//   },
//   phoneContainer: {
//     backgroundColor: COLORS.background,
//     padding: 16,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//   },
//   phoneLabel: {
//     fontSize: 13,
//     color: COLORS.textLight,
//     marginBottom: 4,
//   },
//   phoneNumber: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.textDark,
//     marginBottom: 12,
//   },
//   copyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//   },
//   copyText: {
//     fontSize: 14,
//     color: COLORS.primary,
//     fontWeight: '600',
//     marginLeft: 4,
//   },
//   safetySection: {
//     flexDirection: 'row',
//     backgroundColor: COLORS.lightGreen,
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 20,
//   },
//   safetyContent: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   safetyTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: COLORS.textDark,
//     marginBottom: 6,
//   },
//   safetyText: {
//     fontSize: 13,
//     color: COLORS.textLight,
//     lineHeight: 18,
//   },
//   reportButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//   },
//   reportText: {
//     fontSize: 14,
//     color: COLORS.error,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
//   bottomBar: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: COLORS.border,
//     paddingHorizontal: 20,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === 'ios' ? 34 : 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 10,
//   },
//   bottomBarContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   bottomPriceLabel: {
//     fontSize: 12,
//     color: COLORS.textLight,
//     marginBottom: 2,
//   },
//   bottomPriceContainer: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//   },
//   bottomPriceCurrency: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   bottomPrice: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: COLORS.textDark,
//   },
//   bottomUnit: {
//     fontSize: 14,
//     color: COLORS.textLight,
//   },
//   inquiryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.accent,
//     paddingHorizontal: 24,
//     paddingVertical: 14,
//     borderRadius: 12,
//     gap: 8,
//   },
//   inquiryButtonText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.95)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 44 : 20,
//     right: 20,
//     zIndex: 10,
//   },
//   modalImage: {
//     width: width,
//     height: height * 0.7,
//   },
//   modalPagination: {
//     flexDirection: 'row',
//     position: 'absolute',
//     bottom: 40,
//     alignSelf: 'center',
//   },
//   modalDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: 'rgba(255, 255, 255, 0.5)',
//     marginHorizontal: 4,
//   },
//   modalDotActive: {
//     backgroundColor: '#fff',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.background,
//     padding: 20,
//   },
//   loadingImage: {
//     width: '100%',
//     height: 250,
//     backgroundColor: COLORS.border,
//     borderRadius: 16,
//     marginBottom: 20,
//   },
//   loadingContent: {
//     padding: 20,
//     width: '100%',
//   },
//   loadingLine: {
//     height: 12,
//     backgroundColor: COLORS.border,
//     borderRadius: 6,
//     marginBottom: 12,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.background,
//     padding: 40,
//   },
//   errorTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: COLORS.textDark,
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   errorText: {
//     fontSize: 15,
//     color: COLORS.textLight,
//     textAlign: 'center',
//     marginBottom: 24,
//     lineHeight: 22,
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 14,
//     borderRadius: 12,
//     gap: 8,
//   },
//   backButtonText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
// });


import React, { useState, useEffect, useRef } from 'react';
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
  FlatList,
} from 'react-native';
import { supabase } from '../../supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

const { width, height } = Dimensions.get('window');
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
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      // First, fetch the listing
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (listingError) throw listingError;
      setListing(listingData);
      
      // Then fetch user data separately from 'users' table
      if (listingData.user_id) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name, profile_photo')
          .eq('id', listingData.user_id)
          .single();
        
        if (userError) {
          console.warn('Error fetching user data:', userError.message);
          setUserData({ name: 'Local Farmer', profile_photo: null });
        } else {
          setUserData(userData);
        }
      } else {
        setUserData({ name: 'Local Farmer', profile_photo: null });
      }
    } catch (error: any) {
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this listing: ${listing.title} - K${listing.price} per ${listing.unit}`,
        url: `https://yourapp.com/listing/${id}`,
        title: listing.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewShop = () => {
    if (listing?.user_id) {
      router.push(`/shop/${listing.user_id}`);
    } else {
      Alert.alert('Error', 'Unable to view shop. Seller information not available.');
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
            Alert.alert('Reported', 'Thank you for your report. We will review this listing.');
          }
        },
      ]
    );
  };

  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingImage} />
        <View style={styles.loadingContent}>
          <View style={styles.loadingLine} />
          <View style={[styles.loadingLine, { width: '70%' }]} />
          <View style={[styles.loadingLine, { width: '50%' }]} />
        </View>
      </View>
    );
  }

  if (!listing) {
    return (
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
    );
  }

  return (
    <View style={styles.container}>
      {/* Image Carousel - Extended to top */}
      <View style={styles.imageSection}>
        <Animated.FlatList
          ref={flatListRef}
          data={listing.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setSelectedImage(index);
          }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedImage(index);
                setModalVisible(true);
              }}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: item }}
                style={styles.mainImage}
                onLoadEnd={() => setImageLoading(false)}
              />
              {imageLoading && (
                <View style={styles.imageLoading}>
                  <Ionicons name="leaf-outline" size={40} color={COLORS.textLight} />
                </View>
              )}
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        
        {/* Image Pagination Dots Only */}
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

      {/* REMOVED: Image Thumbnails section - only keeping pagination dots */}

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.priceCurrency}>K</Text>
              <Text style={styles.price}>{listing.price}</Text>
              <Text style={styles.eachText}> each</Text>
            </View>
          </View>

          {/* Seller Info with Shop Button */}
          <View style={styles.sellerContainer}>
            <View style={styles.sellerInfoLeft}>
              <View style={styles.sellerAvatar}>
                {userData?.profile_photo ? (
                  <Image source={{ uri: userData.profile_photo }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person-circle-outline" size={40} color={COLORS.primary} />
                )}
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>
                  {userData?.name || 'Local Farmer'}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color={COLORS.accent} />
                  <Text style={styles.ratingText}>4.8 • 50+ sales</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={handleViewShop}
            >
              <Ionicons name="storefront-outline" size={18} color={COLORS.primary} />
              <Text style={styles.shopButtonText}>Shop</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <Text style={styles.description}>{listing.description || 'No description provided.'}</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={20} color={COLORS.textLight} />
                <View>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>
                    {listing.location || 'Location not specified'}
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
                <Ionicons name="calendar-outline" size={20} color={COLORS.textLight} />
                <View>
                  <Text style={styles.detailLabel}>Listed</Text>
                  <Text style={styles.detailValue}>
                    {new Date(listing.created_at).toLocaleDateString()}
                  </Text>
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
            <Text style={styles.bottomPriceLabel}>Price</Text>
            <View style={styles.bottomPriceContainer}>
              <Text style={styles.bottomPriceCurrency}>K</Text>
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
          
          <Animated.FlatList
            data={listing.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImage}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setSelectedImage(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          
          <View style={styles.modalPagination}>
            {listing.images?.map((_: any, i: number) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setSelectedImage(i);
                  if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({
                      index: i,
                      animated: true,
                    });
                  }
                }}
              >
                <View
                  style={[
                    styles.modalDot,
                    selectedImage === i && styles.modalDotActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageSection: {
    height: 400,
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 400,
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
    top: Platform.OS === 'ios' ? 44 : 20,
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
    zIndex: 10,
  },
  shareButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
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
    zIndex: 10,
  },
  // REMOVED: All thumbnail-related styles
  contentContainer: {
    flex: 1,
  },
  content: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
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
  eachText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  sellerInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  },
  ratingText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
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
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
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
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: COLORS.primary,
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
    top: Platform.OS === 'ios' ? 44 : 20,
    right: 20,
    zIndex: 10,
  },
  modalImage: {
    width: width,
    height: height * 0.7,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
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
    width: '100%',
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
    backgroundColor: COLORS.background,
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