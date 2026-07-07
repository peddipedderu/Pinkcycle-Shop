import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import client from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

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
  glow: 'rgba(236, 72, 153, 0.1)',
  glowStrong: 'rgba(236, 72, 153, 0.25)',
  glass: 'rgba(255, 255, 255, 0.9)',
};

const youthImages = [
    require('../../assets/youth.jpeg'),
    require('../../assets/youth1.jpeg'),
    require('../../assets/youth2.jpeg'),
    require('../../assets/youth3.jpeg'),
    require('../../assets/youth4.jpeg'),
    require('../../assets/youth5.jpeg'),
    require('../../assets/youth6.jpeg'),
    require('../../assets/youth7.jpeg'),
    require('../../assets/youth8.jpeg'),
    require('../../assets/youth9.jpeg'),
    require('../../assets/youth10.jpeg'),
    require('../../assets/youth11.jpeg'),
    require('../../assets/youth12.jpeg'),
];

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

const BlogDetail = ({ route, navigation }) => {
  const { id } = route.params;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const scrollViewRef = useRef(null);
  const [commentsY, setCommentsY] = useState(0);

  // Animations
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchBlog();
    checkAuth();
  }, [id]);

  useEffect(() => {
    if (!loading && blog) {
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start();

      if (route.params?.scrollToComments && commentsY > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: commentsY, animated: true });
        }, 500);
      }
    }
  }, [loading, blog, route.params?.scrollToComments, commentsY]);

  const checkAuth = async () => {
    let token = await AsyncStorage.getItem('token');
    if (!token && isWeb) {
      token = localStorage.getItem('userToken');
    }
    setIsAuthenticated(!!token);
  };

  const fetchBlog = async () => {
    try {
      const response = await client.get(`blog/${id}/`);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      let token = await AsyncStorage.getItem('token');
      if (!token && isWeb) {
        token = localStorage.getItem('userToken');
      }
      
      await client.post('comments/', {
        blog: id,
        text: commentText,
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      setCommentText('');
      fetchBlog();
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Could not post comment. Please ensure you are logged in.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = (content) => {
    if (!content) return null;
    
    return content.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <Text key={index} style={styles.contentHeader}>{line.replace('### ', '').trim()}</Text>;
      } else if (line.trim() === '') {
        return <View key={index} style={{ height: 15 }} />;
      } else {
        return <Text key={index} style={styles.contentText}>{line.trim()}</Text>;
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={PINK[600]} />
      </View>
    );
  }

  if (!blog) return null;

  const blogImage = blog.image ? { uri: blog.image.startsWith('http') ? blog.image : `${blog.image.startsWith('/') ? blog.image : '/media/' + blog.image}` } : youthImages[blog.id % youthImages.length];

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Visual Elements */}
      <FloatingOrb size={250} color={PINK[200]} top={100} left={-100} delay={0} />
      <FloatingOrb size={350} color={PINK[100]} top={600} left={width - 250} delay={500} />

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={20} color={PINK[600]} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{blog.title}</Text>
        </View>

        <View style={styles.heroSection}>
          <Image 
            source={blogImage} 
            style={styles.heroImage} 
            resizeMode="cover" 
          />
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.75)']}
            style={styles.heroGradient}
          />
          {blog.image_description ? (
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>{blog.image_description}</Text>
            </View>
          ) : null}
        </View>

        <Animated.View style={[styles.body, { opacity: contentFade, transform: [{ translateY: contentSlide }] }]}>
          <View style={styles.metaBox}>
            <View style={styles.authorBadge}>
              <Ionicons name="person-circle-outline" size={20} color={PINK[600]} />
              <Text style={styles.authorTag}>Written by {blog.author}</Text>
            </View>
            <View style={styles.dateBadgeContainer}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text style={styles.dateTag}>{new Date(blog.created).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            </View>
          </View>

          <Text style={styles.title}>{blog.title}</Text>
          
          <View style={styles.mainContent}>
             {renderContent(blog.content)}
          </View>

          {blog.event_description ? (
            <View style={styles.eventBox}>
              <View style={styles.eventHeaderRow}>
                <Ionicons name="location-outline" size={22} color={PINK[600]} />
                <Text style={styles.eventBoxTitle}>EVENT LOG</Text>
              </View>
              <View style={styles.eventDivider} />
              <Text style={styles.eventBoxText}>{blog.event_description}</Text>
            </View>
          ) : null}

          <View 
            style={styles.commentsSection}
            onLayout={(event) => setCommentsY(event.nativeEvent.layout.y)}
          >
            <Text style={styles.sectionTitle}>Discussion</Text>
            <View style={styles.commentsList}>
              {blog.comments && blog.comments.length > 0 ? (
                blog.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentUserRow}>
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>{comment.user.username.substring(0, 2).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.commentUser}>@{comment.user.username}</Text>
                      </View>
                      <Text style={styles.commentDate}>
                        {new Date(comment.created).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.noCommentsBox}>
                  <Ionicons name="chatbubbles-outline" size={32} color="#94a3b8" style={{ marginBottom: 8 }} />
                  <Text style={styles.noComments}>No comments yet. Be the first to start the conversation.</Text>
                </View>
              )}
            </View>

            <View style={styles.commentFormContainer}>
              <Text style={styles.formTitle}>Add your comment</Text>
              {isAuthenticated ? (
                <View style={styles.commentForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="Type your comment here..."
                    placeholderTextColor="#94a3b8"
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity 
                    style={[styles.submitBtnContainer, submitting && { opacity: 0.7 }]} 
                    onPress={handlePostComment}
                    disabled={submitting}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[PINK[500], PINK[700]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitBtn}
                    >
                      <Text style={styles.submitBtnText}>
                        {submitting ? 'Posting...' : 'Post Comment'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.loginPrompt} 
                  onPress={() => navigation.navigate('Login', { returnTo: 'BlogDetail', returnId: id })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.loginPromptText}>Log in to join the conversation</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.bottomBackBtnContainer}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[PINK[500], PINK[700]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bottomBackBtn}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.bottomBackBtnText}>Back to all stories</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        <View style={{ height: 100 }} />
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafb',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK[50],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.1)',
  },
  backButtonText: {
    color: PINK[700],
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
  headerTitle: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
  heroSection: {
    position: 'relative',
    height: 480,
    backgroundColor: '#0f172a',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
  },
  imageBadge: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: PINK[500],
  },
  imageBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    padding: 24,
    maxWidth: 900,
    alignSelf: 'center',
    width: '95%',
    backgroundColor: PINK.glass,
    marginTop: -40,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.1)',
    shadowColor: PINK[600],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
  },
  metaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 20,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINK[50],
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.1)',
  },
  authorTag: {
    fontWeight: '700',
    fontSize: 12,
    color: PINK[700],
    marginLeft: 6,
  },
  dateBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTag: {
    fontWeight: '600',
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 44,
    marginBottom: 30,
    letterSpacing: -0.5,
  },
  mainContent: {
    marginBottom: 50,
  },
  contentHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 35,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: PINK[500],
    paddingLeft: 14,
  },
  contentText: {
    fontSize: 17,
    color: '#334155',
    lineHeight: 28,
    marginBottom: 20,
    fontWeight: '400',
  },
  eventBox: {
    backgroundColor: '#fff',
    padding: 24,
    marginBottom: 50,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.15)',
    shadowColor: PINK[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventBoxTitle: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  eventDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 14,
  },
  eventBoxText: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  commentsSection: {
    marginTop: 30,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 24,
  },
  commentsList: {
    marginBottom: 40,
  },
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PINK[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: PINK[700],
    fontWeight: '800',
    fontSize: 10,
  },
  commentUser: {
    fontWeight: '700',
    color: '#334155',
    fontSize: 14,
  },
  commentDate: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  commentText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  noCommentsBox: {
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  noComments: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  commentFormContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.1)',
    shadowColor: PINK[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  commentForm: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    height: 120,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontWeight: '500',
  },
  submitBtnContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  loginPrompt: {
    padding: 16,
    backgroundColor: PINK[50],
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  loginPromptText: {
    color: PINK[700],
    fontWeight: '700',
    fontSize: 14,
  },
  bottomBackBtnContainer: {
    marginTop: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: PINK[600],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  bottomBackBtn: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBackBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default BlogDetail;
