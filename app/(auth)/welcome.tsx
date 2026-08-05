// app/(auth)/welcome.tsx
// 3-slide onboarding pageview. Full-bleed image per slide with text
// overlaid over a flat ink scrim (no gradient, per Nivas — solid
// translucent panel instead) for legibility. Plain paging ScrollView,
// no new pager dependency.
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { FadeSlideIn, GhostButton, PrimaryButton } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    image: require('../../assets/images/onboarding/visitor-approvals.png'),
    title: 'See your dues at a glance',
    subtitle: 'Maintenance and dues, tracked in one clear dashboard \u2014 no digging required.',
  },
  {
    image: require('../../assets/images/onboarding/notices-alerts.png'),
    title: 'Never miss a notice',
    subtitle: 'Society announcements and alerts land the moment they\u2019re posted.',
  },
  {
    image: require('../../assets/images/onboarding/maintenance-payments.png'),
    title: 'Pay maintenance, simply',
    subtitle: 'Track dues and pay in a few taps \u2014 no queues, no paperwork.',
  },
] as const;

export default function WelcomeScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const goToPhone = () => router.push('/(auth)/phone');

  const handleNext = () => {
    if (isLast) {
      goToPhone();
      return;
    }
    scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={{ width, height }}>
            <Image
              source={slide.image}
              resizeMode="cover"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width, height }}
            />
          </View>
        ))}
      </ScrollView>

      {/* Skip — floats over the image, top-right */}
      <FadeSlideIn
        delay={60}
        style={{
          position: 'absolute',
          top: spacing.xxl,
          right: spacing.xl,
        }}
      >
        <GhostButton
          label="Skip"
          onPress={goToPhone}
          style={{ backgroundColor: 'rgba(27,26,23,0.35)', borderColor: 'rgba(250,248,245,0.3)' }}
        />
      </FadeSlideIn>

      {/* Bottom scrim + content — flat translucent ink panel, no gradient */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(27,26,23,0.72)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.xl,
          paddingBottom: spacing.xxl,
        }}
      >
        {SLIDES.map((slide, i) =>
          i === index ? (
            <FadeSlideIn key={slide.title}>
              <Text style={[typography.h1, { color: colors.onPrimary }]}>{slide.title}</Text>
              <Text
                style={[
                  typography.body,
                  { color: 'rgba(250,248,245,0.75)', marginTop: spacing.sm },
                ]}
              >
                {slide.subtitle}
              </Text>
            </FadeSlideIn>
          ) : null
        )}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: spacing.xl,
            marginBottom: spacing.lg,
          }}
        >
          {SLIDES.map((slide, i) => (
            <View
              key={slide.title}
              style={{
                width: i === index ? 20 : 6,
                height: 6,
                borderRadius: radius.pill,
                backgroundColor: i === index ? colors.onPrimary : 'rgba(250,248,245,0.3)',
                marginHorizontal: 3,
              }}
            />
          ))}
        </View>

        <PrimaryButton
          label={isLast ? 'Get started' : 'Next'}
          icon="arrow-forward"
          onPress={handleNext}
        />
      </View>
    </View>
  );
}