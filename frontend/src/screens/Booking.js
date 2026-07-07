import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const Booking = ({ route, navigation }) => {
  const { category: routeCategory } = route.params || {};
  
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(routeCategory || 'All');
  const [error, setError] = useState(null);

  const categories = ['All', 'Career', 'Wellness', 'Tech', 'Life Skills', 'Finance'];

  const getEndpoint = (category) => {
    const cat = category.toLowerCase().replace(/\s/g, '');
    if (cat === 'all') return 'sessions/';
    if (cat === 'tech') return 'bookings/Tech/';
    if (cat === 'career') return 'bookings/Career/';
    if (cat === 'wellness') return 'bookings/Wellness/';
    if (cat === 'finance') return 'bookings/Finance/';
    if (cat === 'lifeskills') return 'bookings/Tech/Lifeskills/';
    return 'sessions/';
  };

  const fetchSessions = async (showRefresh = false, category = selectedCategory) => {
    try {
      if (!showRefresh) setLoading(true);
      setError(null);
      const endpoint = getEndpoint(category);
      const response = await client.get(endpoint);
      setSessions(response.data);
      applyFilters(response.data, searchQuery, category);
    } catch (err) {
      console.error(err);
      setError('Could not load sessions. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions(false, selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (routeCategory && routeCategory.toLowerCase() !== selectedCategory.toLowerCase()) {
      const properCat = categories.find(c => c.toLowerCase().replace(/\s/g, '') === routeCategory.toLowerCase().replace(/\s/g, '')) || routeCategory;
      setSelectedCategory(properCat);
    }
  }, [routeCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions(true, selectedCategory);
  };

  const applyFilters = (data, search, category) => {
    let filtered = [...data];
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title?.toLowerCase().includes(query) ||
          s.mentor_name?.toLowerCase().includes(query)
      );
    }
    setFilteredSessions(filtered);
  };

  useEffect(() => {
    applyFilters(sessions, searchQuery, selectedCategory);
  }, [searchQuery, sessions]);

  const renderSessionCard = (session) => {
    const getNormalizedImageUrl = (url) => {
      if (!url) return null;
      let cleanUrl = url;
      if (url.includes('127.0.0.1:8000')) {
        cleanUrl = url.replace('http://127.0.0.1:8000', '');
      } else if (url.includes('localhost:8000')) {
        cleanUrl = url.replace('http://localhost:8000', '');
      }
      
      if (cleanUrl.startsWith('/') && typeof window !== 'undefined' && window.location) {
        const port = window.location.port;
        if (port && port !== '80' && port !== '443') {
          return `${window.location.protocol}//${window.location.hostname}${cleanUrl}?v=2`;
        }
      }
      return cleanUrl + '?v=2';
    };

    const sessionImageUrl = getNormalizedImageUrl(session.image);

    return (
      <TouchableOpacity
        key={session.id}
        style={styles.card}
        onPress={() => navigation.navigate('SessionDetail', { id: session.id })}
      >
        <View style={styles.cardImageContainer}>
          {sessionImageUrl ? (
            <Image source={{ uri: sessionImageUrl }} style={styles.cardImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
               <Ionicons name='calendar' size={40} color='#f8bbd0' />
            </View>
          )}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{session.category || 'General'}</Text>
          </View>
        </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{session.title}</Text>
        
        <View style={styles.mentorRow}>
          <Ionicons name='person-circle-outline' size={20} color='#d63384' />
          <Text style={styles.mentorName}>{session.mentor_name}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name='time-outline' size={16} color='#666' />
            <Text style={styles.infoText}>{session.duration || '1 hr'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name='people-outline' size={16} color='#666' />
            <Text style={styles.infoText}>{session.capacity} slots</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('SessionDetail', { id: session.id })}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Ionicons name='chevron-forward' size={16} color='#fff' />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Book Your Mentorship</Text>
            <Text style={styles.heroSubtitle}>
              Connect with experts and gain the skills you need for your future.
            </Text>
          </View>
          {isWeb && (
            <TouchableOpacity
              style={styles.myBookingsButton}
              onPress={() => navigation.navigate('MyBookings')}
            >
              <Ionicons name='calendar' size={20} color='#fff' />
              <Text style={styles.myBookingsText}>My Bookings</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterContainer}>
          <View style={styles.searchBar}>
            <Ionicons name='search' size={20} color='#d63384' />
            <TextInput
              style={styles.searchInput}
              placeholder='Search by session or mentor...'
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryList}
            contentContainerStyle={styles.categoryListContent}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryItem,
                  selectedCategory.toLowerCase().replace(/\s/g, '') === cat.toLowerCase().replace(/\s/g, '') && styles.categoryItemActive
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory.toLowerCase().replace(/\s/g, '') === cat.toLowerCase().replace(/\s/g, '') && styles.categoryTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#d63384' />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchSessions(false, selectedCategory)}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredSessions.length > 0 ? (
              filteredSessions.map(renderSessionCard)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name='search-outline' size={60} color='#ccc' />
                <Text style={styles.emptyText}>No sessions found match your criteria.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: '#d63384',
    padding: 30,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: isWeb ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: isWeb ? 'center' : 'flex-start',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ffd1e3',
    maxWidth: 500,
  },
  myBookingsButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  myBookingsText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
  filterContainer: {
    padding: 20,
    marginTop: -25,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  categoryList: {
    marginBottom: 10,
  },
  categoryListContent: {
    paddingRight: 20,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryItemActive: {
    backgroundColor: '#d63384',
    borderColor: '#d63384',
  },
  categoryText: {
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 10,
    width: isWeb ? (width > 1200 ? '23%' : width > 800 ? '30%' : '45%') : '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardImageContainer: {
    height: 150,
    backgroundColor: '#fff1f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(214, 51, 132, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    height: 44,
  },
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mentorName: {
    marginLeft: 8,
    color: '#d63384',
    fontWeight: '600',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 5,
    color: '#777',
    fontSize: 13,
  },
  bookButton: {
    backgroundColor: '#d63384',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '700',
    marginRight: 5,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#c2185b',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#d63384',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    width: '100%',
  },
  emptyText: {
    marginTop: 20,
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Booking;