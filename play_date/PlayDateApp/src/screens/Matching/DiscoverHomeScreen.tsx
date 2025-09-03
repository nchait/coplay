import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from '../../navigation/types';
import { extendedTheme, commonStyles } from '../../utils/theme';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'DiscoverHome'>;

const DiscoverHomeScreen: React.FC<Props> = ({ navigation }) => {
  const mockUsers = [
    { id: '1', name: 'Sarah', age: 25, bio: 'Love puzzle games!' },
    { id: '2', name: 'Mike', age: 28, bio: 'Gaming enthusiast' },
    { id: '3', name: 'Emma', age: 24, bio: 'Looking for fun connections' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Find people to play with</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardContainer}>
          {mockUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userCard}
              onPress={() => navigation.navigate('UserProfile', { userId: user.id })}
            >
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{user.name[0]}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}, {user.age}</Text>
                <Text style={styles.userBio}>{user.bio}</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.passButton}>
                  <Text style={styles.passButtonText}>Pass</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.likeButton}>
                  <Text style={styles.likeButtonText}>Like</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🎯</Text>
          <Text style={styles.emptyStateTitle}>That's everyone for now!</Text>
          <Text style={styles.emptyStateText}>
            Check back later for more people to connect with
          </Text>
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
    paddingTop: extendedTheme.spacing.lg,
    paddingBottom: extendedTheme.spacing.md,
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
  content: {
    flex: 1,
  },
  cardContainer: {
    paddingHorizontal: extendedTheme.spacing.lg,
  },
  userCard: {
    backgroundColor: extendedTheme.colors.surface,
    borderRadius: extendedTheme.borderRadius.lg,
    padding: extendedTheme.spacing.lg,
    marginBottom: extendedTheme.spacing.md,
    ...extendedTheme.shadows.sm,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: extendedTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.md,
  },
  avatarText: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.surface,
    fontWeight: '700',
  },
  userInfo: {
    marginBottom: extendedTheme.spacing.lg,
  },
  userName: {
    ...extendedTheme.typography.h3,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.xs,
  },
  userBio: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passButton: {
    flex: 1,
    paddingVertical: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    backgroundColor: extendedTheme.colors.border,
    marginRight: extendedTheme.spacing.sm,
    alignItems: 'center',
  },
  passButtonText: {
    ...extendedTheme.typography.body,
    fontWeight: '600',
    color: extendedTheme.colors.textSecondary,
  },
  likeButton: {
    flex: 1,
    paddingVertical: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    backgroundColor: extendedTheme.colors.primary,
    marginLeft: extendedTheme.spacing.sm,
    alignItems: 'center',
  },
  likeButtonText: {
    ...extendedTheme.typography.body,
    fontWeight: '600',
    color: extendedTheme.colors.surface,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: extendedTheme.spacing.md,
  },
  emptyStateTitle: {
    ...extendedTheme.typography.h3,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DiscoverHomeScreen;
