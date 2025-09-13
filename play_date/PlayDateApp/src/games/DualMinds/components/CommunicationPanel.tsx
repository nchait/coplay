import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { extendedTheme } from '../../../utils/theme';
import { PlayerRole } from '../types';

interface CommunicationPanelProps {
  playerRole: PlayerRole;
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

const CommunicationPanel: React.FC<CommunicationPanelProps> = ({
  playerRole,
  onSendMessage,
  onClose,
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    fromPlayer: string;
    timestamp: number;
  }>>([]);

  const quickMessages = getQuickMessages(playerRole);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        fromPlayer: 'You',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleQuickMessage = (quickMessage: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text: quickMessage,
      fromPlayer: 'You',
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    onSendMessage(quickMessage);
  };

  const getRoleInstructions = (role: PlayerRole): string => {
    switch (role) {
      case 'schematic_viewer':
        return 'You can see the circuit schematic. Guide your partner with clear instructions.';
      case 'wire_manipulator':
        return 'You control the wires and switches. Listen carefully to your partner\'s instructions.';
      case 'map_viewer':
        return 'You can see the maze map. Guide your partner through the maze safely.';
      case 'maze_navigator':
        return 'You move through the maze. Follow your partner\'s directions carefully.';
      case 'sequence_viewer':
        return 'You can see the color sequence. Tell your partner which colors to press.';
      case 'button_presser':
        return 'You control the buttons. Listen to your partner and press the correct sequence.';
      case 'piece_manipulator':
        return 'You can move bridge pieces. Build according to your partner\'s guidance.';
      case 'bridge_tester':
        return 'You can test the bridge. Tell your partner if it\'s stable or needs changes.';
      case 'melody_listener':
        return 'You can hear the melody. Describe it to your partner clearly.';
      case 'note_player':
        return 'You can play notes. Listen to your partner and play the correct melody.';
      default:
        return 'Work together to complete the challenge!';
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Communication</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Role Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>
              {getRoleInstructions(playerRole)}
            </Text>
          </View>

          {/* Messages */}
          <ScrollView style={styles.messagesContainer}>
            {messages.map((msg) => (
              <View key={msg.id} style={styles.messageContainer}>
                <Text style={styles.messageText}>{msg.text}</Text>
                <Text style={styles.messageTime}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Quick Messages */}
          <View style={styles.quickMessagesContainer}>
            <Text style={styles.quickMessagesTitle}>Quick Messages:</Text>
            <View style={styles.quickMessagesGrid}>
              {quickMessages.map((quickMsg, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickMessageButton}
                  onPress={() => handleQuickMessage(quickMsg)}
                >
                  <Text style={styles.quickMessageText}>{quickMsg}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !message.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getQuickMessages = (role: PlayerRole): string[] => {
  switch (role) {
    case 'schematic_viewer':
      return [
        'Connect the red wire',
        'Turn on the switch',
        'Check the power source',
        'Try the blue wire',
        'That looks correct!',
      ];
    case 'wire_manipulator':
      return [
        'I connected it',
        'Switch is on',
        'Need more guidance',
        'Which wire next?',
        'Done!',
      ];
    case 'map_viewer':
      return [
        'Go left',
        'Go right',
        'Go straight',
        'Turn around',
        'You\'re close!',
      ];
    case 'maze_navigator':
      return [
        'Going left',
        'Going right',
        'Going straight',
        'Hit a wall',
        'Found the exit!',
      ];
    case 'sequence_viewer':
      return [
        'Press red',
        'Press blue',
        'Press green',
        'Press yellow',
        'That\'s correct!',
      ];
    case 'button_presser':
      return [
        'Pressed red',
        'Pressed blue',
        'Pressed green',
        'Pressed yellow',
        'Sequence complete!',
      ];
    case 'piece_manipulator':
      return [
        'Placed beam',
        'Added support',
        'Rotated piece',
        'Need guidance',
        'Bridge ready!',
      ];
    case 'bridge_tester':
      return [
        'Bridge is stable',
        'Bridge is weak',
        'Need more support',
        'Try different angle',
        'Perfect!',
      ];
    case 'melody_listener':
      return [
        'High note',
        'Low note',
        'Fast tempo',
        'Slow tempo',
        'That\'s it!',
      ];
    case 'note_player':
      return [
        'Playing C',
        'Playing D',
        'Playing E',
        'Playing F',
        'Melody complete!',
      ];
    default:
      return [
        'Good job!',
        'Try again',
        'Almost there',
        'Need help',
        'Perfect!',
      ];
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: extendedTheme.colors.surface,
    borderTopLeftRadius: extendedTheme.borderRadius.xl,
    borderTopRightRadius: extendedTheme.borderRadius.xl,
    maxHeight: '80%',
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
  title: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.text,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: extendedTheme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.textSecondary,
  },
  instructionsContainer: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    backgroundColor: extendedTheme.colors.background,
  },
  instructionText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    maxHeight: 200,
  },
  messageContainer: {
    backgroundColor: extendedTheme.colors.primary,
    padding: extendedTheme.spacing.sm,
    borderRadius: extendedTheme.borderRadius.md,
    marginBottom: extendedTheme.spacing.sm,
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  messageText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.background,
  },
  messageTime: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.background,
    opacity: 0.7,
    marginTop: extendedTheme.spacing.xs,
  },
  quickMessagesContainer: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: extendedTheme.colors.borderLight,
  },
  quickMessagesTitle: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.sm,
  },
  quickMessagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: extendedTheme.spacing.sm,
  },
  quickMessageButton: {
    backgroundColor: extendedTheme.colors.borderLight,
    paddingHorizontal: extendedTheme.spacing.sm,
    paddingVertical: extendedTheme.spacing.xs,
    borderRadius: extendedTheme.borderRadius.sm,
  },
  quickMessageText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.text,
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
    backgroundColor: extendedTheme.colors.background,
    borderRadius: extendedTheme.borderRadius.md,
    paddingHorizontal: extendedTheme.spacing.md,
    paddingVertical: extendedTheme.spacing.sm,
    marginRight: extendedTheme.spacing.sm,
    maxHeight: 100,
    ...extendedTheme.typography.body,
  },
  sendButton: {
    backgroundColor: extendedTheme.colors.primary,
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.sm,
    borderRadius: extendedTheme.borderRadius.md,
  },
  sendButtonDisabled: {
    backgroundColor: extendedTheme.colors.borderLight,
  },
  sendButtonText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
});

export default CommunicationPanel;
