import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import client from '../api/client';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const numColumns = isWeb && width > 768 ? 2 : 1;

// ─── DESIGN SYSTEM ──────────────────────────────────────────────────────────
const PINK = {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ec4899',
  600: '#db2777',
  700: '#be185d',
  800: '#9d174d',
  900: '#831843',
  glow: 'rgba(236, 72, 153, 0.15)',
  glowStrong: 'rgba(236, 72, 153, 0.35)',
  glass: 'rgba(255, 255, 255, 0.85)',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  darkBg: '#0f172a',
};

// ─── FLOATING ORB ANIMATION ──────────────────────────────────────────────────
const FloatingOrb = ({ size, color, top, left, delay = 0 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -25, duration: 4000 + delay, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 25, duration: 4000 + delay, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 5000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.85, duration: 5000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateY: floatAnim }, { scale: scaleAnim }],
          ...(isWeb ? { filter: `blur(${size * 0.4}px)` } : {}),
        }
      ]}
    />
  );
};

const BlogCard = ({ item, navigation, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const imageUrl = item.image
    ? (item.image.startsWith('http')
      ? item.image
      : `${item.image.startsWith('/') ? item.image : '/media/' + item.image}`)
    : null;

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        },
        styles.blogCardContainer
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate('BlogDetail', { id: item.id })}
        style={[styles.blogCard, isWeb && width > 768 && styles.blogCardWeb]}
      >
        <View style={styles.imageWrapper}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.blogImage} resizeMode="cover" />
          ) : (
            <View style={[styles.blogImage, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>PINK CYCLE</Text>
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.8)']}
            style={styles.imageOverlay}
          />
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeDay}>
              {new Date(item.created).toLocaleDateString(undefined, { day: 'numeric' })}
            </Text>
            <Text style={styles.dateBadgeMonth}>
              {new Date(item.created).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.blogContent}>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color={PINK[500]} />
            <Text style={styles.blogAuthor}>{item.author.toUpperCase()}</Text>
          </View>
          
          <Text style={styles.blogTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <Text style={styles.blogSnippet} numberOfLines={3}>
            {item.content.replace(/### /g, '').trim()}
          </Text>

          <View style={styles.cardFooter}>
            <LinearGradient
              colors={[PINK[500], PINK[700]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.readMoreBtn}
            >
              <Text style={styles.readMoreText}>Read Full Story</Text>
              <Ionicons name="arrow-forward-outline" size={16} color="#fff" />
            </LinearGradient>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Blogs = ({ navigation }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchBlogs();
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await client.get('blog/');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const ListHeader = () => (
    <Animated.View style={[styles.header, { opacity: headerFade }]}>
      <View style={styles.badgeContainer}>
        <Text style={styles.headerSubtitle}>NEWS & INSIGHTS</Text>
      </View>
      <Text style={styles.headerTitle}>Our Stories</Text>
      <Text style={styles.headerDescription}>
        Explore the latest workshop logs, tech empowerment stories, health campaigns, and grassroots actions driving change.
      </Text>
      <View style={styles.headerLine} />
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={PINK[600]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Visual Background Orbs */}
      <FloatingOrb size={300} color={PINK[200]} top={-100} left={-100} delay={0} />
      <FloatingOrb size={400} color={PINK[100]} top={400} left={width - 250} delay={1000} />
      <FloatingOrb size={250} color={PINK[300]} top={1000} left={-50} delay={2000} />

      <FlatList
        data={blogs}
        renderItem={({ item, index }) => <BlogCard item={item} index={index} navigation={navigation} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        key={numColumns}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No blog posts available at the moment.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}
      >
        <Ionicons name="arrow-back-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafb',
  },
  orb: {
    position: 'absolute',
    opacity: 0.3,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafb',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeContainer: {
    backgroundColor: PINK[100],
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 30,
    marginBottom: 16,
  },
  headerSubtitle: {
    color: PINK[700],
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 2,
  },
  headerTitle: {
    color: '#0f172a',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: 16,
  },
  headerDescription: {
    color: '#64748b',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 600,
  },
  headerLine: {
    width: 60,
    height: 4,
    backgroundColor: PINK[500],
    borderRadius: 2,
    marginTop: 24,
  },
  listContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 120,
    paddingHorizontal: 10,
  },
  blogCardContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 30,
  },
  blogCard: {
    backgroundColor: PINK.cardBg,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.1)',
    shadowColor: PINK[600],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  blogCardWeb: {
    // web styling handles
  },
  imageWrapper: {
    position: 'relative',
    height: 240,
    backgroundColor: '#e2e8f0',
  },
  blogImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PINK[50],
  },
  placeholderText: {
    color: PINK[400],
    fontWeight: '900',
    fontSize: 24,
    letterSpacing: 1,
  },
  dateBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  dateBadgeDay: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 18,
  },
  dateBadgeMonth: {
    color: PINK[600],
    fontWeight: '800',
    fontSize: 10,
    marginTop: 2,
  },
  blogContent: {
    padding: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  blogAuthor: {
    color: PINK[600],
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  blogTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
    lineHeight: 28,
  },
  blogSnippet: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: PINK[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  readMoreText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    marginRight: 6,
  },
  emptyContainer: {
    padding: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: PINK[600],
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PINK[600],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});

export default Blogs;
