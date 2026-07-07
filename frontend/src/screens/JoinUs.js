import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import client from '../api/client';

const { width } = Dimensions.get('window');

const JoinUs = ({ navigation }) => {
  const [meta, setMeta] = useState(null);
  const [members, setMembers] = useState([]);
  const [forumStats, setForumStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followingId, setFollowingId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metaRes, membersRes, statsRes] = await Promise.all([
        client.get('join-us/meta/'),
        client.get('join-us/members/'),
        client.get('community/forum/stats/')
      ]);
      setMeta(metaRes.data);
      setMembers(membersRes.data);
      setForumStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (platform) => {
    setFollowingId(platform.id);
    try {
      await client.post('join-us/follow/', { platform: platform.name });
      
      // Redirect to the social media platform
      if (platform.url) {
        Linking.openURL(platform.url);
      }
      
      // Refresh meta to get updated counts and user follow status
      const metaRes = await client.get('join-us/meta/');
      setMeta(metaRes.data);
    } catch (err) {
      console.error('Failed to follow:', err);
    } finally {
      setFollowingId(null);
    }
  };

  const getIcon = (iconName, color = "#881337") => {
    const iconSize = 28;
    if (['facebook', 'instagram', 'linkedin'].includes(iconName)) {
      return <FontAwesome5 name={iconName} size={iconSize} color={color} />;
    }
    return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Pastel Pink Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#881337" />
          </Pressable>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbLink} onPress={() => navigation.navigate('Home')}>Home</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#f472b6" />
            <Text style={styles.breadcrumbActive}>Join Us</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable onPress={() => setShowMenu(!showMenu)} style={styles.menuButton}>
            <MaterialCommunityIcons name={showMenu ? "close" : "menu"} size={28} color="#881337" />
          </Pressable>
        </View>
      </View>

      {/* Dropdown Menu */}
      {showMenu && (
        <View style={styles.dropdown}>
          <Pressable style={styles.dropdownItem} onPress={() => navigation.navigate('CommunityForum')}>
            <Text style={styles.dropdownText}>Explore Forums</Text>
          </Pressable>
          <Pressable style={styles.dropdownItem} onPress={() => navigation.navigate('Events')}>
            <Text style={styles.dropdownText}>Events</Text>
          </Pressable>
          <Pressable style={styles.dropdownItem} onPress={() => navigation.navigate('OurStory')}>
            <Text style={styles.dropdownText}>Our Story</Text>
          </Pressable>
          <Pressable style={styles.dropdownItem} onPress={() => navigation.navigate('Contact')}>
            <Text style={styles.dropdownText}>Contact</Text>
          </Pressable>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <Text style={styles.title}>{meta?.title || "Join Our Community"}</Text>
          <Text style={styles.subtitle}>{meta?.subtitle || "Connect with us on social media"}</Text>

          {/* Social Integration Section */}
          <View style={styles.socialGrid}>
            {meta?.platforms.map((platform) => {
              const isFollowing = meta?.user_follows?.includes(platform.id);
              return (
                <View key={platform.id} style={styles.socialCard}>
                  <View style={styles.iconBox}>
                    {getIcon(platform.icon_name)}
                  </View>
                  <Text style={styles.platformName}>{platform.name}</Text>
                  <Pressable 
                    onPress={() => handleFollow(platform)}
                    style={({ pressed }) => [
                      styles.followButton,
                      isFollowing && styles.followingButton,
                      pressed && { opacity: 0.7 }
                    ]}
                  >
                    {followingId === platform.id ? (
                      <ActivityIndicator size="small" color="#881337" />
                    ) : (
                      <Text style={[styles.followText, isFollowing && styles.followingText]}>
                        {isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* Community Engagement Visuals */}
          <View style={styles.memberSection}>
            <Text style={styles.sectionTitle}>Community Members</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberRow}>
              {members.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <Image source={{ uri: member.avatar }} style={styles.avatar} />
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Explore Forums CTA */}
          <View style={styles.ctaContainer}>
            <Pressable 
              onPress={() => navigation.navigate('CommunityForum')}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
              ]}
            >
              <Text style={styles.ctaText}>Explore Forums</Text>
              {forumStats && (
                <Text style={styles.statsText}>{forumStats.active_threads} active threads</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 70,
    backgroundColor: '#FCE4EC',
    borderBottomWidth: 1,
    borderBottomColor: '#F8BBD0',
    zIndex: 100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbLink: {
    fontSize: 14,
    color: '#f472b6',
    fontWeight: '500',
  },
  breadcrumbActive: {
    fontSize: 14,
    color: '#881337',
    fontWeight: '700',
    marginLeft: 4,
  },
  menuButton: {
    padding: 5,
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FDFBF7',
  },
  dropdownText: {
    fontSize: 16,
    color: '#4A0E2E',
    fontWeight: '500',
  },
  content: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 500,
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#881337',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  socialCard: {
    width: (width < 500 ? (width - 100) / 3 : 130),
    aspectRatio: 1,
    backgroundColor: '#FDFBF7',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCE4EC',
  },
  iconBox: {
    marginBottom: 10,
  },
  platformName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A0E2E',
    marginBottom: 8,
  },
  followButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f472b6',
  },
  followingButton: {
    backgroundColor: '#FCE4EC',
    borderColor: '#881337',
  },
  followText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f472b6',
    textTransform: 'uppercase',
  },
  followingText: {
    color: '#881337',
  },
  memberSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#881337',
    marginBottom: 20,
    textAlign: 'center',
  },
  memberRow: {
    paddingHorizontal: 10,
  },
  memberItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FCE4EC',
    marginBottom: 8,
  },
  memberRole: {
    fontSize: 11,
    color: '#f472b6',
    fontWeight: '600',
  },
  ctaContainer: {
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#FFE4E6',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#881337',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#BE123C',
    opacity: 0.8,
  },
});

export default JoinUs;
