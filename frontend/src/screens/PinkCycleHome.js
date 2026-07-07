import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image,
  TextInput,
  Platform,
  Animated,
} from "react-native";
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// ─── 3D PINKY DESIGN SYSTEM ─────────────────────────────────────────────────
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
  950: '#500724',
  glow: 'rgba(236, 72, 153, 0.4)',
  glowStrong: 'rgba(236, 72, 153, 0.7)',
  glass: 'rgba(253, 242, 248, 0.85)',
  glassDark: 'rgba(80, 7, 36, 0.75)',
  gradient1: '#ec4899',
  gradient2: '#db2777',
  gradient3: '#be185d',
  neon: '#ff6eb4',
};

// ─── 3D FLOATING ORB ANIMATION ──────────────────────────────────────────────
const FloatingOrb = ({ size, color, top, left, delay = 0 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 0.6,
      duration: 1500,
      delay,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -20, duration: 3000 + delay, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 20, duration: 3000 + delay, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 4000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.85, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: opacityAnim,
        transform: [{ translateY: floatAnim }, { scale: scaleAnim }],
        ...(Platform.OS === 'web' ? { filter: `blur(${size * 0.3}px)` } : {}),
      }}
    />
  );
};

// ─── 3D CARD WITH PERSPECTIVE ───────────────────────────────────────────────
const Card3D = ({ children, style, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, delay, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
            ...(Platform.OS === 'web' ? [{ perspective: 1200 }] : []),
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ─── FADE-IN WITH 3D SLIDE ─────────────────────────────────────────────────
const FadeInView = ({ children, delay = 0, duration = 800, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
};

// ─── DYNAMIC BACKGROUND WITH CROSSFADE ──────────────────────────────────────
const DynamicBackground = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 25000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 25000, useNativeDriver: true }),
      ])
    ).start();

    const timer = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 3000, useNativeDriver: true }).start(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % images.length);
        fadeAnim.setValue(0);
      });
    }, 8000);
    return () => clearInterval(timer);
  }, [nextIndex, images.length]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.Image source={images[currentIndex]} style={[styles.heroImage, { transform: [{ scale: scaleAnim }] }]} resizeMode="cover" />
      <Animated.Image source={images[nextIndex]} style={[styles.heroImage, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]} resizeMode="cover" />
      {/* 3D Gradient overlay */}
      <LinearGradient
        colors={['rgba(80,7,36,0.3)', 'rgba(157,23,77,0.5)', 'rgba(219,39,119,0.4)', 'rgba(236,72,153,0.3)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Deep dark overlay at bottom for text readability */}
      <LinearGradient
        colors={['transparent', 'rgba(80,7,36,0.85)']}
        style={[StyleSheet.absoluteFill]}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 1 }}
      />
    </View>
  );
};

// ─── ANIMATED COUNTER WITH GLOW ─────────────────────────────────────────────
const ImpactStat = ({ count, label, icon, duration = 2000 }) => {
  const [displayCount, setDisplayCount] = useState(0);
  const target = parseInt(count.replace(/[^0-9]/g, '')) || 0;
  const suffix = count.replace(/[0-9]/g, '');
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    let startTime = null;
    let animationFrameId = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const rate = Math.min(progress / duration, 1);
      
      setDisplayCount(Math.floor(rate * target));

      if (rate < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, duration]);

  return (
    <Card3D style={styles.statBox3D}>
      <Animated.View style={[styles.statGlowRing, { opacity: glowAnim }]} />
      <MaterialCommunityIcons name={icon} size={28} color={PINK.neon} style={{ marginBottom: 8 }} />
      <Text style={styles.statCount3D}>{displayCount}{suffix}</Text>
      <Text style={styles.statLabel3D}>{label}</Text>
    </Card3D>
  );
};


// ─── 3D PILLAR CARD ─────────────────────────────────────────────────────────
const PillarCard3D = ({ icon, title, color, description, delay, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, delay, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.pillarCardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.pillarCard3D}>
        <LinearGradient
          colors={[color + '15', color + '08', 'rgba(253,242,248,0.95)']}
          style={styles.pillarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.pillarIconWrap, { backgroundColor: color + '20', borderColor: color + '40' }]}>
            <MaterialCommunityIcons name={icon} size={36} color={color} />
          </View>
          <Text style={[styles.pillarTitle3D, { color }]}>{title}</Text>
          <Text style={styles.pillarDesc3D}>{description}</Text>
          <View style={[styles.pillarArrow, { backgroundColor: color + '15' }]}>
            <Ionicons name="arrow-forward" size={18} color={color} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
