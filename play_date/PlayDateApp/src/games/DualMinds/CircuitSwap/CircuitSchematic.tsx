import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { extendedTheme } from '../../../utils/theme';
import { CircuitNode, WireConnection, SwitchState } from '../../../types';

interface CircuitSchematicProps {
  schematic: CircuitNode[];
  connections: WireConnection[];
  switches: SwitchState[];
  completedSections: string[];
  onSectionComplete: (sectionId: string) => void;
}

const CircuitSchematic: React.FC<CircuitSchematicProps> = ({
  schematic,
  connections,
  switches,
  completedSections,
  onSectionComplete,
}) => {
  const { width, height } = Dimensions.get('window');
  const canvasWidth = width - (extendedTheme.spacing.lg * 2);
  const canvasHeight = height * 0.4;

  // Debug logging
  console.log('CircuitSchematic render:', {
    schematic: schematic.length,
    connections: connections.length,
    switches: switches.length,
    canvasWidth,
    canvasHeight,
  });

  const renderNode = (node: CircuitNode) => {
    const nodeStyle = [
      styles.node,
      {
        left: (node.x / 100) * canvasWidth - 25, // Center the node
        top: (node.y / 100) * canvasHeight - 25,
        backgroundColor: getNodeColor(node.type),
        borderColor: getNodeColor(node.type),
        borderWidth: 2,
      },
    ];

    return (
      <TouchableOpacity
        key={node.id}
        style={nodeStyle}
        onPress={() => handleNodePress(node)}
      >
        <Text style={styles.nodeLabel}>{getNodeLabel(node.type)}</Text>
      </TouchableOpacity>
    );
  };

  const renderConnection = (connection: WireConnection) => {
    const fromNode = schematic.find(n => n.id === connection.fromNodeId);
    const toNode = schematic.find(n => n.id === connection.toNodeId);
    
    if (!fromNode || !toNode) return null;

    const fromX = (fromNode.x / 100) * canvasWidth + 25; // Center of node
    const fromY = (fromNode.y / 100) * canvasHeight + 25;
    const toX = (toNode.x / 100) * canvasWidth + 25;
    const toY = (toNode.y / 100) * canvasHeight + 25;

    const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const angle = Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI);

    return (
      <View
        key={connection.id}
        style={[
          styles.connection,
          {
            left: fromX,
            top: fromY,
            width: length,
            height: 4,
            backgroundColor: connection.isConnected ? connection.color : extendedTheme.colors.borderLight,
            transform: [
              {
                rotate: `${angle}deg`,
              },
            ],
          },
        ]}
      />
    );
  };

  const renderSwitch = (switchState: SwitchState) => {
    const switchNode = schematic.find(n => n.id === switchState.id);
    if (!switchNode) return null;

    return (
      <TouchableOpacity
        key={switchState.id}
        style={[
          styles.switch,
          {
            left: (switchNode.x / 100) * canvasWidth + 15,
            top: (switchNode.y / 100) * canvasHeight + 15,
            backgroundColor: switchState.isOn ? extendedTheme.colors.success : extendedTheme.colors.error,
          },
        ]}
        onPress={() => handleSwitchPress(switchState.id)}
      >
        <Text style={styles.switchLabel}>{switchState.isOn ? 'ON' : 'OFF'}</Text>
      </TouchableOpacity>
    );
  };

  const handleNodePress = (node: CircuitNode) => {
    // Player A can see the schematic and provide guidance
    // This could trigger a communication message or highlight
    console.log('Node pressed:', node.id);
  };

  const handleSwitchPress = (switchId: string) => {
    // Player A can see switch states and provide guidance
    console.log('Switch pressed:', switchId);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'power_source':
        return extendedTheme.colors.warning;
      case 'switch':
        return extendedTheme.colors.primary;
      case 'output':
        return extendedTheme.colors.success;
      case 'junction':
        return extendedTheme.colors.secondary;
      default:
        return extendedTheme.colors.borderLight;
    }
  };

  const getNodeLabel = (type: string) => {
    switch (type) {
      case 'power_source':
        return 'PWR';
      case 'switch':
        return 'SW';
      case 'output':
        return 'OUT';
      case 'junction':
        return 'J';
      default:
        return '?';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Circuit Schematic</Text>
      <Text style={styles.subtitle}>Guide your partner to connect the wires</Text>
      
      {/* Debug info */}
      <Text style={styles.debugText}>
        Canvas: {canvasWidth}x{canvasHeight} | Nodes: {schematic.length} | Connections: {connections.length}
      </Text>
      
      <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
        {/* Render connections first (behind nodes) */}
        {connections.map(renderConnection)}
        
        {/* Render nodes */}
        {schematic.map(renderNode)}
        
        {/* Render switches */}
        {switches.map(renderSwitch)}
      </View>

      {/* Instructions for Player A */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>Your Role:</Text>
        <Text style={styles.instructionText}>
          • You can see the complete circuit schematic
        </Text>
        <Text style={styles.instructionText}>
          • Guide your partner to connect the correct wires
        </Text>
        <Text style={styles.instructionText}>
          • Tell them which switches to turn on/off
        </Text>
        <Text style={styles.instructionText}>
          • Use the communication panel to send instructions
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
  canvas: {
    backgroundColor: extendedTheme.colors.background,
    borderRadius: extendedTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: extendedTheme.colors.borderLight,
    position: 'relative',
    marginBottom: extendedTheme.spacing.lg,
    minHeight: 200,
  },
  node: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...extendedTheme.shadows.md,
    elevation: 3,
  },
  nodeLabel: {
    ...extendedTheme.typography.bodySmall,
    color: extendedTheme.colors.background,
    fontWeight: '600',
  },
  connection: {
    position: 'absolute',
    height: 6,
    borderRadius: 3,
    opacity: 0.8,
  },
  switch: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchLabel: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.background,
    fontWeight: '600',
    fontSize: 8,
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
  debugText: {
    ...extendedTheme.typography.caption,
    color: extendedTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: extendedTheme.spacing.sm,
    fontStyle: 'italic',
  },
});

export default CircuitSchematic;
