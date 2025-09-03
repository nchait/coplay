import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const ProfileHomeScreen: React.FC = () => {
  const { state, logout } = useAuth();
  const { showSuccess } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully! See you soon! 👋', 3000);
    } catch (error) {
      // Logout should always succeed, but just in case
      await logout();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {state.user?.name?.[0] || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>
            {state.user?.name}
          </Text>
          <Text style={styles.email}>{state.user?.email}</Text>
          {state.user?.age && (
            <Text style={styles.age}>Age: {state.user.age}</Text>
          )}
          {state.user?.bio && (
            <Text style={styles.bio}>{state.user.bio}</Text>
          )}
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>✏️</Text>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Settings</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>Privacy</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>Help</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: extendedTheme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: extendedTheme.spacing.xl,
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: extendedTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.md,
  },
  avatarText: {
    ...extendedTheme.typography.h2,
    color: extendedTheme.colors.surface,
    fontWeight: '700',
  },
  name: {
    ...extendedTheme.typography.h2,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.xs,
  },
  email: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.xs,
  },
  age: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.xs,
  },
  bio: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: extendedTheme.spacing.lg,
  },
  menuSection: {
    paddingHorizontal: extendedTheme.spacing.lg,
    marginBottom: extendedTheme.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: extendedTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: extendedTheme.colors.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: extendedTheme.spacing.md,
    width: 24,
  },
  menuText: {
    ...extendedTheme.typography.body,
    flex: 1,
    fontWeight: '500',
  },
  menuArrow: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
  },
  logoutButton: {
    marginHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    backgroundColor: extendedTheme.colors.error,
    alignItems: 'center',
  },
  logoutText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.surface,
    fontWeight: '600',
  },
});

export default ProfileHomeScreen;