const PinkCycleHome = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('Home');
  const scrollRef = useRef(null);
  const sectionRefs = {
    pillars: useRef(0),
    about: useRef(0),
    catalog: useRef(0),
    programs: useRef(0),
    difference: useRef(0),
    contact: useRef(0),
  };

  useEffect(() => {
    if (route.params?.scrollTo && scrollRef.current) {
      const section = route.params.scrollTo;
      const yOffset = sectionRefs[section].current;
      scrollRef.current.scrollTo({ y: yOffset, animated: true });
    }
  }, [route.params?.scrollTo]);

  const onSectionLayout = (section) => (event) => {
    sectionRefs[section].current = event.nativeEvent.layout.y;
  };

  const handleBookSession = () => {
    if (Platform.OS === 'web') {
      const token = localStorage.getItem('userToken');
      if (token) { navigation.navigate('Booking'); } else { navigation.navigate('Registration'); }
    } else { navigation.navigate('Registration'); }
  };

  const scrollToSection = (section) => {
    if (scrollRef.current && sectionRefs[section]) {
      scrollRef.current.scrollTo({ y: sectionRefs[section].current, animated: true });
    }
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

  // ─── PROGRAM CARD WITH 3D TILT ─────────────────────────────────────────
  const ProgramCard3D = ({ title, overview, impact, icon, delay }) => (
    <Card3D delay={delay} style={{ width: '100%' }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Programs", { programTitle: title })}
        style={styles.programCard3D}
      >
        <LinearGradient
          colors={['rgba(253,242,248,0.98)', 'rgba(252,231,243,0.95)', '#fff']}
          style={styles.programCardInner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.programIconCircle}>
            <LinearGradient
              colors={[PINK[500], PINK[700]]}
              style={styles.programIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name={icon} size={28} color="#fff" />
            </LinearGradient>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.programTitle3D}>{title}</Text>
            <Text style={styles.programOverview3D}>{overview}</Text>
            <View style={styles.programImpactBadge3D}>
              <Ionicons name="sparkles" size={14} color={PINK[600]} />
              <Text style={styles.programImpactText3D}>{impact}</Text>
            </View>
          </View>
          <View style={styles.programArrow3D}>
            <Ionicons name="chevron-forward" size={22} color={PINK[500]} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Card3D>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ═══ GLASSMORPHIC NAVIGATION ═══ */}
      <View style={styles.navHeader3D}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[PINK[500], PINK[700]]}
            style={styles.logoBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoBadgeText}>PC</Text>
          </LinearGradient>
          <View>
            <Text style={styles.logoText3D}>Pink Cycle</Text>
            <Text style={styles.logoSubtext}>EmpowerHer</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          {Platform.OS === 'web' && width > 800 && (
            <View style={styles.webNav3D}>
              {[
                { label: 'Home', action: () => scrollRef.current.scrollTo({ y: 0, animated: true }) },
                { label: 'About', action: () => scrollToSection('about') },
                { label: 'Pillars', action: () => scrollToSection('pillars') },
                { label: 'Catalog', action: () => scrollToSection('catalog') },
                { label: 'Programs', action: () => navigation.navigate('Programs') },
                { label: 'Impact', action: () => { if (Platform.OS === 'web') { navigation.navigate('Donate'); } else { scrollToSection('difference'); } } },
                { label: 'Contact', action: () => scrollToSection('contact') },
                { label: 'Account', action: () => navigation.navigate('Account') },
              ].map((item) => (
                <TouchableOpacity key={item.label} onPress={item.action} style={styles.navLinkWrap}>
                  <Text style={styles.webNavLink3D}>{item.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={handleBookSession} style={styles.navCTA3D}>
                <LinearGradient
                  colors={[PINK[500], PINK[700]]}
                  style={styles.navCTAGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.navCTAText}>Book Session</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuBtn3D}>
            <Ionicons name="menu" size={28} color={PINK[700]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ═══ 1. 3D HERO SECTION ═══ */}
        <View style={styles.heroSection3D}>
          <DynamicBackground images={[require("../../assets/pink.jpeg"), ...youthImages]} />
          {/* Floating 3D orbs */}
          <FloatingOrb size={120} color={PINK.glow} top="10%" left="5%" delay={0} />
          <FloatingOrb size={80} color={PINK.glowStrong} top="60%" left="80%" delay={500} />
          <FloatingOrb size={60} color="rgba(244,114,182,0.4)" top="30%" left="70%" delay={1000} />
          <FloatingOrb size={100} color="rgba(251,207,232,0.3)" top="75%" left="15%" delay={1500} />

          <View style={styles.heroOverlay3D}>
            <FadeInView delay={200}>
              <View style={styles.heroTaglineBadge}>
                <View style={styles.heroTaglineDot} />
                <Text style={styles.heroTagline3D}>EMPOWERING WOMEN AND GIRLS</Text>
              </View>
            </FadeInView>
            <FadeInView delay={400}>
              <Text style={styles.heroTitle3D}>Breaking{"\n"}Barriers.{"\n"}<Text style={styles.heroTitleAccent}>Empowering{"\n"}Futures.</Text></Text>
            </FadeInView>
            <FadeInView delay={600}>
              <Text style={styles.heroSubtitle3D}>Menstrual health education, digital literacy, and climate-conscious solutions for every girl in Kenya.</Text>
            </FadeInView>
            <FadeInView delay={800} style={styles.heroButtons3D}>
              <TouchableOpacity onPress={handleBookSession}>
                <LinearGradient
                  colors={[PINK[500], PINK[700]]}
                  style={styles.heroPrimaryBtn3D}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="calendar" size={18} color="#fff" />
                  <Text style={styles.heroPrimaryBtnText3D}>Book Session</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('JoinUs')}>
                <LinearGradient
                  colors={[PINK[500], PINK[700]]}
                  style={styles.heroPrimaryBtn3D}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="people" size={18} color="#fff" />
                  <Text style={styles.heroPrimaryBtnText3D}>Join Us</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Shop')} style={styles.heroGlassBtn3D}>
                <Ionicons name="storefront" size={18} color="#fff" />
                <Text style={styles.heroGlassBtnText3D}>Community Shop</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { if (Platform.OS === 'web') { navigation.navigate('Donate'); } else { scrollToSection('difference'); } }} style={styles.heroGlassBtn3D}>
                <Ionicons name="heart" size={18} color={PINK.neon} />
                <Text style={styles.heroGlassBtnText3D}>Donate</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Blogs')} style={styles.heroGlassBtn3D}>
                <Ionicons name="book" size={18} color="#fff" />
                <Text style={styles.heroGlassBtnText3D}>Read Blog</Text>
              </TouchableOpacity>
            </FadeInView>
            <FadeInView delay={1000}>
              <TouchableOpacity onPress={() => scrollToSection('programs')} style={styles.heroExplore3D}>
                <Text style={styles.heroExploreText3D}>Explore Programs</Text>
                <Ionicons name="arrow-down" size={18} color={PINK[300]} />
              </TouchableOpacity>
            </FadeInView>
          </View>
        </View>

        {/* ═══ IMPACT BAR WITH 3D STATS ═══ */}
        <LinearGradient
          colors={[PINK[950], PINK[900], PINK[800]]}
          style={styles.impactBar3D}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <ImpactStat count="500+" label="Youth Trained" icon="school" />
          <ImpactStat count="200+" label="Girls Empowered" icon="account-heart" />
          <ImpactStat count="10+" label="Events" icon="calendar-star" />
        </LinearGradient>

        {/* ═══ 2. STRATEGIC PILLARS ═══ */}
        <View style={styles.section3D} onLayout={onSectionLayout('pillars')}>
          <FadeInView>
            <Text style={styles.sectionTag3D}>OUR FOCUS</Text>
            <Text style={styles.sectionTitle3D}>Strategic Pillars</Text>
            <Text style={styles.sectionSubtitle3D}>Four pillars driving our mission to empower every girl and youth</Text>
          </FadeInView>
          <View style={styles.pillarsGrid3D}>
            <PillarCard3D icon="laptop" title="Digital Literacy" color={PINK[600]} description="Coding, AI, and cybersecurity skills for youth 15–25" delay={200} />
            <PillarCard3D icon="water" title="Menstrual Health" color={PINK[700]} description="Breaking taboos through education and dignity kits" delay={400} />
            <PillarCard3D icon="leaf" title="Climate Action" color="#15803d" description="Tree planting, recycling, and green entrepreneurship" delay={600} />
            <PillarCard3D icon="account-group" title="Mentorship" color="#7c3aed" description="One-on-one guidance from industry professionals" delay={800} />
          </View>
        </View>

        {/* ═══ 3. ABOUT US ═══ */}
        <LinearGradient
          colors={[PINK[50], '#fff', PINK[50]]}
          style={styles.section3D}
          onLayout={onSectionLayout('about')}
        >
          <FadeInView>
            <Text style={styles.sectionTag3D}>WHO WE ARE</Text>
            <Text style={styles.sectionTitle3D}>About Pink Cycle</Text>
          </FadeInView>

          <View style={styles.missionVisionGrid}>
            <Card3D delay={200} style={styles.mvCardWrap}>
              <LinearGradient
                colors={[PINK[500], PINK[700]]}
                style={styles.mvCard3D}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="rocket" size={32} color="#fff" />
                <Text style={styles.mvLabel3D}>OUR MISSION</Text>
                <Text style={styles.mvText3D}>Empower women and youth through menstrual health education, digital literacy, and climate-conscious solutions.</Text>
              </LinearGradient>
            </Card3D>
            <Card3D delay={400} style={styles.mvCardWrap}>
              <View style={styles.mvCardOutline3D}>
                <Ionicons name="eye" size={32} color={PINK[600]} />
                <Text style={[styles.mvLabel3D, { color: PINK[600] }]}>OUR VISION</Text>
                <Text style={[styles.mvText3D, { color: PINK[800] }]}>A society where every girl has dignity, opportunity, and access to education.</Text>
              </View>
            </Card3D>
          </View>

          <Card3D delay={600} style={styles.founderSection3D}>
            <View style={styles.founderGlass3D}>
              <View style={styles.founderImagesRow3D}>
                <View style={styles.sideImageWrap3D}>
                  <Image source={require('../../assets/logo.jpeg')} style={styles.sideFounderImage3D} />
                </View>
                <View style={styles.mainImageWrap3D}>
                  <LinearGradient
                    colors={[PINK[400], PINK[600], PINK[800]]}
                    style={styles.mainImageBorder3D}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Image source={require('../../assets/Karen.png')} style={styles.mainFounderImage3D} />
                  </LinearGradient>
                </View>
                <View style={styles.sideImageWrap3D}>
                  <Image source={require('../../assets/founder.jpeg')} style={styles.sideFounderImage3D} />
                </View>
              </View>
              <Text style={styles.founderTitle3D}>Founder's Message</Text>
              <Text style={styles.founderQuote3D}>
                "In my community, I grew up seeing girls and young people held back not because they lacked talent, but because they lacked access... That is why I founded Pink Cycle EmpowerHer Initiative — to break the silence, to open doors, and to show that every girl and youth deserves dignity, knowledge, and opportunity."
              </Text>
              <Text style={styles.founderName3D}>Miss Caren</Text>
              <Text style={styles.founderRole3D}>Founder & Executive Director</Text>
            </View>
          </Card3D>

          <View style={styles.valuesContainer3D}>
            {['Inclusivity', 'Sustainability', 'Empowerment', 'Innovation'].map((val, idx) => (
              <FadeInView key={val} delay={800 + (idx * 150)} style={styles.valueBadge3D}>
                <LinearGradient
                  colors={[PINK[500], PINK[700]]}
                  style={styles.valueBadgeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.valueText3D}>{val}</Text>
                </LinearGradient>
              </FadeInView>
            ))}
          </View>
        </LinearGradient>

        {/* ═══ 4. YOUTH CATALOG ═══ */}
        <LinearGradient
          colors={[PINK[950], '#0f0515', '#1a0614']}
          style={[styles.section3D, { paddingBottom: 60 }]}
          onLayout={onSectionLayout('catalog')}
        >
          {/* Background orbs for the dark section */}
          <FloatingOrb size={150} color="rgba(236,72,153,0.15)" top="10%" left="80%" delay={200} />
          <FloatingOrb size={100} color="rgba(190,24,93,0.1)" top="50%" left="5%" delay={600} />

          <FadeInView>
            <Text style={[styles.sectionTag3D, { color: PINK[400] }]}>GALLERY</Text>
            <Text style={[styles.sectionTitle3D, { color: PINK[100] }]}>Youth Empowerment Catalog</Text>
            <Text style={styles.catalogSubtitle3D}>Showcasing the vibrant future of our community</Text>
          </FadeInView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer3D}>
            {youthImages.map((img, index) => (
              <Card3D key={index} delay={index * 120} style={styles.youthCard3D}>
                <Image source={img} style={styles.catalogImage3D} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(80,7,36,0.9)']}
                  style={styles.youthCardOverlay}
                  start={{ x: 0, y: 0.4 }}
                  end={{ x: 0, y: 1 }}
                />
                <View style={styles.youthBadge3D}>
                  <LinearGradient
                    colors={[PINK[500], PINK[700]]}
                    style={styles.youthBadgeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="sparkles" size={12} color="#fff" />
                    <Text style={styles.youthBadgeText3D}>Future Leader</Text>
                  </LinearGradient>
                </View>
              </Card3D>
            ))}
          </ScrollView>
        </LinearGradient>

        {/* ═══ 5. PROGRAMS ═══ */}
        <View style={styles.section3D} onLayout={onSectionLayout('programs')}>
          <FadeInView>
            <Text style={styles.sectionTag3D}>WHAT WE DO</Text>
            <Text style={styles.sectionTitle3D}>Programs & Initiatives</Text>
          </FadeInView>
          <ProgramCard3D
            title="Digital Literacy & ICT Skills"
            overview="Equipping youth aged 15–25 with coding (Python, HTML, CSS), AI integration, and cybersecurity."
            impact="Over 500 girls in Bungoma have already benefited."
            icon="code-braces"
            delay={200}
          />
          <ProgramCard3D
            title="Menstrual Health & Hygiene"
            overview="Breaking taboos through school visits and distribution of dignity kits (pads, soap, underwear)."
            impact="Reduced absenteeism and stigma in local schools."
            icon="heart-pulse"
            delay={400}
          />
          <ProgramCard3D
            title="Climate-Conscious Solutions"
            overview="Tree planting, recycling training, and green entrepreneurship for a sustainable future."
            impact="Promotes environmental stewardship among youth."
            icon="sprout"
            delay={600}
          />
          <ProgramCard3D
            title="Mentorship & Leadership"
            overview="One-on-one sessions with professionals to build confidence and innovation capacity."
            impact="Nurtures the next generation of confident leaders."
            icon="account-star"
            delay={800}
          />
        </View>

        {/* ═══ 6. UPCOMING EVENTS ═══ */}
        <View style={styles.section3D}>
          <Card3D style={styles.eventCard3D}>
            <LinearGradient
              colors={[PINK[50], '#fff']}
              style={styles.eventCardInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.eventTagWrap}>
                <LinearGradient
                  colors={[PINK[500], PINK[700]]}
                  style={styles.eventTag3D}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="megaphone" size={12} color="#fff" />
                  <Text style={styles.eventTagText}>UPCOMING EVENT</Text>
                </LinearGradient>
              </View>
              <Text style={styles.eventTitle3D}>Youth Empowerment Program 2026</Text>
              <View style={styles.eventDetailRow}>
                <View style={[styles.eventDetailIcon, { backgroundColor: PINK[100] }]}>
                  <Ionicons name="calendar" size={18} color={PINK[600]} />
                </View>
                <Text style={styles.eventDetailText}>June 1st – June 30th, 2026</Text>
              </View>
              <View style={styles.eventDetailRow}>
                <View style={[styles.eventDetailIcon, { backgroundColor: PINK[100] }]}>
                  <Ionicons name="location" size={18} color={PINK[600]} />
                </View>
                <Text style={styles.eventDetailText}>Kanduyi Community ICT Hub</Text>
              </View>
              <TouchableOpacity onPress={() => { if (Platform.OS === 'web') { window.location.href = '/registration'; } else { navigation.navigate('Registration'); } }}>
                <LinearGradient
                  colors={[PINK[600], PINK[800]]}
                  style={styles.registerBtn3D}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="ticket" size={20} color="#fff" />
                  <Text style={styles.registerBtnText3D}>Register Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Card3D>
        </View>

        {/* ═══ 7. DONATION ═══ */}
        <LinearGradient
          colors={[PINK[50], PINK[100], PINK[50]]}
          style={styles.section3D}
          onLayout={onSectionLayout('difference')}
        >
          <FadeInView>
            <Text style={styles.sectionTag3D}>SUPPORT US</Text>
            <Text style={[styles.sectionTitle3D, { textAlign: 'center' }]}>Make a Difference</Text>
            <Text style={styles.donationLead3D}>Every coin helps break barriers in menstrual health, digital literacy, and climate-conscious solutions.</Text>
          </FadeInView>
          <View style={styles.donationGrid3D}>
            {[
              { amt: '$10', label: 'Dignity Kit', icon: 'gift', color: PINK[500] },
              { amt: '$50', label: 'ICT Training', icon: 'school', color: PINK[600] },
              { amt: '$100', label: 'Workshop', icon: 'account-group', color: PINK[700] },
            ].map((tier, idx) => (
              <Card3D key={tier.amt} delay={200 + idx * 200} style={styles.donationTierWrap3D}>
                <View style={styles.donationTier3D}>
                  <View style={[styles.donationTierIcon, { backgroundColor: tier.color + '15' }]}>
                    <MaterialCommunityIcons name={tier.icon} size={28} color={tier.color} />
                  </View>
                  <Text style={[styles.tierAmt3D, { color: tier.color }]}>{tier.amt}</Text>
                  <Text style={styles.tierLabel3D}>{tier.label}</Text>
                </View>
              </Card3D>
            ))}
          </View>
          <FadeInView delay={800}>
            <TouchableOpacity onPress={() => { if (Platform.OS === 'web') { navigation.navigate('Donate'); } }}>
              <LinearGradient
                colors={[PINK[500], PINK[700]]}
                style={styles.donateLargeBtn3D}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="heart" size={22} color="#fff" />
                <Text style={styles.donateLargeBtnText3D}>Donate Today</Text>
              </LinearGradient>
            </TouchableOpacity>
          </FadeInView>
        </LinearGradient>

        {/* ═══ 8. CONTACT ═══ */}
        <View style={styles.section3D} onLayout={onSectionLayout('contact')}>
          <FadeInView>
            <Text style={styles.sectionTag3D}>REACH OUT</Text>
            <Text style={styles.sectionTitle3D}>Get In Touch</Text>
          </FadeInView>
          <Card3D delay={200} style={{ alignItems: 'center', width: '100%' }}>
            <Text style={styles.contactLead3D}>Have questions or want to partner with us? We'd love to hear from you.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SendMessage')} style={{ width: '100%' }}>
              <LinearGradient
                colors={[PINK[800], PINK[950]]}
                style={styles.sendBtn3D}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="mail" size={20} color="#fff" />
                <Text style={styles.sendBtnText3D}>Go to Message Page</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Card3D>
          <FadeInView delay={400} style={styles.contactInfo3D}>
            <View style={styles.contactLocRow}>
              <Ionicons name="location" size={20} color={PINK[600]} />
              <Text style={styles.contactText3D}>Kanduyi, Bungoma County, Kenya</Text>
            </View>
            <View style={styles.socialRow3D}>
              {['linkedin', 'instagram', 'facebook'].map((social) => (
                <TouchableOpacity key={social} style={styles.socialIcon3D}>
                  <FontAwesome5 name={social} size={20} color={PINK[700]} />
                </TouchableOpacity>
              ))}
            </View>
          </FadeInView>
        </View>

        {/* ═══ FOOTER ═══ */}
        <LinearGradient
          colors={[PINK[900], PINK[950]]}
          style={styles.footer3D}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.footerContent3D}>
            <View style={styles.footerBrand3D}>
              <LinearGradient
                colors={[PINK[500], PINK[700]]}
                style={styles.footerLogoBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.footerLogoText}>PC</Text>
              </LinearGradient>
              <Text style={styles.footerBrandName}>Pink Cycle EmpowerHer</Text>
            </View>
            <Text style={styles.footerCopyright3D}>© 2026 PINK CYCLE EMPOWERHER INITIATIVE</Text>
            <Text style={styles.footerTagline3D}>Breaking Barriers. Empowering Futures.</Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ─── 3D PINKY STYLES ────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },

  // ─── NAV ───
  navHeader3D: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: PINK[100],
    zIndex: 100,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)', boxShadow: '0 4px 30px rgba(236,72,153,0.08)' } : {}),
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoBadgeText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  logoText3D: { fontSize: 18, fontWeight: '900', color: PINK[900] },
  logoSubtext: { fontSize: 10, fontWeight: '700', color: PINK[500], letterSpacing: 2, textTransform: 'uppercase' },
  webNav3D: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  navLinkWrap: { paddingHorizontal: 10, paddingVertical: 5 },
  webNavLink3D: { fontSize: 13, fontWeight: '600', color: PINK[800] },
  navCTA3D: { marginLeft: 10, borderRadius: 10, overflow: 'hidden' },
  navCTAGradient: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  navCTAText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  menuBtn3D: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    backgroundColor: PINK[50], borderWidth: 1, borderColor: PINK[200],
  },

  // ─── HERO ───
  heroSection3D: { height: 620, backgroundColor: '#000', overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroOverlay3D: { padding: 30, justifyContent: 'flex-end', height: '100%', paddingBottom: 50 },
  heroTaglineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(236,72,153,0.2)', alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(244,114,182,0.3)',
  },
  heroTaglineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PINK.neon },
  heroTagline3D: { color: PINK[200], fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  heroTitle3D: { color: '#fff', fontSize: 44, fontWeight: '900', lineHeight: 52, marginTop: 15, marginBottom: 10 },
  heroTitleAccent: { color: PINK[300] },
  heroSubtitle3D: { color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 24, marginBottom: 25, maxWidth: 500 },
  heroButtons3D: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 15 },
  heroPrimaryBtn3D: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 22, paddingVertical: 14, borderRadius: 12,
  },
  heroPrimaryBtnText3D: { color: '#fff', fontWeight: '700', fontSize: 14 },
  heroGlassBtn3D: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
  },
  heroGlassBtnText3D: { color: '#fff', fontWeight: '600', fontSize: 13 },
  heroExplore3D: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  heroExploreText3D: { color: PINK[300], fontWeight: '600', fontSize: 14 },

  // ─── IMPACT BAR ───
  impactBar3D: { flexDirection: 'row', paddingVertical: 40, justifyContent: 'space-around', paddingHorizontal: 20 },
  statBox3D: {
    alignItems: 'center', padding: 20, borderRadius: 20, minWidth: 110,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.2)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : {}),
  },
  statGlowRing: {
    position: 'absolute', top: -5, left: -5, right: -5, bottom: -5,
    borderRadius: 25, borderWidth: 1, borderColor: PINK[400],
  },
  statCount3D: { fontSize: 34, fontWeight: '900', color: '#fff' },
  statLabel3D: { fontSize: 11, color: PINK[300], fontWeight: '700', marginTop: 5, textTransform: 'uppercase', letterSpacing: 1 },

  // ─── SECTIONS ───
  section3D: { paddingVertical: 60, paddingHorizontal: 20, backgroundColor: '#fff' },
  sectionTag3D: {
    fontSize: 11, fontWeight: '800', color: PINK[500],
    letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8,
  },
  sectionTitle3D: { fontSize: 34, fontWeight: '900', color: PINK[900], marginBottom: 10 },
  sectionSubtitle3D: { fontSize: 16, color: PINK[700], lineHeight: 24, marginBottom: 35, opacity: 0.8 },

  // ─── PILLARS ───
  pillarsGrid3D: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  pillarCardWrapper: { width: '48%', marginBottom: 10 },
  pillarCard3D: {
    borderRadius: 24, overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px rgba(236,72,153,0.08)', transform: [{ perspective: 800 }] } : { elevation: 4 }),
  },
  pillarGradient: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: PINK[100] },
  pillarIconWrap: {
    width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, marginBottom: 16,
  },
  pillarTitle3D: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  pillarDesc3D: { fontSize: 12, color: PINK[700], lineHeight: 18, opacity: 0.7, marginBottom: 15 },
  pillarArrow: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  // ─── ABOUT ───
  missionVisionGrid: { flexDirection: width > 600 ? 'row' : 'column', gap: 20, marginBottom: 40 },
  mvCardWrap: { flex: 1, minWidth: 260 },
  mvCard3D: { padding: 30, borderRadius: 24, gap: 15, minHeight: 200 },
  mvCardOutline3D: {
    padding: 30, borderRadius: 24, gap: 15, minHeight: 200,
    borderWidth: 2, borderColor: PINK[200], backgroundColor: '#fff',
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px rgba(236,72,153,0.06)' } : { elevation: 3 }),
  },
  mvLabel3D: { fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  mvText3D: { fontSize: 16, color: '#fff', lineHeight: 24 },

  // ─── FOUNDER ───
  founderSection3D: { width: '100%' },
  founderGlass3D: {
    alignItems: 'center', padding: 40, borderRadius: 30,
    backgroundColor: PINK[50], borderWidth: 1, borderColor: PINK[200],
    ...(Platform.OS === 'web' ? { boxShadow: '0 20px 60px rgba(236,72,153,0.08)' } : { elevation: 6 }),
  },
  founderImagesRow3D: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 30, flexWrap: 'wrap' },
  sideImageWrap3D: {
    ...(Platform.OS === 'web' ? { transform: [{ perspective: 500 }, { rotateY: '8deg' }] } : {}),
  },
  mainImageWrap3D: {
    ...(Platform.OS === 'web' ? { transform: [{ perspective: 800 }, { scale: 1.05 }] } : {}),
  },
  mainImageBorder3D: { width: 196, height: 196, borderRadius: 98, justifyContent: 'center', alignItems: 'center' },
  mainFounderImage3D: { width: 184, height: 184, borderRadius: 92, borderWidth: 4, borderColor: '#fff' },
  sideFounderImage3D: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#fff',
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 24px rgba(236,72,153,0.2)' } : { elevation: 4 }),
  },
  founderTitle3D: { fontSize: 24, fontWeight: '900', color: PINK[900], marginBottom: 15 },
  founderQuote3D: {
    fontSize: 16, fontStyle: 'italic', color: PINK[800], textAlign: 'center',
    lineHeight: 28, paddingHorizontal: 15, marginBottom: 20,
  },
  founderName3D: { fontSize: 20, fontWeight: '900', color: PINK[600] },
  founderRole3D: { fontSize: 13, color: PINK[700], fontWeight: '600' },

  // ─── VALUES ───
  valuesContainer3D: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 35 },
  valueBadge3D: {},
  valueBadgeGradient: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  valueText3D: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // ─── CATALOG ───
  catalogSubtitle3D: { color: PINK[300], textAlign: 'left', marginBottom: 30, fontSize: 16, opacity: 0.9, lineHeight: 24 },
  scrollContainer3D: { paddingLeft: 20, paddingRight: 30, paddingBottom: 20, paddingTop: 10 },
  youthCard3D: {
    width: 300, height: 420, marginRight: 20, borderRadius: 24, overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 20px 40px rgba(236,72,153,0.3)',
      transform: [{ perspective: 1000 }, { rotateY: '-2deg' }],
    } : { elevation: 12 }),
  },
  catalogImage3D: { width: '100%', height: '100%' },
  youthCardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  youthBadge3D: { position: 'absolute', bottom: 20, left: 20 },
  youthBadgeGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  youthBadgeText3D: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },

  // ─── PROGRAMS ───
  programCard3D: {
    marginBottom: 16, borderRadius: 20, overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 32px rgba(236,72,153,0.06)',
      transform: [{ perspective: 1000 }],
    } : { elevation: 3 }),
  },
  programCardInner: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: PINK[100] },
  programIconCircle: { marginRight: 18 },
  programIconGradient: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  programTitle3D: { fontSize: 17, fontWeight: '800', color: PINK[900], marginBottom: 6 },
  programOverview3D: { fontSize: 13, color: PINK[700], lineHeight: 20, opacity: 0.8, marginBottom: 8 },
  programImpactBadge3D: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: PINK[50], paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start',
  },
  programImpactText3D: { color: PINK[600], fontWeight: '700', fontSize: 11 },
  programArrow3D: {
    width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    backgroundColor: PINK[50], marginLeft: 10,
  },

  // ─── EVENTS ───
  eventCard3D: { width: '100%' },
  eventCardInner: {
    padding: 35, borderRadius: 24, borderWidth: 2, borderColor: PINK[200],
    ...(Platform.OS === 'web' ? { boxShadow: '0 12px 40px rgba(236,72,153,0.08)' } : { elevation: 4 }),
  },
  eventTagWrap: { alignSelf: 'flex-start', marginBottom: 20 },
  eventTag3D: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
  },
  eventTagText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  eventTitle3D: { fontSize: 28, fontWeight: '900', color: PINK[900], marginBottom: 25 },
  eventDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  eventDetailIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  eventDetailText: { fontSize: 15, color: PINK[800], fontWeight: '600' },
  registerBtn3D: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: 18, borderRadius: 14, marginTop: 25,
  },
  registerBtnText3D: { color: '#fff', fontSize: 17, fontWeight: '800' },

  // ─── DONATION ───
  donationLead3D: { textAlign: 'center', fontSize: 16, color: PINK[700], marginBottom: 35, lineHeight: 24, opacity: 0.85 },
  donationGrid3D: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, gap: 12 },
  donationTierWrap3D: { flex: 1 },
  donationTier3D: {
    padding: 22, borderRadius: 20, alignItems: 'center', backgroundColor: '#fff',
    borderWidth: 1, borderColor: PINK[200],
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 24px rgba(236,72,153,0.06)' } : { elevation: 3 }),
  },
  donationTierIcon: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  tierAmt3D: { fontSize: 26, fontWeight: '900' },
  tierLabel3D: { fontSize: 12, color: PINK[700], fontWeight: '700', marginTop: 5, textTransform: 'uppercase' },
  donateLargeBtn3D: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    padding: 20, borderRadius: 16,
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 30px rgba(219,39,119,0.3)' } : { elevation: 6 }),
  },
  donateLargeBtnText3D: { color: '#fff', fontSize: 20, fontWeight: '800' },

  // ─── CONTACT ───
  contactLead3D: { fontSize: 16, color: PINK[700], textAlign: 'center', marginBottom: 25, lineHeight: 24 },
  sendBtn3D: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: 18, borderRadius: 14,
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 24px rgba(131,24,67,0.15)' } : { elevation: 4 }),
  },
  sendBtnText3D: { color: '#fff', fontWeight: '800', fontSize: 15 },
  contactInfo3D: { marginTop: 35, alignItems: 'center' },
  contactLocRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  contactText3D: { color: PINK[800], fontWeight: '600', fontSize: 15 },
  socialRow3D: { flexDirection: 'row', gap: 15 },
  socialIcon3D: {
    width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
    backgroundColor: PINK[50], borderWidth: 1, borderColor: PINK[200],
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 12px rgba(236,72,153,0.08)' } : { elevation: 2 }),
  },

  // ─── FOOTER ───
  footer3D: { padding: 50 },
  footerContent3D: { alignItems: 'center', gap: 15 },
  footerBrand3D: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  footerLogoBadge: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  footerLogoText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  footerBrandName: { color: PINK[200], fontSize: 16, fontWeight: '700' },
  footerCopyright3D: { color: PINK[400], fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  footerTagline3D: { color: PINK[500], fontSize: 12, fontWeight: '600', fontStyle: 'italic' },
});

export default PinkCycleHome;
