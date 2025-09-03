import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import {
  Canvas,
  Path,
  Skia,
  useCanvasRef,
  useTouchHandler,
} from '@shopify/react-native-skia';
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  View as RNView,
} from 'react-native';
import { extendedTheme } from '../../utils/theme';
import { DrawingStroke } from '../../types';

interface DrawingCanvasProps {
  strokes: DrawingStroke[];
  onStrokeAdd: (stroke: DrawingStroke) => void;
  isDrawingEnabled: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  selectedColor?: string;
  selectedWidth?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_CANVAS_WIDTH = screenWidth - (extendedTheme.spacing.lg * 2);
const DEFAULT_CANVAS_HEIGHT = 300;

const COLORS = [
  '#000000', // Black
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Purple
  '#FFA07A', // Orange
];

const BRUSH_SIZES = [2, 4, 6, 8, 12];

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  strokes,
  onStrokeAdd,
  isDrawingEnabled,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT,
  selectedColor = '#000000',
  selectedWidth = 4,
}) => {
  const canvasRef = useCanvasRef();
  const [currentPath, setCurrentPath] = useState<string>('');
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [activeColor, setActiveColor] = useState(selectedColor);
  const [activeBrushSize, setActiveBrushSize] = useState(selectedWidth);

  // Convert strokes to Skia paths
  const createPathFromStroke = useCallback((stroke: DrawingStroke): string => {
    if (stroke.points.length === 0) return '';
    
    let pathString = `M${stroke.points[0].x},${stroke.points[0].y}`;
    
    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      pathString += ` L${point.x},${point.y}`;
    }
    
    return pathString;
  }, []);

  // Touch handler for drawing
  const touchHandler = useTouchHandler({
    onStart: (touchInfo) => {
      if (!isDrawingEnabled) return;
      
      const { x, y } = touchInfo;
      const newStroke: DrawingStroke = {
        points: [{ x, y }],
        color: activeColor,
        width: activeBrushSize,
        timestamp: Date.now(),
      };
      
      setCurrentStroke(newStroke);
      setCurrentPath(`M${x},${y}`);
    },
    
    onActive: (touchInfo) => {
      if (!isDrawingEnabled || !currentStroke) return;
      
      const { x, y } = touchInfo;
      const updatedStroke = {
        ...currentStroke,
        points: [...currentStroke.points, { x, y }],
      };
      
      setCurrentStroke(updatedStroke);
      setCurrentPath(prev => `${prev} L${x},${y}`);
    },
    
    onEnd: () => {
      if (!isDrawingEnabled || !currentStroke) return;
      
      // Add the completed stroke
      onStrokeAdd(currentStroke);
      
      // Reset current drawing state
      setCurrentStroke(null);
      setCurrentPath('');
    },
  });

  // Clear canvas function
  const clearCanvas = useCallback(() => {
    if (!isDrawingEnabled) return;
    
    // This would typically send a clear command to other players
    // For now, we'll just reset local state
    setCurrentStroke(null);
    setCurrentPath('');
  }, [isDrawingEnabled]);

  return (
    <RNView style={styles.container}>
      {/* Drawing Tools */}
      {isDrawingEnabled && (
        <RNView style={styles.toolsContainer}>
          {/* Color Palette */}
          <RNView style={styles.colorPalette}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  activeColor === color && styles.activeColorButton,
                ]}
                onPress={() => setActiveColor(color)}
              />
            ))}
          </RNView>
          
          {/* Brush Sizes */}
          <RNView style={styles.brushSizes}>
            {BRUSH_SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.brushButton,
                  activeBrushSize === size && styles.activeBrushButton,
                ]}
                onPress={() => setActiveBrushSize(size)}
              >
                <RNView
                  style={[
                    styles.brushPreview,
                    {
                      width: size + 4,
                      height: size + 4,
                      borderRadius: (size + 4) / 2,
                      backgroundColor: activeColor,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </RNView>
          
          {/* Clear Button */}
          <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </RNView>
      )}

      {/* Canvas */}
      <RNView style={[styles.canvasContainer, { width: canvasWidth, height: canvasHeight }]}>
        <Canvas
          ref={canvasRef}
          style={{ width: canvasWidth, height: canvasHeight }}
          onTouch={touchHandler}
        >
          {/* Render existing strokes */}
          {strokes.map((stroke, index) => {
            const pathString = createPathFromStroke(stroke);
            if (!pathString) return null;
            
            const path = Skia.Path.MakeFromSVGString(pathString);
            if (!path) return null;
            
            return (
              <Path
                key={`stroke-${index}-${stroke.timestamp}`}
                path={path}
                color={stroke.color}
                style="stroke"
                strokeWidth={stroke.width}
                strokeCap="round"
                strokeJoin="round"
              />
            );
          })}
          
          {/* Render current stroke being drawn */}
          {currentPath && currentStroke && (
            <Path
              path={Skia.Path.MakeFromSVGString(currentPath)!}
              color={currentStroke.color}
              style="stroke"
              strokeWidth={currentStroke.width}
              strokeCap="round"
              strokeJoin="round"
            />
          )}
        </Canvas>
        
        {/* Overlay for disabled state */}
        {!isDrawingEnabled && (
          <RNView style={styles.disabledOverlay}>
            <Text style={styles.disabledText}>
              {strokes.length === 0 ? 'Waiting for drawing...' : 'Watch and guess!'}
            </Text>
          </RNView>
        )}
      </RNView>
    </RNView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  toolsContainer: {
    backgroundColor: extendedTheme.colors.surface,
    borderRadius: extendedTheme.borderRadius.lg,
    padding: extendedTheme.spacing.sm,
    marginBottom: extendedTheme.spacing.md,
    ...extendedTheme.shadows.sm,
  },
  colorPalette: {
    flexDirection: 'row',
    marginBottom: extendedTheme.spacing.sm,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: extendedTheme.spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColorButton: {
    borderColor: extendedTheme.colors.primary,
    borderWidth: 3,
  },
  brushSizes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: extendedTheme.spacing.sm,
  },
  brushButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: extendedTheme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: extendedTheme.spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeBrushButton: {
    borderColor: extendedTheme.colors.primary,
  },
  brushPreview: {
    backgroundColor: extendedTheme.colors.text,
  },
  clearButton: {
    backgroundColor: extendedTheme.colors.error,
    paddingHorizontal: extendedTheme.spacing.md,
    paddingVertical: extendedTheme.spacing.sm,
    borderRadius: extendedTheme.borderRadius.md,
    alignSelf: 'center',
  },
  clearButtonText: {
    ...extendedTheme.typography.button,
    color: extendedTheme.colors.background,
    fontSize: 14,
  },
  canvasContainer: {
    backgroundColor: extendedTheme.colors.background,
    borderRadius: extendedTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: extendedTheme.colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: extendedTheme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledText: {
    ...extendedTheme.typography.body,
    color: extendedTheme.colors.background,
    textAlign: 'center',
  },
});

export default DrawingCanvas;
