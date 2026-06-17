import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, FontFamily } from '../constants/theme';

interface Props {
  label: string;
  /** Prefixo do comando: 'c' para SERVO 1, 'x' para SERVO 2 */
  prefix: string;
  color: string;
  onCommand: (cmd: string) => void;
}

export default function ServoSlider({ label, prefix, color, onCommand }: Props) {
  const [value, setValue] = useState(90);

  const handleChange = (v: number) => {
    const rounded = Math.round(v / 5) * 5; // step 5
    setValue(rounded);
  };

  const handleComplete = (v: number) => {
    const rounded = Math.round(v / 5) * 5;
    setValue(rounded);
    onCommand(`${prefix}${rounded}`);
  };

  const pct = (value / 180) * 100;

  return (
    <View style={[styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <View style={[styles.colorDot, { backgroundColor: color }]} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{value}°</Text>
        </View>
      </View>

      {/* Track visual custom */}
      <View style={styles.trackWrapper}>
        <View style={styles.trackBg}>
          <View style={[styles.trackFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>

        {/* Slider real por cima do track visual */}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={180}
          step={5}
          value={value}
          onValueChange={handleChange}
          onSlidingComplete={handleComplete}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={color}
        />
      </View>

      {/* Labels de referência */}
      <View style={styles.refRow}>
        <Text style={styles.refLabel}>0°</Text>
        <Text style={styles.refLabel}>90°</Text>
        <Text style={styles.refLabel}>180°</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: Colors.dark,
    padding: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  label: {
    fontFamily: FontFamily.title,
    fontSize: 12,
    color: Colors.dark,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  badgeText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 12,
    color: Colors.dark,
  },
  trackWrapper: {
    height: 28,
    justifyContent: 'center',
  },
  trackBg: {
    height: 10,
    backgroundColor: '#e0d8c8',
    borderWidth: 2,
    borderColor: Colors.dark,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
  },
  slider: {
    position: 'absolute',
    left: -10,
    right: -10,
    top: 0,
    bottom: 0,
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  refLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: '#999',
  },
});
