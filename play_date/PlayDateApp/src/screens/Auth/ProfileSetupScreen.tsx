import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { extendedTheme, commonStyles } from '../../utils/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileSetup'>;

const ProfileSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete profile setup
      Alert.alert(
        'Profile Complete!',
        'Welcome to PlayDate! Your profile has been set up successfully.',
        [{ text: 'Get Started', onPress: () => {/* Navigate to main app */} }]
      );
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Setup?',
      'You can complete your profile later in settings.',
      [
        { text: 'Continue Setup', style: 'cancel' },
        { text: 'Skip', onPress: () => {/* Navigate to main app */} }
      ]
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>📸</Text>
            <Text style={styles.stepTitle}>Add Your Photos</Text>
            <Text style={styles.stepDescription}>
              Upload a few photos to help others get to know you better
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Add Photos</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>📝</Text>
            <Text style={styles.stepTitle}>Tell Your Story</Text>
            <Text style={styles.stepDescription}>
              Write a brief bio and share your interests
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Write Bio</Text>
            </TouchableOpacity>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>🎮</Text>
            <Text style={styles.stepTitle}>Choose Your Games</Text>
            <Text style={styles.stepDescription}>
              Select which games you'd like to play with matches
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Select Games</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Step {currentStep} of {totalSteps}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStep / totalSteps) * 100}%` }
              ]} 
            />
          </View>
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderStepContent()}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
          </Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingTop: extendedTheme.spacing.xl,
    paddingBottom: extendedTheme.spacing.lg,
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: extendedTheme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: extendedTheme.colors.primary,
    borderRadius: 2,
  },
  skipButton: {
    padding: extendedTheme.spacing.sm,
  },
  skipButtonText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  stepContent: {
    alignItems: 'center',
  },
  stepIcon: {
    fontSize: 64,
    marginBottom: extendedTheme.spacing.lg,
  },
  stepTitle: {
    ...extendedTheme.typography.h2,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: extendedTheme.spacing.md,
    textAlign: 'center',
  },
  stepDescription: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: extendedTheme.spacing.xl,
  },
  actionButton: {
    ...commonStyles.button,
    backgroundColor: extendedTheme.colors.surface,
    borderWidth: 2,
    borderColor: extendedTheme.colors.primary,
  },
  actionButtonText: {
    ...commonStyles.buttonText,
    color: extendedTheme.colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingBottom: extendedTheme.spacing.lg,
  },
  nextButton: {
    ...commonStyles.button,
    backgroundColor: extendedTheme.colors.primary,
  },
  nextButtonText: {
    ...commonStyles.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileSetupScreen;
