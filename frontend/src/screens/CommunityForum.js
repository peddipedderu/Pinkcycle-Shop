import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Pressable,
  TextInput,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import client from '../api/client';

const { width } = Dimensions.get('window');

const CommunityForum = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Date');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await client.get('join-us/forums/');
      setCategories(res.data.categories);
      setTrending(res.data.trending);
    } catch (error) {
      console.error('Error fetching forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (type) => {
    const size = 32;
    const color = "#4A1521";
    switch (type) {
      case 'general': return <MaterialCommunityIcons name="chat-outline" size={size} color={color} />;
      case 'wellness': return <MaterialCommunityIcons name="heart-pulse" size={size} color={color} />;
      case 'book': return <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />;
      case 'events': return <MaterialCommunityIcons name="calendar-star" size={size} color={color} />;
      default: return <MaterialCommunityIcons name="forum-outline" size={size} color={color} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#C27D86" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Breadcrumb Bar */}
      <View style={styles.breadcrumbBar}>
        <View style={styles.breadcrumbLeft}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#4A1521" />
          </Pressable>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>Home > Join Us > <Text style={styles.breadcrumbActive}>Forums</Text></Text>
          </View>
        </View>
        <Pressable style={styles.hamburger}>
          <MaterialCommunityIcons name="menu" size={28} color="#4A1521" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Banner Section */}
        <View style={styles.headerBanner}>
          <View style={styles.bannerDecorationLeft}>
             <MaterialCommunityIcons name="chat-processing-outline" size={40} color="#C27D86" style={{ opacity: 0.3, transform: [{ rotate: '-15deg' }] }} />
          </View>
          
          <Text style={styles.bannerTitle}>Explore Community Forums</Text>
          
          <View style={styles.controlsRow}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#C27D86" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#C27D86"
              />
            </View>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filter by:</Text>
              <Pressable style={styles.filterPill}>
                <Text style={styles.filterText}>{filter}</Text>
                <MaterialCommunityIcons name="chevron-down" size={16} color="#4A1521" />
              </Pressable>
            </View>
            <Pressable style={styles.postButton}>
              <Text style={styles.postButtonText}>Post a New Thread</Text>
            </Pressable>
          </View>

          <View style={styles.bannerDecorationRight}>
             <MaterialCommunityIcons name="book-multiple-outline" size={40} color="#C27D86" style={{ opacity: 0.3, transform: [{ rotate: '15deg' }] }} />
          </View>
        </View>

        {/* Forum Categories Grid */}
        <View style={styles.section}>
          <View style={styles.grid}>
            {categories.map((item) => (
              <Pressable key={item.id} style={styles.categoryCard} onPress={() => navigation.navigate("ChatServer", { room: item.chat_room, title: item.title })}>
                <View style={styles.iconCircle}>
                  {getCategoryIcon(item.icon_type)}
                </View>
                <Text style={styles.categoryTitle}>{item.title}</Text>
                <Text style={styles.categoryDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.metaText}>Threads: {item.threads_count}</Text>
                  <Text style={styles.metaText}>Posts: {item.posts_count}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Trending Threads Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Threads</Text>
            <Pressable style={styles.secondaryPostButton}>
              <Text style={styles.secondaryPostText}>Post a New Thread</Text>
            </Pressable>
          </View>
          
          <View style={styles.grid}>
            {trending.map((item) => (
              <Pressable key={item.id} style={styles.trendingCard} onPress={() => navigation.navigate("ChatServer", { room: item.chat_room, title: item.title })}>
                <View style={styles.trendingHeader}>
                  <Text style={styles.trendingTitle}>{item.title}</Text>
                  {item.hot && <MaterialCommunityIcons name="fire" size={16} color="#C27D86" />}
                </View>
                <Text style={styles.timestamp}>{item.last_post}</Text>
                <View style={styles.trendingFooter}>
                  <MaterialCommunityIcons name="message-outline" size={14} color="#4A1521" />
                  <Text style={styles.trendingMeta}>{item.posts_count} discussions</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF5F5',
  },
  breadcrumbBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: '#FAF5F5',
  },
  breadcrumbLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#C27D86',
  },
  breadcrumbActive: {
    fontWeight: '700',
    color: '#4A1521',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBanner: {
    backgroundColor: '#FCECEF',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerDecorationLeft: {
    position: 'absolute',
    left: -10,
    top: 20,
  },
  bannerDecorationRight: {
    position: 'absolute',
    right: -10,
    bottom: 20,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4A1521',
    textAlign: 'center',
    marginBottom: 25,
  },
  controlsRow: {
    width: '100%',
    maxWidth: 600,
    marginBottom: 15,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 50,
    shadowColor: '#4A1521',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A1521',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    color: '#4A1521',
    marginRight: 8,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCECEF',
  },
  filterText: {
    fontSize: 14,
    color: '#4A1521',
    marginRight: 4,
    fontWeight: '600',
  },
  postButton: {
    backgroundColor: '#C27D86',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#C27D86',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4A1521',
  },
  secondaryPostButton: {
    backgroundColor: '#FCECEF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  secondaryPostText: {
    color: '#C27D86',
    fontWeight: '700',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    width: width > 600 ? '23.5%' : '48%',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#4A1521',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FCECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A1521',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryDesc: {
    fontSize: 12,
    color: '#C27D86',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#FAF5F5',
    width: '100%',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 10,
    color: '#4A1521',
    fontWeight: '600',
  },
  trendingCard: {
    backgroundColor: '#FFFFFF',
    width: width > 600 ? '23.5%' : '48%',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#4A1521',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: 'space-between',
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A1521',
    flex: 1,
    marginRight: 5,
  },
  timestamp: {
    fontSize: 11,
    color: '#C27D86',
    marginBottom: 10,
  },
  trendingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingMeta: {
    fontSize: 11,
    color: '#4A1521',
    marginLeft: 5,
    fontWeight: '500',
  },
});

export default CommunityForum;
