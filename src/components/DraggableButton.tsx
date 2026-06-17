import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { ControlButton } from '../types/control.types';
import { Icon } from '../utils/iconMap';
import { Colors, FontFamily } from '../constants/theme';

interface Props {
  button: ControlButton;
  editMode: boolean;
  focused: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onMove?: (id: string, x: number, y: number) => void;
  onFocus?: (id: string) => void;
  onPress?: () => void;
  onRelease?: () => void;
}

export default function DraggableButton({
  button,
  editMode,
  focused,
  canvasWidth,
  canvasHeight,
  onMove,
  onFocus,
  onPress,
  onRelease,
}: Props) {
  const size = button.size ?? 80;
  const color = button.color ?? '#FFE500';

  // Posição animada — sem offset, apenas setValue absoluto
  const panX = useRef(new Animated.Value(button.x ?? 0)).current;
  const panY = useRef(new Animated.Value(button.y ?? 0)).current;

  // Posição "confirmada" (salva no onMove)
  const posRef = useRef({ x: button.x ?? 0, y: button.y ?? 0 });

  // Posição no início de cada gesto (capturada no onPanResponderGrant)
  const dragStart = useRef({ x: 0, y: 0 });

  // Sincroniza quando props mudam externamente
  React.useEffect(() => {
    panX.setValue(button.x ?? 0);
    panY.setValue(button.y ?? 0);
    posRef.current = { x: button.x ?? 0, y: button.y ?? 0 };
  }, [button.x, button.y]);

  const [isPressed, setIsPressed] = useState(false);

  // ─── PanResponder — SOMENTE setValue manual, sem Animated.event ─────────────
  // Causa do bug anterior: Animated.event + setOffset/setValue manual corriam
  // em sequência conflitante causando salto.

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editMode,
      onMoveShouldSetPanResponder: (_, gs) =>
        editMode && (Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4),

      onPanResponderGrant: () => {
        // Salva posição atual — gs.dx/dy neste handler é sempre 0
        dragStart.current = { ...posRef.current };
      },

      onPanResponderMove: (_, gs) => {
        // gs.dx/dy são CUMULATIVOS a partir do grant — soma com a posição inicial
        const newX = Math.max(0, Math.min(dragStart.current.x + gs.dx, canvasWidth - size));
        const newY = Math.max(0, Math.min(dragStart.current.y + gs.dy, canvasHeight - size));
        panX.setValue(newX);
        panY.setValue(newY);
      },

      onPanResponderRelease: (_, gs) => {
        const newX = Math.max(0, Math.min(dragStart.current.x + gs.dx, canvasWidth - size));
        const newY = Math.max(0, Math.min(dragStart.current.y + gs.dy, canvasHeight - size));

        posRef.current = { x: newX, y: newY };
        panX.setValue(newX);
        panY.setValue(newY);
        onMove?.(button.id, newX, newY);

        // Toque simples (sem arrastar) → seleciona
        if (Math.abs(gs.dx) < 5 && Math.abs(gs.dy) < 5) {
          onFocus?.(button.id);
        }
      },

      onPanResponderTerminate: () => {
        // Restaura posição se o gesto for cancelado
        panX.setValue(posRef.current.x);
        panY.setValue(posRef.current.y);
      },
    }),
  ).current;

  // ─── Modo play ───────────────────────────────────────────────────────────────

  const handlePressIn = () => {
    if (editMode) return;
    setIsPressed(true);
    onPress?.();
  };

  const handlePressOut = () => {
    if (editMode) return;
    setIsPressed(false);
    onRelease?.();
  };

  // ─── Visual ─────────────────────────────────────────────────────────────────

  const textColor = ['#FFE500', '#FFFFFF', '#F5F0E8', '#00D9F5', '#00C851'].includes(color)
    ? Colors.dark
    : '#fff';

  const borderColor = editMode
    ? focused ? '#0066FF' : '#FF6B00'
    : Colors.dark;

  const borderStyle = editMode && !focused ? 'dashed' : 'solid';

  return (
    <Animated.View
      {...(editMode ? panResponder.panHandlers : {})}
      style={[
        styles.btn,
        {
          left: panX,
          top: panY,
          width: size,
          height: size,
          backgroundColor: isPressed ? '#FFE500' : color,  
          borderColor,
          borderStyle,
          zIndex: focused ? 20 : 10,
          shadowOffset: { width: focused ? 3 : 2, height: focused ? 3 : 2 },
          shadowColor: focused ? '#0066FF' : Colors.dark,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.inner}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={editMode ? 1 : 0.85}
        disabled={editMode}
      >
        <Icon
          name={button.icon}
          size={Math.round(size * 0.32)}
          color={isPressed ? Colors.dark : textColor}
        />
        {button.label && size > 55 && (
          <Text
            style={[
              styles.label,
              {
                fontSize: Math.max(8, Math.round(size * 0.13)),
                color: isPressed ? Colors.dark : textColor,
              },
            ]}
            numberOfLines={1}
          >
            {button.label}
          </Text>
        )}

        {editMode && (
          <Text style={[styles.dragHint, { color: focused ? '#0066FF' : '#FF6B00' }]}>
            ✥
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    borderWidth: 3,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: 4,
  },
  label: {
    fontFamily: FontFamily.title,
    textAlign: 'center',
  },
  dragHint: {
    position: 'absolute',
    bottom: 3,
    right: 4,
    fontSize: 9,
    fontFamily: FontFamily.mono,
  },
});
