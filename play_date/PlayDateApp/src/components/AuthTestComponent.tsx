import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { extendedTheme } from '../utils/theme';
import { tokenManager } from '../services/api';
import { NetworkDebug } from '../utils/networkDebug';

// Get the same API URL that the app is using
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  } else {
    return 'http://localhost:5000';
  }
};

/**
 * Test component to verify persistent authentication functionality
 * This component can be temporarily added to any screen to test auth persistence
 */
const AuthTestComponent: React.FC = () => {
  const { state, logout, checkAuthStatus } = useAuth();

  const handleCheckToken = async () => {
    try {
      const token = await tokenManager.getToken();
      Alert.alert(
        'Token Status',
        token ? `Token exists: ${token.substring(0, 20)}...` : 'No token found'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to check token');
    }
  };

  const handleForceAuthCheck = async () => {
    try {
      await checkAuthStatus();
      Alert.alert('Auth Check', 'Auth status check completed');
    } catch (error) {
      Alert.alert('Error', 'Auth check failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      Alert.alert('Error', 'Logout failed');
    }
  };

  const handleTestConnection = async () => {
    try {
      const apiUrl = getApiUrl();
      const result = await NetworkDebug.testServerConnection(apiUrl);
      Alert.alert(
        'Connection Test',
        result.success
          ? `Server connection successful!\nURL: ${apiUrl}`
          : `Connection failed: ${result.error}\nURL: ${apiUrl}`
      );
    } catch (error) {
      Alert.alert('Error', 'Connection test failed');
    }
  };

  const handleTestTokenValidation = async () => {
    try {
      const token = await tokenManager.getToken();
      if (!token) {
        Alert.alert('Error', 'No token found to test');
        return;
      }

      const apiUrl = getApiUrl();
      const result = await NetworkDebug.testTokenValidation(apiUrl, token);
      Alert.alert(
        'Token Validation Test',
        result.success
          ? 'Token validation successful!'
          : `Token validation failed: ${result.error}`
      );
    } catch (error) {
      Alert.alert('Error', 'Token validation test failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Test Panel</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[
          styles.statusValue,
          { color: state.isAuthenticated ? extendedTheme.colors.success : extendedTheme.colors.error }
        ]}>
          {state.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Loading:</Text>
        <Text style={styles.statusValue}>
          {state.isLoading ? 'Yes' : 'No'}
        </Text>
      </View>

      {state.user && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>User:</Text>
          <Text style={styles.statusValue}>
            {state.user.username} ({state.user.email})
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCheckToken}>
          <Text style={styles.buttonText}>Check Token</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleForceAuthCheck}>
          <Text style={styles.buttonText}>Force Auth Check</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleTestConnection}>
          <Text style={styles.buttonText}>Test Server Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleTestTokenValidation}>
          <Text style={styles.buttonText}>Test Token Validation</Text>
        </TouchableOpacity>

        {state.isAuthenticated && (
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Test Logout</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Test Instructions:</Text>
        <Text style={styles.instructionsText}>
          1. Login normally{'\n'}
          2. Close and reopen the app{'\n'}
          3. You should see the loading screen briefly{'\n'}
          4. Then automatically go to the home page{'\n'}
          5. Use "Check Token" to verify token persistence
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: extendedTheme.colors.surface,
    borderRadius: extendedTheme.borderRadius.lg,
    padding: extendedTheme.spacing.lg,
    margin: extendedTheme.spacing.md,
    ...extendedTheme.shadows.sm,
  },
  title: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.lg,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.sm,
    paddingVertical: extendedTheme.spacing.xs,
  },
  statusLabel: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    fontWeight: '500',
  },
  statusValue: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: extendedTheme.spacing.lg,
    gap: extendedTheme.spacing.sm,
  },
  button: {
    backgroundColor: extendedTheme.colors.primary,
    borderRadius: extendedTheme.borderRadius.md,
    paddingVertical: extendedTheme.spacing.sm,
    paddingHorizontal: extendedTheme.spacing.md,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: extendedTheme.colors.error,
  },
  buttonText: {
    ...extendedTheme.typography.button,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  instructionsContainer: {
    marginTop: extendedTheme.spacing.lg,
    padding: extendedTheme.spacing.md,
    backgroundColor: extendedTheme.colors.background,
    borderRadius: extendedTheme.borderRadius.md,
  },
  instructionsTitle: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.primary,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.xs,
  },
  instructionsText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
    lineHeight: 18,
  },
});

export default AuthTestComponent;
