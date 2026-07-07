import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView, 
  ActivityIndicator, 
  Platform, 
  Alert, 
  Image,
  ImageBackground
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const Programs = ({ navigation, route }) => {
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (route.params?.programTitle) {
      const title = route.params.programTitle;
      if (title.includes('Digital Literacy')) setSelectedCategory('digital-literacy');
      else if (title.includes('Menstrual Health')) setSelectedCategory('health-hygiene');
      else if (title.includes('Climate-Conscious')) setSelectedCategory('environment');
      else if (title.includes('Mentorship')) setSelectedCategory('leadership');
    }
  }, [route.params?.programTitle]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchPrograms();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await client.get('program-categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      let url = 'programs/';
      if (selectedCategory) {
        url += '?category=' + selectedCategory;
      }
      const response = await client.get(url);
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (program) => {
    let token = null;
    if (isWeb) {
      token = localStorage.getItem('userToken');
    }
    if (!token) {
      try {
        token = await AsyncStorage.getItem('token');
      } catch (e) {
        console.log('Error reading token', e);
      }
    }

    if (!token) {
      navigation.navigate('Login');
      return;
    }

    try {
      await client.post('enrollments/', { program_id: program.id });
      const successMsg = 'Successfully enrolled in ' + program.title + '!';
      if (isWeb) {
        alert(successMsg);
      } else {
        Alert.alert('Enrollment Successful', successMsg);
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail ||  'Failed to enroll. Please try again.';
      if (isWeb) {
        alert(errMsg);
      } else {
        Alert.alert('Enrollment Failed', errMsg);
      }
    }
  };

  const ProgramCard = ({ program }) => {
    return (
      <View style={styles.programCard}>
        <Image 
          source={program.image ? { uri: program.image.startsWith('http') ? program.image : client.defaults.baseURL.replace('/api/', '') + program.image } : require('../../assets/pink.jpeg')} 
          style={styles.programImage} 
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.imageGradient}
        />
        <View style={styles.cardContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{program.category?.name || 'Initiative'}</Text>
          </View>
          <Text style={styles.programTitle}>{program.title}</Text>
          <Text style={styles.programDescription} numberOfLines={3}>{program.description}</Text>
          
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.priceLabel}>Program Fee</Text>
              <Text style={styles.programPrice}>{program.price > 0 ? '$' + program.price : 'FREE'}</Text>
            </View>
            <TouchableOpacity style={styles.enrollButton} onPress={() => handleEnroll(program)}>
              <Text style={styles.enrollButtonText}>Enroll Now</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground 
        source={require('../../assets/pink.jpeg')} 
        style={styles.heroBackground}
      >
        <LinearGradient
          colors={['rgba(131, 24, 67, 0.9)', 'rgba(219, 39, 119, 0.8)']}
          style={styles.heroGradient}
        >
          <View style={styles.headerNav}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.iconBtn}>
              <Ionicons name="menu" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroSubtitle}>EMPOWERING THE NEXT GENERATION</Text>
            <Text style={styles.heroTitle}>Our Programs</Text>
            <View style={styles.headerLine} />
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity 
            style={[styles.categoryBtn, !selectedCategory && styles.categoryBtnActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryBtnText, !selectedCategory && styles.categoryBtnTextActive]}>All Programs</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.categoryBtn, selectedCategory === cat.slug && styles.categoryBtnActive]}
              onPress={() => setSelectedCategory(cat.slug)}
            >
              <Text style={[styles.categoryBtnText, selectedCategory === cat.slug && styles.categoryBtnTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#db2777" />
            <Text style={styles.loaderText}>Loading impactful programs...</Text>
          </View>
        ) : programs.length > 0 ? (
          <View style={styles.gridContainer}>
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="folder-open-outline" size={80} color="#fce7f3" />
            <Text style={styles.emptyText}>No programs found in this category.</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={() => setSelectedCategory(null)}>
              <Text style={styles.resetBtnText}>View All Programs</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcfd',
  },
  heroBackground: {
    height: 250,
    width: '100%',
  },
  heroGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'ios' ? 0 : 10,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  heroTextContainer: {
    marginBottom: 10,
  },
  heroSubtitle: {
    color: '#fce7f3',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 5,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
  },
  headerLine: {
    width: 60,
    height: 4,
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 2,
  },
  categoryBar: {
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  categoryScroll: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryBtnActive: {
    backgroundColor: '#db2777',
    borderColor: '#db2777',
  },
  categoryBtnText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 14,
  },
  categoryBtnTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  programCard: {
    width: isWeb && width > 768 ? '48%' : '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#db2777',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: '#fce7f3',
  },
  programImage: {
    width: '100%',
    height: 200,
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  cardContent: {
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryBadgeText: {
    color: '#db2777',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  programTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#831843',
    marginBottom: 10,
  },
  programDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 20,
    height: 66,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#fce7f3',
    paddingTop: 15,
  },
  priceLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  programPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#db2777',
  },
  enrollButton: {
    backgroundColor: '#db2777',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  enrollButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  loaderText: {
    marginTop: 15,
    color: '#831843',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#831843',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    fontWeight: '600',
  },
  resetBtn: {
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#db2777',
  },
  resetBtnText: {
    color: '#db2777',
    fontWeight: '700',
  }
});

export default Programs;
