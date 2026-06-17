import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Bell } from 'lucide-react-native';
import { Colors, Shadow } from '../constants/theme';

interface Props {
  onCommand: (cmd: string) => void;
  onStop: () => void;
}

type Direction = 'up' | 'down' | 'left' | 'right' | 'center';

interface DPadButtonProps {
  dir: Direction;
  command: string;
  icon: React.ReactNode;
  color?: string;
  onStart: (cmd: string) => void;
  onEnd: () => void;
}

function DPadButton({
  dir,
  command,
  icon,
  color = Colors.dark,
  onStart,
  onEnd,
}: DPadButtonProps) {
  const [active, setActive] = useState(false);

  const handlePressIn = () => {
    setActive(true);
    onStart(command);
  };

  const handlePressOut = () => {
    setActive(false);
    onEnd();
  };

  const isCenter = dir === 'center';

  const borderRadius = {
    up: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
    down: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    left: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
    right: { borderTopRightRadius: 12, borderBottomRightRadius: 12 },
    center: { borderRadius: 999 },
  }[dir];

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[
        styles.dpadBtn,
        borderRadius,
        {
          backgroundColor: active ? '#FFE500' : color,
          width: isCenter ? 64 : 72,
          height: isCenter ? 64 : 72,
          transform: [{ translateX: active ? 2 : 0 }, { translateY: active ? 2 : 0 }],
        },
        active ? styles.dpadBtnActive : styles.dpadBtnIdle,
      ]}
    >
      <View style={{ opacity: 1 }}>
        {React.cloneElement(icon as React.ReactElement<any>, {
          color: active ? Colors.dark : '#fff',
        })}
      </View>
    </TouchableOpacity>
  );
}

export default function ControlPad({ onCommand, onStop }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const handleStart = (cmd: string) => {
    setActive(cmd);
    onCommand(cmd);
  };

  const handleEnd = () => {
    if (active && active !== 'horn') {
      onStop();
    }
    setActive(null);
  };

  return (
    <View style={styles.container}>
      {/* Up */}
      <DPadButton
        dir="up"
        command="up"
        icon={<ArrowUp size={28} strokeWidth={3} color="#fff" />}
        onStart={handleStart}
        onEnd={handleEnd}
      />

      {/* Middle row */}
      <View style={styles.middleRow}>
        <DPadButton
          dir="left"
          command="left"
          icon={<ArrowLeft size={28} strokeWidth={3} color="#fff" />}
          onStart={handleStart}
          onEnd={handleEnd}
        />

        {/* Center — Horn */}
        <DPadButton
          dir="center"
          command="horn"
          color="#FF6B00"
          icon={<Bell size={24} strokeWidth={2.5} color="#fff" />}
          onStart={handleStart}
          onEnd={() => setActive(null)}
        />

        <DPadButton
          dir="right"
          command="right"
          icon={<ArrowRight size={28} strokeWidth={3} color="#fff" />}
          onStart={handleStart}
          onEnd={handleEnd}
        />
      </View>

      {/* Down */}
      <DPadButton
        dir="down"
        command="down"
        icon={<ArrowDown size={28} strokeWidth={3} color="#fff" />}
        onStart={handleStart}
        onEnd={handleEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dpadBtn: {
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadBtnIdle: {
    shadowColor: Colors.dark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  dpadBtnActive: {
    shadowColor: Colors.dark,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
});
