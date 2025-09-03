import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { extendedTheme, commonStyles } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    bio: '',
    city: '',
  });
  const { register, state } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleRegister = async () => {
    console.log('Registering...');
    console.log(formData);
    const { firstName, lastName, email, password, confirmPassword, age, bio, city } = formData;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    // Validate age if provided
    const ageNumber = age ? parseInt(age) : 25;
    if (age && (isNaN(ageNumber) || ageNumber < 18 || ageNumber > 100)) {
      showError('Please enter a valid age between 18 and 100');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    try {
      await register({
        name: `${firstName} ${lastName}`.trim(),
        email: email.toLowerCase().trim(),
        password,
        age: ageNumber,
        bio: bio.trim(),
        city: city.trim(),
        interests: [], // Will be collected in profile setup later
      });
      // Registration successful - show success toast
      showSuccess(`Welcome to PlayDate, ${firstName}! 🎉`, 4000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      showError(errorMessage, 5000);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join PlayDate and start connecting</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="First name"
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Last name"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Create a password"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Confirm your password"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Age (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(value) => updateFormData('age', value)}
                placeholder="25"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>City (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => updateFormData('city', value)}
                placeholder="Your city"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(value) => updateFormData('bio', value)}
              placeholder="Tell us a bit about yourself..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, state.isLoading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={state.isLoading}
          >
            <Text style={styles.registerButtonText}>
              {state.isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: extendedTheme.colors.background,
  },
  header: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingTop: extendedTheme.spacing.xl,
    paddingBottom: extendedTheme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.md,
  },
  backButtonText: {
    fontSize: 24,
    color: extendedTheme.colors.primary,
  },
  title: {
    ...extendedTheme.typography.h1,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: extendedTheme.spacing.xs,
  },
  subtitle: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
  },
  form: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingBottom: extendedTheme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: extendedTheme.spacing.lg,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    ...extendedTheme.typography.bodySmall,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.xs,
    color: extendedTheme.colors.text,
  },
  input: {
    ...commonStyles.input,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  registerButton: {
    ...commonStyles.button,
    backgroundColor: extendedTheme.colors.primary,
    marginTop: extendedTheme.spacing.md,
    marginBottom: extendedTheme.spacing.lg,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    ...commonStyles.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
  },
  loginLink: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
