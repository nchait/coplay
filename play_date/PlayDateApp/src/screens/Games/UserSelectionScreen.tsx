import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { challengeService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserSelectionScreenRouteParams {
  gameType: string;
  gameName: string;
}

const UserSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: UserSelectionScreenRouteParams }, 'params'>>();
  const { gameType, gameName } = route.params || { gameType: '', gameName: '' };
  
  const { state } = useAuth();
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [challenging, setChallenging] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await challengeService.getAllUsers();
      if (response.data && response.data.users) {
        // Filter out the current user from the list
        const currentUserId = state.user?.id;
        const filteredUsers = response.data.users.filter(user => 
          user.id.toString() !== currentUserId
        );
        setUsers(filteredUsers);
      } else {
        showToast('Failed to load users', 'error');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleChallengeUser = async (challengedUser: User) => {
    try {
      setChallenging(challengedUser.id);
      
      const response = await challengeService.sendChallenge(challengedUser.id, gameType);
      
      if (response.data) {
        showToast(`Challenge sent to ${challengedUser.name}!`, 'success');
        
        // Navigate back to games list or show pending challenges
        navigation.goBack();
      } else {
        showToast(response.error || 'Failed to send challenge', 'error');
      }
    } catch (error) {
      console.error('Error sending challenge:', error);
      showToast('Failed to send challenge', 'error');
    } finally {
      setChallenging(null);
    }
  };

  const confirmChallenge = (challengedUser: User) => {
    Alert.alert(
      'Send Challenge',
      `Challenge ${challengedUser.name} to play ${gameName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Challenge', onPress: () => handleChallengeUser(challengedUser) },
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => confirmChallenge(item)}
      disabled={challenging === item.id}
    >
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.username}>{item.name}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: item.is_active ? '#4CAF50' : '#9E9E9E' }]} />
        </View>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.lastSeen}>
          Member since: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      {challenging === item.id ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : (
        <Text style={styles.challengeButton}>Challenge</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Challenge a Player</Text>
        <Text style={styles.subtitle}>Select a player to challenge to {gameName}</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users available</Text>
            <TouchableOpacity onPress={loadUsers} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 10,
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  lastSeen: {
    fontSize: 12,
    color: '#999',
  },
  challengeButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserSelectionScreen;
