// BasicControl/index.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  StopCircle,
  Activity,
  Terminal,
  Star,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useBluetooth } from '../../context/BluetoothContext';
import ControlPad from '../../components/ControlPad';
import ServoSlider from '../../components/ServoSlider';
import BluetoothStatusButton from '../../components/BluetoothButton';
import DottedBackground from '../../components/DottedBackground';

const CMD_COLOR_MAP: Record<string, string> = {
  up: '#00C851',
  down: '#FF2D2D',
  left: '#0066FF',
  right: '#0066FF',
  horn: '#FF6B00',
  stop: '#7B2FFF',
};

function getCmdColor(cmd: string): string {
  if (cmd.startsWith('c')) return '#FF3CAC';
  if (cmd.startsWith('x')) return '#00D9F5';
  return CMD_COLOR_MAP[cmd] || '#FFE500';
}

export default function BasicControl() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isConnected, sendCommand } = useBluetooth();
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [activeCmd, setActiveCmd] = useState('');

  const handleCommand = useCallback(
    (cmd: string) => {
      setActiveCmd(cmd);
      sendCommand(cmd);
      setCommandLog(prev => [
        `[${new Date().toLocaleTimeString()}] TX: "${cmd}"`,
        ...prev.slice(0, 49),
      ]);
    },
    [sendCommand],
  );

  const handleStop = () => {
    setActiveCmd('stop');
    sendCommand('stop');
    setCommandLog(prev => [
      `[${new Date().toLocaleTimeString()}] TX: "stop"`,
      ...prev.slice(0, 49),
    ]);
    setTimeout(() => setActiveCmd(''), 200);
  };

  const txBgColor = activeCmd ? getCmdColor(activeCmd) : '#E5E0D5';

  return (
    <View className="flex-1 bg-[#F5F0E8]" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor="#1C37B5" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View
        className="flex-row items-center px-4 py-4 bg-[#1C37B5] border-b-4 border-[#1A1A1A]"
        style={{ gap: 10 }}
      >
        {/* Back button */}
        <TouchableOpacity
          className="w-10 h-10 bg-[#FFD82D] border-[3px] border-[#1A1A1A] items-center justify-center"
          style={{
            shadowColor: '#1A1A1A',
            shadowOffset: { width: 3, height: 3 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 6,
          }}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color="#1A1A1A" strokeWidth={3} />
        </TouchableOpacity>

        {/* Titles */}
        <View className="flex-1">
          <Text className="font-[SpaceGrotesk-Bold] text-white text-sm leading-5 tracking-widest">
            COMO CONFIGURAR O MICRO:BIT
          </Text>
          <Text className="font-[SpaceMono-Regular] text-[#BFC8E8] text-[10px] tracking-wider">
            D-PAD + SERVOS
          </Text>
        </View>

        {/* Bluetooth button */}
        <BluetoothStatusButton />
      </View>

      {/* ── TX Indicator ───────────────────────────────────────────── */}
      <View
        className="flex-row items-center px-4 py-2 border-b-2 border-[#1A1A1A]"
        style={{ backgroundColor: txBgColor, gap: 8 }}
      >
        <Activity
          size={14}
          color={activeCmd ? '#1A1A1A' : '#888'}
          strokeWidth={2.5}
        />
        <Text
          className="font-[SpaceMono-Bold] text-[11px] flex-1"
          style={{ color: activeCmd ? '#1A1A1A' : '#888' }}
        >
          {activeCmd ? activeCmd.toUpperCase() : 'UP'}
        </Text>
        {!isConnected && (
          <Text className="font-[SpaceMono-Bold] text-[9px] text-red-400">
            SIMULANDO
          </Text>
        )}
      </View>

      {/* ── Main Scroll ────────────────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Seção DIREÇÃO ─────────────────────────────────────── */}
        <View
          className="bg-white border-[3px] border-[#1A1A1A]"
          style={{
            shadowColor: '#1A1A1A',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 8,
          }}
        >
          {/* Section header */}
          <View className="flex-row items-center justify-between px-4 py-2 bg-[#1C37B5] border-b-[3px] border-[#1A1A1A]">
            <Text className="font-[SpaceMono-Bold] text-white text-[12px] tracking-widest">
              DIREÇÃO
            </Text>
            {/* Direction indicators */}
            <View className="flex-row" style={{ gap: 4 }}>
              {['up', 'down', 'left', 'right'].map(d => (
                <View
                  key={d}
                  className="w-[10px] h-[10px] border border-[#1A1A1A]"
                  style={{
                    backgroundColor: activeCmd === d ? '#FFD82D' : '#4A6ACC',
                  }}
                />
              ))}
            </View>
          </View>

            {/* D-Pad area */}
            <View
              className="items-center justify-center bg-[#F5F0E8]"
              style={{
                // Dotted background pattern via borderStyle workaround
                backgroundColor: '#F0EBE0',
              }}
            >
              <ControlPad onCommand={handleCommand} onStop={handleStop} />
            </View>
        </View>

        {/* ── Botão PARAR ──────────────────────────────────────────── */}
        <TouchableOpacity
          className="flex-row items-center justify-center py-4 bg-[#E81C1C] border-[3px] border-[#1A1A1A]"
          style={{
            gap: 10,
            shadowColor: '#1A1A1A',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 8,
          }}
          onPressIn={() => handleCommand('stop')}
          activeOpacity={0.85}
        >
          <StopCircle size={22} color="#fff" strokeWidth={2.5} />
          <Text className="font-[SpaceGrotesk-Bold] text-white text-base tracking-widest">
            PARAR
          </Text>
        </TouchableOpacity>

        {/* ── Seção SERVOS ─────────────────────────────────────────── */}
        <View
          className="bg-white border-[3px] border-[#1A1A1A]"
          style={{
            shadowColor: '#1A1A1A',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 8,
          }}
        >
          {/* Section header */}
          <View className="flex-row items-center justify-between px-4 py-2 bg-[#1C37B5] border-b-[3px] border-[#1A1A1A]">
            <Text className="font-[SpaceMono-Bold] text-white text-[12px] tracking-widest">
              SERVOS
            </Text>
            <Text className="font-[SpaceMono-Regular] text-[#BFC8E8] text-[9px]">
              0° → 180°
            </Text>
          </View>

          {/* Servo sliders */}
          <View className="p-4" style={{ gap: 16 }}>
            <ServoSlider
              label="SERVO 1"
              prefix="c"
              color="#E81C1C"
              onCommand={handleCommand}
            />
            <ServoSlider
              label="SERVO 2"
              prefix="x"
              color="#FFD82D"
              onCommand={handleCommand}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}