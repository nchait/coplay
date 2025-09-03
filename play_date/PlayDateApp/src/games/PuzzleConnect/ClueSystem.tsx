import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';

interface ClueSystemProps {
  clues: string[];
  onClueShare: (clue: string) => void;
  isGameActive: boolean;
  playerRole: 'A' | 'B';
}

const ClueSystem: React.FC<ClueSystemProps> = ({
  clues,
  onClueShare,
  isGameActive,
  playerRole,
}) => {
  const [newClue, setNewClue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendClue = () => {
    if (!newClue.trim() || !isGameActive) return;

    const clueWithRole = `Player ${playerRole}: ${newClue.trim()}`;
    onClueShare(clueWithRole);
    setNewClue('');
    
    // Auto-scroll to bottom after sending
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getQuickClues = () => {
    return [
      `Row 1 has a ${Math.floor(Math.random() * 4) + 1}`,
      `Column 2 pattern: ascending`,
      `Top-left corner is ${Math.floor(Math.random() * 4) + 1}`,
      `Bottom row: all even numbers`,
      `Middle has alternating pattern`,
      `Diagonal shows sequence`,
    ];
  };

  const handleQuickClue = (clue: string) => {
    if (!isGameActive) return;
    const clueWithRole = `Player ${playerRole}: ${clue}`;
    onClueShare(clueWithRole);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <Text style={styles.headerTitle}>
          Communication ({clues.length} clues)
        </Text>
        <Text style={styles.expandIcon}>
          {isExpanded ? '▼' : '▲'}
        </Text>
      </TouchableOpacity>

      {/* Clues List */}
      {isExpanded && (
        <View style={styles.cluesContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.cluesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {clues.length === 0 ? (
              <Text style={styles.noCluesText}>
                No clues shared yet. Start communicating with your partner!
              </Text>
            ) : (
              clues.map((clue, index) => (
                <View key={index} style={styles.clueItem}>
                  <Text style={styles.clueText}>{clue}</Text>
                  <Text style={styles.clueTime}>
                    {new Date().toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          {/* Quick Clues */}
          {isGameActive && (
            <View style={styles.quickCluesContainer}>
              <Text style={styles.quickCluesTitle}>Quick Clues:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.quickCluesScroll}
              >
                {getQuickClues().map((clue, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickClueButton}
                    onPress={() => handleQuickClue(clue)}
                  >
                    <Text style={styles.quickClueText}>{clue}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Input Area */}
          {isGameActive && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={newClue}
                onChangeText={setNewClue}
                placeholder="Share a clue with your partner..."
                placeholderTextColor={extendedTheme.colors.textLight}
                multiline
                maxLength={100}
                returnKeyType="send"
                onSubmitEditing={handleSendClue}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !newClue.trim() && styles.sendButtonDisabled
                ]}
                onPress={handleSendClue}
                disabled={!newClue.trim()}
              >
                <Text style={[
                  styles.sendButtonText,
                  !newClue.trim() && styles.sendButtonTextDisabled
                ]}>
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Collapsed State */}
      {!isExpanded && clues.length > 0 && (
        <View style={styles.collapsedPreview}>
          <Text style={styles.lastCluePreview} numberOfLines={1}>
            Latest: {clues[clues.length - 1]}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: extendedTheme.colors.surface,
    borderTopLeftRadius: extendedTheme.borderRadius.lg,
    borderTopRightRadius: extendedTheme.borderRadius.lg,
    ...extendedTheme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: extendedTheme.colors.borderLight,
  },
  headerTitle: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.gameAccent,
    fontWeight: '600',
  },
  expandIcon: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.textSecondary,
  },
  cluesContainer: {
    maxHeight: 300,
  },
  cluesList: {
    maxHeight: 150,
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.sm,
  },
  noCluesText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: extendedTheme.spacing.lg,
  },
  clueItem: {
    backgroundColor: extendedTheme.colors.background,
    borderRadius: extendedTheme.borderRadius.md,
    padding: extendedTheme.spacing.sm,
    marginBottom: extendedTheme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: extendedTheme.colors.secondary,
  },
  clueText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.text,
    marginBottom: extendedTheme.spacing.xs,
  },
  clueTime: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textLight,
    alignSelf: 'flex-end',
  },
  quickCluesContainer: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: extendedTheme.colors.borderLight,
  },
  quickCluesTitle: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.xs,
    fontWeight: '500',
  },
  quickCluesScroll: {
    flexGrow: 0,
  },
  quickClueButton: {
    backgroundColor: extendedTheme.colors.secondary + '20',
    borderRadius: extendedTheme.borderRadius.md,
    paddingHorizontal: extendedTheme.spacing.sm,
    paddingVertical: extendedTheme.spacing.xs,
    marginRight: extendedTheme.spacing.sm,
    borderWidth: 1,
    borderColor: extendedTheme.colors.secondary,
  },
  quickClueText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.secondary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: extendedTheme.colors.borderLight,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: extendedTheme.colors.border,
    borderRadius: extendedTheme.borderRadius.md,
    paddingHorizontal: extendedTheme.spacing.sm,
    paddingVertical: extendedTheme.spacing.sm,
    marginRight: extendedTheme.spacing.sm,
    maxHeight: 80,
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.text,
  },
  sendButton: {
    backgroundColor: extendedTheme.colors.primary,
    borderRadius: extendedTheme.borderRadius.md,
    paddingHorizontal: extendedTheme.spacing.md,
    paddingVertical: extendedTheme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: extendedTheme.colors.textLight,
  },
  sendButtonText: {
    ...extendedTheme.typography.button,
    color: extendedTheme.colors.background,
    fontSize: 14,
  },
  sendButtonTextDisabled: {
    color: extendedTheme.colors.background,
    opacity: 0.7,
  },
  collapsedPreview: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingBottom: extendedTheme.spacing.sm,
  },
  lastCluePreview: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default ClueSystem;
