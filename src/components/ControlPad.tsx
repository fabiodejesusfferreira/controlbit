// components/ControlPad/index.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Star,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/theme';
import DottedBackground from './DottedBackground';

import { BasicCommands } from '../services/basicCommandStorage';

interface Props {
  commands: BasicCommands;
  onCommand: (cmd: string) => void;
  onStop: () => void;
  buttonSize?: number;
}

type Direction = 'up' | 'down' | 'left' | 'right' | 'center';

interface DPadButtonProps {
  dir: Direction;
  command: string;
  icon: React.ReactNode;
  bgColor?: string;
  activeBgColor?: string;
  shadowOffset?: number;
  onStart: (cmd: string) => void;
  onEnd: () => void;
  size?: number;
}

const BORDER_RADIUS: Record<Direction, object> = {
  up: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  down: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  left: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  right: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  center: {
    borderRadius: 20,
  },
};

function DPadButton({
  dir,
  command,
  icon,
  bgColor = '#FFD82D',
  activeBgColor = '#FFC000',
  shadowOffset = 4,
  onStart,
  onEnd,
  size = 102,
}: DPadButtonProps) {
  const pressed = useSharedValue(0);
  const [isActive, setIsActive] = useState(false);

  // Mesmo sistema do NeoButton: translate X/Y ao pressionar
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(pressed.value * shadowOffset, { duration: 80 }) },
      { translateY: withTiming(pressed.value * shadowOffset, { duration: 80 }) },
    ],
  }));

  // Overlay escuro ao pressionar (igual ao NeoButton)
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(pressed.value * 0.15, { duration: 80 }),
  }));

  const handlePressIn = () => {
    pressed.value = 1;
    setIsActive(true);
    onStart(command);
  };

  const handlePressOut = () => {
    pressed.value = 0;
    setIsActive(false);
    onEnd();
  };

  const radiusStyle = BORDER_RADIUS[dir];
  const SIZE = size;

  return (
    // Container relativo — igual ao NeoButton
    <View style={{ position: 'relative', width: SIZE, height: SIZE }}>

      {/* Sombra sólida preta de fundo — igual ao NeoButton */}
      <View
        style={[
          {
            position: 'absolute',
            top: shadowOffset,
            left: shadowOffset,
            right: -shadowOffset,
            bottom: -shadowOffset,
            backgroundColor: Colors.dark,
          },
          radiusStyle,
        ]}
      />

      {/* Botão animado */}
      <Animated.View style={[animatedStyle, { width: SIZE, height: SIZE }]}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={[
            {
              width: SIZE,
              height: SIZE,
              backgroundColor: isActive ? activeBgColor : bgColor,
              borderWidth: 3,
              borderColor: Colors.dark,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            },
            radiusStyle,
          ]}
        >
          {/* Ícone */}
          {React.cloneElement(icon as React.ReactElement<any>, {
            color: Colors.dark,
            strokeWidth: 2,
          })}

          {/* Overlay de escurecimento — igual ao NeoButton */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#000' },
              overlayStyle,
            ]}
          />
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

export default function ControlPad({ commands, onCommand, onStop, buttonSize = 102 }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const handleStart = (cmd: string) => {
    setActive(cmd);
    onCommand(cmd);
  };

  const handleEnd = () => {
    if (active && active !== commands.horn) {
      onStop();
    }
    setActive(null);
  };

  const iconSize = buttonSize * (44 / 102);

  return (
    <DottedBackground style={{ width: "100%", paddingVertical: 12 }}>
      <View style={{ alignItems: 'center', gap: 8 }}>

        {/* Up */}
        <DPadButton
          dir="up"
          size={buttonSize}
          command={commands.up}
          icon={<ArrowUp size={iconSize} />}
          onStart={handleStart}
          onEnd={handleEnd}
        />

        {/* Middle row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>

          {/* Left */}
          <DPadButton
            dir="left"
            size={buttonSize}
            command={commands.left}
            icon={<ArrowLeft size={iconSize} />}
            onStart={handleStart}
            onEnd={handleEnd}
          />

          {/* Center — Horn */}
          <DPadButton
            dir="center"
            size={buttonSize}
            command={commands.horn}
            bgColor="#E81C1C"
            activeBgColor="#C01010"
            icon={<Star size={iconSize} fill="#fff" color="#fff" strokeWidth={2} />}
            onStart={handleStart}
            onEnd={() => setActive(null)}
          />

          {/* Right */}
          <DPadButton
            dir="right"
            size={buttonSize}
            command={commands.right}
            icon={<ArrowRight size={iconSize} />}
            onStart={handleStart}
            onEnd={handleEnd}
          />

        </View>

        {/* Down */}
        <DPadButton
          dir="down"
          size={buttonSize}
          command={commands.down}
          icon={<ArrowDown size={iconSize} />}
          onStart={handleStart}
          onEnd={handleEnd}
        />

      </View>
    </DottedBackground>
  );
}