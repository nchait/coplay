import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { extendedTheme, commonStyles } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎮</Text>
          <Text style={styles.appName}>PlayDate</Text>
        </View>
        <Text style={styles.tagline}>Connect through play</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.featureContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🧩</Text>
            <Text style={styles.featureTitle}>Cooperative Games</Text>
            <Text style={styles.featureDescription}>
              Play together to succeed together. Build connections through teamwork.
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💝</Text>
            <Text style={styles.featureTitle}>Meaningful Matches</Text>
            <Text style={styles.featureDescription}>
              Move beyond swiping. Discover compatibility through shared experiences.
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureTitle}>Quick & Fun</Text>
            <Text style={styles.featureDescription}>
              Short 1-3 minute games that fit perfectly into your day.
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: extendedTheme.colors.background,
  },
  header: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: extendedTheme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.md,
  },
  logo: {
    fontSize: 64,
    marginBottom: extendedTheme.spacing.sm,
  },
  appName: {
    ...extendedTheme.typography.h1,
    fontSize: 36,
    fontWeight: '700',
    color: extendedTheme.colors.primary,
  },
  tagline: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.textSecondary,
    fontWeight: '400',
  },
  content: {
    flex: 0.5,
    paddingHorizontal: extendedTheme.spacing.lg,
    justifyContent: 'center',
  },
  featureContainer: {
    gap: extendedTheme.spacing.xl,
  },
  feature: {
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.md,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: extendedTheme.spacing.sm,
  },
  featureTitle: {
    ...extendedTheme.typography.h3,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    ...extendedTheme.typography.bodySmall,
    textAlign: 'center',
    lineHeight: 20,
    color: extendedTheme.colors.textSecondary,
  },
  footer: {
    flex: 0.2,
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingBottom: extendedTheme.spacing.lg,
    justifyContent: 'flex-end',
  },
  getStartedButton: {
    ...commonStyles.button,
    backgroundColor: extendedTheme.colors.primary,
    marginBottom: extendedTheme.spacing.md,
    paddingVertical: extendedTheme.spacing.md,
  },
  getStartedButtonText: {
    ...commonStyles.buttonText,
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    ...extendedTheme.typography.caption,
    textAlign: 'center',
    color: extendedTheme.colors.textLight,
    lineHeight: 16,
  },
});

export default WelcomeScreen;
