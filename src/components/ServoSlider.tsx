// components/ServoSlider/index.tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

interface Props {
  label: string;
  prefix: string;
  color: string;
  onCommand: (cmd: string) => void;
}

export default function ServoSlider({ label, prefix, color, onCommand }: Props) {
  const [value, setValue] = useState(90);

  const handleChange = (v: number) => {
    const rounded = Math.round(v / 5) * 5;
    setValue(rounded);
  };

  const handleComplete = (v: number) => {
    const rounded = Math.round(v / 5) * 5;
    setValue(rounded);
    onCommand(`${prefix}${rounded}`);
  };

  const pct = (value / 180) * 100;

  return (
    <View style={{ gap: 6 }}>
      {/* Header row */}
      <View className="flex-row items-center justify-between">
        <Text className="font-[SpaceGrotesk-Bold] text-[#1A1A1A] text-sm tracking-wider">
          {label}
        </Text>
        <View
          className="px-3 py-1 border-[2px] border-[#1A1A1A]"
          style={{ backgroundColor: color }}
        >
          <Text className="font-[SpaceMono-Bold] text-[#1A1A1A] text-[12px]">
            {value}°
          </Text>
        </View>
      </View>

      {/* Track */}
      <View style={{ height: 32, justifyContent: 'center' }}>
        <View
          className="border-[2px] border-[#1A1A1A] overflow-hidden"
          style={{ height: 12, backgroundColor: '#E0D8C8' }}
        >
          <View
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: color,
            }}
          />
        </View>
        <Slider
          style={{ position: 'absolute', left: -10, right: -10, top: 0, bottom: 0 }}
          minimumValue={0}
          maximumValue={180}
          step={5}
          value={value}
          onValueChange={handleChange}
          onSlidingComplete={handleComplete}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={color}
          thumbSize={24}
        />
      </View>

      {/* Reference labels */}
      <View className="flex-row justify-between">
        <Text className="font-[SpaceMono-Regular] text-[9px] text-[#999]">0°</Text>
        <Text className="font-[SpaceMono-Regular] text-[9px] text-[#999]">90°</Text>
        <Text className="font-[SpaceMono-Regular] text-[9px] text-[#999]">180°</Text>
      </View>
    </View>
  );
}