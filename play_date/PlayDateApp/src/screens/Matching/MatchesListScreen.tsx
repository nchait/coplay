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
import { MatchesStackParamList } from '../../navigation/types';
import { extendedTheme } from '../../utils/theme';

type Props = NativeStackScreenProps<MatchesStackParamList, 'MatchesList'>;

const MatchesListScreen: React.FC<Props> = ({ navigation }) => {
  const mockMatches = [
    { id: '1', name: 'Sarah', lastMessage: 'Ready for a game?', time: '2m ago', unread: true },
    { id: '2', name: 'Mike', lastMessage: 'That was fun!', time: '1h ago', unread: false },
    { id: '3', name: 'Emma', lastMessage: 'Hey there! 👋', time: '3h ago', unread: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>Your connections</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {mockMatches.map((match) => (
          <TouchableOpacity
            key={match.id}
            style={styles.matchCard}
            onPress={() => navigation.navigate('Chat', { matchId: match.id })}
          >
            <View style={styles.matchAvatar}>
              <Text style={styles.avatarText}>{match.name[0]}</Text>
              {match.unread && <View style={styles.unreadIndicator} />}
            </View>
            <View style={styles.matchInfo}>
              <Text style={styles.matchName}>{match.name}</Text>
              <Text style={[
                styles.lastMessage,
                match.unread && styles.unreadMessage
              ]}>
                {match.lastMessage}
              </Text>
            </View>
            <View style={styles.matchMeta}>
              <Text style={styles.timeText}>{match.time}</Text>
              <TouchableOpacity
                style={styles.gameButton}
                onPress={() => navigation.navigate('GameInvite', { matchId: match.id })}
              >
                <Text style={styles.gameButtonText}>🎮</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {mockMatches.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💝</Text>
            <Text style={styles.emptyStateTitle}>No matches yet</Text>
            <Text style={styles.emptyStateText}>
              Start discovering people to make your first connection!
            </Text>
          </View>
        )}
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
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: extendedTheme.colors.border,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: extendedTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: extendedTheme.spacing.md,
    position: 'relative',
  },
  avatarText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.surface,
    fontWeight: '700',
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: extendedTheme.colors.accent,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    ...extendedTheme.typography.body,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.xs,
  },
  lastMessage: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
  },
  unreadMessage: {
    color: extendedTheme.colors.text,
    fontWeight: '500',
  },
  matchMeta: {
    alignItems: 'flex-end',
  },
  timeText: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textLight,
    marginBottom: extendedTheme.spacing.xs,
  },
  gameButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: extendedTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...extendedTheme.shadows.sm,
  },
  gameButtonText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.xl,
    marginTop: extendedTheme.spacing.xl,
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

export default MatchesListScreen;
