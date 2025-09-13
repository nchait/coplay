import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { extendedTheme } from '../../../utils/theme';
import { WireConnection, SwitchState } from '../../../types';

interface WireManipulatorProps {
  connections: WireConnection[];
  switches: SwitchState[];
  onWireConnection: (connectionId: string, isConnected: boolean) => void;
  onSwitchToggle: (switchId: string) => void;
}

const WireManipulator: React.FC<WireManipulatorProps> = ({
  connections,
  switches,
  onWireConnection,
  onSwitchToggle,
}) => {
  const { width, height } = Dimensions.get('window');
  const canvasWidth = width - (extendedTheme.spacing.lg * 2);
  const canvasHeight = height * 0.4;

  const [selectedWire, setSelectedWire] = useState<string | null>(null);

  const renderWire = (connection: WireConnection) => {
    const isSelected = selectedWire === connection.id;
    const isConnected = connection.isConnected;

    return (
      <TouchableOpacity
        key={connection.id}
        style={[
          styles.wire,
          {
            backgroundColor: isConnected ? connection.color : extendedTheme.colors.borderLight,
            borderColor: isSelected ? extendedTheme.colors.primary : 'transparent',
            borderWidth: isSelected ? 3 : 0,
          },
        ]}
        onPress={() => handleWirePress(connection.id)}
      >
        <Text style={styles.wireLabel}>
          {connection.fromNodeId} → {connection.toNodeId}
        </Text>
        <Text style={styles.wireStatus}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSwitch = (switchState: SwitchState) => {
    return (
      <TouchableOpacity
        key={switchState.id}
        style={[
          styles.switch,
          {
            backgroundColor: switchState.isOn ? extendedTheme.colors.success : extendedTheme.colors.error,
          },
        ]}
        onPress={() => handleSwitchPress(switchState.id)}
      >
        <Text style={styles.switchLabel}>
          {switchState.isOn ? 'ON' : 'OFF'}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleWirePress = (connectionId: string) => {
    if (selectedWire === connectionId) {
      // Toggle connection
      const connection = connections.find(c => c.id === connectionId);
      if (connection) {
        onWireConnection(connectionId, !connection.isConnected);
        setSelectedWire(null);
      }
    } else {
      setSelectedWire(connectionId);
    }
  };

  const handleSwitchPress = (switchId: string) => {
    onSwitchToggle(switchId);
  };

  const handleConnectSelected = () => {
    if (selectedWire) {
      const connection = connections.find(c => c.id === selectedWire);
      if (connection) {
        onWireConnection(selectedWire, true);
        setSelectedWire(null);
      }
    }
  };

  const handleDisconnectSelected = () => {
    if (selectedWire) {
      const connection = connections.find(c => c.id === selectedWire);
      if (connection) {
        onWireConnection(selectedWire, false);
        setSelectedWire(null);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wire Control Panel</Text>
      <Text style={styles.subtitle}>Follow your partner's instructions</Text>
      
      {/* Wire Controls */}
      <View style={styles.wiresContainer}>
        <Text style={styles.sectionTitle}>Wires</Text>
        {connections.map(renderWire)}
      </View>

      {/* Switch Controls */}
      <View style={styles.switchesContainer}>
        <Text style={styles.sectionTitle}>Switches</Text>
        <View style={styles.switchesGrid}>
          {switches.map(renderSwitch)}
        </View>
      </View>

      {/* Action Buttons */}
      {selectedWire && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.connectButton]}
            onPress={handleConnectSelected}
          >
            <Text style={styles.actionButtonText}>Connect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.disconnectButton]}
            onPress={handleDisconnectSelected}
          >
            <Text style={styles.actionButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Instructions for Player B */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>Your Role:</Text>
        <Text style={styles.instructionText}>
          • You can see and control the wires and switches
        </Text>
        <Text style={styles.instructionText}>
          • Listen to your partner's instructions carefully
        </Text>
        <Text style={styles.instructionText}>
          • Tap a wire to select it, then tap Connect/Disconnect
        </Text>
        <Text style={styles.instructionText}>
          • Tap switches to turn them on or off
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...extendedTheme.typography.h3,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.xs,
  },
  subtitle: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.lg,
  },
  wiresContainer: {
    marginBottom: extendedTheme.spacing.lg,
  },
  sectionTitle: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.sm,
  },
  wire: {
    backgroundColor: extendedTheme.colors.surface,
    padding: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    marginBottom: extendedTheme.spacing.sm,
    ...extendedTheme.shadows.sm,
  },
  wireLabel: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.xs,
  },
  wireStatus: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
  },
  switchesContainer: {
    marginBottom: extendedTheme.spacing.lg,
  },
  switchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  switch: {
    width: '48%',
    padding: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.sm,
    ...extendedTheme.shadows.sm,
  },
  switchLabel: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: extendedTheme.spacing.lg,
  },
  actionButton: {
    paddingHorizontal: extendedTheme.spacing.lg,
    paddingVertical: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    minWidth: 120,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: extendedTheme.colors.success,
  },
  disconnectButton: {
    backgroundColor: extendedTheme.colors.error,
  },
  actionButtonText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: extendedTheme.colors.surface,
    padding: extendedTheme.spacing.md,
    borderRadius: extendedTheme.borderRadius.md,
    ...extendedTheme.shadows.sm,
  },
  instructionTitle: {
    ...extendedTheme.typography.h4,
    color: extendedTheme.colors.text,
    fontWeight: '600',
    marginBottom: extendedTheme.spacing.sm,
  },
  instructionText: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.textSecondary,
    marginBottom: extendedTheme.spacing.xs,
  },
});

export default WireManipulator;
