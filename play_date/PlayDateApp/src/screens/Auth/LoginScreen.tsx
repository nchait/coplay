import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { extendedTheme, commonStyles } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, state } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      // Navigation will be handled by the AuthContext/RootNavigator
      showSuccess('Welcome back! 🎮', 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      showError(errorMessage, 4000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
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
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, state.isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={state.isLoading}
        >
          <Text style={styles.loginButtonText}>
            {state.isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  inputContainer: {
    marginBottom: extendedTheme.spacing.lg,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: extendedTheme.spacing.xl,
  },
  forgotPasswordText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    ...commonStyles.button,
    backgroundColor: extendedTheme.colors.primary,
    marginBottom: extendedTheme.spacing.lg,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...commonStyles.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
  },
  signupLink: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
