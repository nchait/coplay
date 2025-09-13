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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GamesStackParamList } from '../../navigation/types';
import { challengeService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface Challenge {
  sessionId: number;
  gameType: string;
  isSent: boolean;
  challenger: {
    id: number;
    name: string;
  } | null;
  challenged: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  status?: string;
}

type NavigationProp = NativeStackNavigationProp<GamesStackParamList>;

const ChallengesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state } = useAuth();
  const { showToast } = useToast();
  
  const [challenges, setChallenges] = useState<{
    sentChallenges: Challenge[];
    receivedChallenges: Challenge[];
  }>({ sentChallenges: [], receivedChallenges: [] });
  const [acceptedChallenges, setAcceptedChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responding, setResponding] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted'>('pending');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const [pendingResponse, acceptedResponse] = await Promise.all([
        challengeService.getPendingChallenges(),
        challengeService.getAcceptedChallenges()
      ]);
      
      if (pendingResponse.data) {
        setChallenges(pendingResponse.data);
      } else {
        showToast('Failed to load pending challenges', 'error');
      }

      if (acceptedResponse.data) {
        setAcceptedChallenges(acceptedResponse.data.acceptedChallenges);
      } else {
        showToast('Failed to load accepted challenges', 'error');
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      showToast('Failed to load challenges', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const handleRespondToChallenge = async (challenge: Challenge, response: 'accept' | 'decline') => {
    try {
      console.log('Responding to challenge:', { sessionId: challenge.sessionId, response });
      setResponding(challenge.sessionId);
      
      const apiResponse = await challengeService.respondToChallenge(challenge.sessionId, response);
      console.log('API Response:', apiResponse);
      
      if (apiResponse.data) {
        if (response === 'accept') {
          showToast('Challenge accepted! Starting game...', 'success');
          // Navigate to game lobby or game screen
          // navigation.navigate('GameLobby', { sessionId: challenge.sessionId });
        } else {
          showToast('Challenge declined', 'info');
        }
        
        // Reload challenges to update the list
        await loadChallenges();
      } else {
        console.log('API Error:', apiResponse.error);
        showToast(apiResponse.error || apiResponse.message || 'Failed to respond to challenge', 'error');
      }
    } catch (error) {
      console.error('Error responding to challenge:', error);
      showToast('Failed to respond to challenge', 'error');
    } finally {
      setResponding(null);
    }
  };

  const confirmResponse = (challenge: Challenge, response: 'accept' | 'decline') => {
    console.log('Confirming response:', { challenge, response });
    const action = response === 'accept' ? 'accept' : 'decline';

      handleRespondToChallenge(challenge, response)

  };

  const handleJoinLobby = (challenge: Challenge) => {
    // Navigate to game lobby with the session ID
    navigation.navigate('GameLobby', { 
      matchId: challenge.sessionId.toString(), 
      gameType: challenge.gameType as any
    });
  };

  const renderChallenge = ({ item }: { item: Challenge }) => (
    <View style={styles.challengeItem}>
      <View style={styles.challengeInfo}>
        <Text style={styles.gameType}>{item.gameType}</Text>
        <Text style={styles.challengeText}>
          {item.isSent 
            ? `Challenged ${item.challenged?.name}`
            : `Challenged by ${item.challenger?.name}`
          }
        </Text>
        <Text style={styles.createdAt}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      
      {activeTab === 'pending' && !item.isSent && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => confirmResponse(item, 'accept')}
            disabled={responding === item.sessionId}
          >
            {responding === item.sessionId ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.acceptButtonText}>Accept</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => confirmResponse(item, 'decline')}
            disabled={responding === item.sessionId}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {activeTab === 'pending' && item.isSent && (
        <View style={styles.sentStatus}>
          <Text style={styles.sentStatusText}>Sent</Text>
        </View>
      )}

      {activeTab === 'accepted' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.joinButton]}
          onPress={() => handleJoinLobby(item)}
        >
          <Text style={styles.joinButtonText}>Join Lobby</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const allChallenges = [...challenges.sentChallenges, ...challenges.receivedChallenges];
  const currentData = activeTab === 'pending' ? allChallenges : acceptedChallenges;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Challenges</Text>
        <Text style={styles.subtitle}>
          {activeTab === 'pending' 
            ? `${challenges.sentChallenges.length} sent, ${challenges.receivedChallenges.length} received`
            : `${acceptedChallenges.length} accepted challenges`
          }
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'accepted' && styles.activeTab]}
          onPress={() => setActiveTab('accepted')}
        >
          <Text style={[styles.tabText, activeTab === 'accepted' && styles.activeTabText]}>
            Accepted
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentData}
        keyExtractor={(item) => item.sessionId.toString()}
        renderItem={renderChallenge}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'pending' ? 'No pending challenges' : 'No accepted challenges'}
            </Text>
            <TouchableOpacity onPress={loadChallenges} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Refresh</Text>
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
  challengeItem: {
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
  challengeInfo: {
    flex: 1,
  },
  gameType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  challengeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  createdAt: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#f44336',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sentStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#e3f2fd',
    borderRadius: 5,
  },
  sentStatusText: {
    color: '#1976d2',
    fontSize: 12,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#007AFF',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChallengesScreen;
