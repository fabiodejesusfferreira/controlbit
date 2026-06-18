import React, { useRef, useCallback, memo } from 'react';
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

// Cores claras que precisam de texto escuro
const LIGHT_COLORS = new Set([
  '#FFD82D', '#FFE500', '#FFFFFF', '#F5F0E8', '#06B6D4', '#22C55E',
]);

function DraggableButton({
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
  const size   = button.size  ?? 80;
  const color  = button.color ?? '#FFD82D';
  const textColor = LIGHT_COLORS.has(color) ? Colors.dark : '#fff';

  // ─── Posição animada ──────────────────────────────────────────────────────
  const panX = useRef(new Animated.Value(button.x ?? 0)).current;
  const panY = useRef(new Animated.Value(button.y ?? 0)).current;

  // Posição confirmada (não dispara re-render)
  const posRef      = useRef({ x: button.x ?? 0, y: button.y ?? 0 });
  const dragStart   = useRef({ x: 0, y: 0 });
  const isDragging  = useRef(false);

  // Refs para callbacks — evita recriar PanResponder quando funções mudam
  const onMoveRef   = useRef(onMove);
  const onFocusRef  = useRef(onFocus);
  onMoveRef.current  = onMove;
  onFocusRef.current = onFocus;

  // Refs para limites do canvas — atualizadas a cada render sem recriar o PanResponder
  const canvasWidthRef  = useRef(canvasWidth);
  const canvasHeightRef = useRef(canvasHeight);
  canvasWidthRef.current  = canvasWidth;
  canvasHeightRef.current = canvasHeight;

  // Sync externo de posição (troca de perfil etc.)
  const prevIdRef = useRef(button.id);
  if (prevIdRef.current !== button.id) {
    prevIdRef.current = button.id;
    panX.setValue(button.x ?? 0);
    panY.setValue(button.y ?? 0);
    posRef.current = { x: button.x ?? 0, y: button.y ?? 0 };
  }

  // ─── PanResponder — criado UMA única vez por instância ───────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editMode,
      onMoveShouldSetPanResponder:  (_, gs) =>
        editMode && (Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3),

      onPanResponderGrant: () => {
        isDragging.current = false;
        dragStart.current  = { ...posRef.current };
      },

      onPanResponderMove: (_, gs) => {
        if (Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3) {
          isDragging.current = true;
        }
        const sz = size;
        // Usa refs para pegar os limites atuais do canvas (evita closure stale)
        const newX = Math.max(0, Math.min(
          dragStart.current.x + gs.dx, canvasWidthRef.current  - sz,
        ));
        const newY = Math.max(0, Math.min(
          dragStart.current.y + gs.dy, canvasHeightRef.current - sz,
        ));
        panX.setValue(newX);
        panY.setValue(newY);
      },

      onPanResponderRelease: (_, gs) => {
        const sz   = size;
        const newX = Math.max(0, Math.min(
          dragStart.current.x + gs.dx, canvasWidthRef.current  - sz,
        ));
        const newY = Math.max(0, Math.min(
          dragStart.current.y + gs.dy, canvasHeightRef.current - sz,
        ));
        posRef.current = { x: newX, y: newY };
        panX.setValue(newX);
        panY.setValue(newY);

        if (isDragging.current) {
          // Só chama onMove se realmente arrastou
          onMoveRef.current?.(button.id, newX, newY);
        } else {
          // Toque simples → foco / abre form
          onFocusRef.current?.(button.id);
        }
        isDragging.current = false;
      },

      onPanResponderTerminate: () => {
        panX.setValue(posRef.current.x);
        panY.setValue(posRef.current.y);
        isDragging.current = false;
      },
    }),
  ).current;

  // ─── Handlers modo play ───────────────────────────────────────────────────
  const pressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    if (editMode) return;
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 60,
      useNativeDriver: false, // backgroundColor não suporta native driver
    }).start();
    onPress?.();
  }, [editMode, onPress]);

  const handlePressOut = useCallback(() => {
    if (editMode) return;
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
    onRelease?.();
  }, [editMode, onRelease]);

  // Interpola cor de fundo no press (modo play)
  const animatedBg = pressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [color, '#FFD82D'],
  });

  // ─── Borda: no editMode sempre laranja tracejado, sem borda azul ──────────
  // focused agora só eleva zIndex, sem mudar a borda
  const borderColor = editMode ? '#FF6B00' : Colors.dark;
  const borderStyle = editMode ? 'dashed' : 'solid';

  return (
    <Animated.View
      {...(editMode ? panResponder.panHandlers : {})}
      style={[
        styles.btn,
        {
          left:   panX,
          top:    panY,
          width:  size,
          height: size,
          // No play: anima a cor. No edit: cor estática (melhor perf)
          backgroundColor: editMode ? color : animatedBg,
          borderColor,
          borderStyle,
          zIndex: focused ? 20 : 10,
          // Sombra fixa — não varia com focused
          shadowColor:  Colors.dark,
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 1,
          shadowRadius:  0,
          elevation: 6,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.inner}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={editMode ? 1 : 0.9}
        disabled={editMode}
      >
        <Icon
          name={button.icon}
          size={Math.round(size * 0.32)}
          color={textColor}
        />

        {button.label && size > 55 && (
          <Text
            style={[
              styles.label,
              {
                fontSize: Math.max(8, Math.round(size * 0.13)),
                color: textColor,
              },
            ]}
            numberOfLines={1}
          >
            {button.label}
          </Text>
        )}

        {/* Indicador de arrastar — apenas no edit */}
        {editMode && (
          <Text style={styles.dragHint}>✥</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// memo: só re-renderiza se props mudarem de fato
export default memo(DraggableButton, (prev, next) => {
  return (
    prev.button.id      === next.button.id      &&
    prev.button.x       === next.button.x       &&
    prev.button.y       === next.button.y       &&
    prev.button.size    === next.button.size    &&
    prev.button.color   === next.button.color   &&
    prev.button.icon    === next.button.icon    &&
    prev.button.label   === next.button.label   &&
    prev.button.command === next.button.command &&
    prev.focused        === next.focused        &&
    prev.editMode       === next.editMode       &&
    prev.canvasWidth    === next.canvasWidth    &&
    prev.canvasHeight   === next.canvasHeight
  );
});

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    borderWidth: 3,
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
    color: '#FF6B00',
    fontFamily: FontFamily.mono,
  },
});