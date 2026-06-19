// BasicControl/index.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  StopCircle,
  Activity,
  Terminal,
  Star,
  Settings,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useBluetooth } from '../../context/BluetoothContext';
import { useLanguage } from '../../context/LanguageContext';
import ControlPad from '../../components/ControlPad';
import ServoSlider from '../../components/ServoSlider';
import BluetoothStatusButton from '../../components/BluetoothButton';
import { BasicCommandStorage, BasicCommands, DEFAULT_BASIC_COMMANDS } from '../../services/basicCommandStorage';
import BasicCommandSettingsModal from '../../components/BasicCommandSettingsModal';
import { useScreenOrientation } from '../../hooks/useScreenOrientation';
import MobileRotateIcon from '../../components/icons/MobileRotateIcon';

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
  const { t } = useLanguage();
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [activeCmd, setActiveCmd] = useState('');
  const [commands, setCommands] = useState<BasicCommands>(DEFAULT_BASIC_COMMANDS);
  const [showSettings, setShowSettings] = useState(false);
  const { orientation, toggle, isLandscape } = useScreenOrientation('portrait');

  // Ocultar tabs no landscape
  useEffect(() => {
    if (isLandscape) {
      navigation.setOptions({ tabBarStyle: { display: 'none' } } as any);
    } else {
      navigation.setOptions({
        tabBarStyle: {
          borderTopWidth: 3,
          borderTopColor: '#1A1A1A',
          backgroundColor: '#F5F0E8',
          display: 'flex',
        },
      } as any);
    }
  }, [isLandscape, navigation]);

  // ── Ocultar navigation bar do Android (botões sistema) no landscape ──────────
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const NavBar = require('expo-navigation-bar');
        if (isLandscape) {
          await NavBar.setVisibilityAsync('hidden');
          await NavBar.setBehaviorAsync('overlay-swipe');
          cleanup = async () => { await NavBar.setVisibilityAsync('visible'); };
        } else {
          await NavBar.setVisibilityAsync('visible');
        }
      } catch (_) {
        // expo-navigation-bar não instalado — silencioso
      }
    })();
    return () => { cleanup?.(); };
  }, [isLandscape]);

  useEffect(() => {
    const loadCmds = async () => {
      const stored = await BasicCommandStorage.getCommands();
      setCommands(stored);
    };
    loadCmds();
  }, []);

  const handleSaveCommands = async (newCmds: BasicCommands) => {
    await BasicCommandStorage.saveCommands(newCmds);
    setCommands(newCmds);
  };

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
    setActiveCmd(commands.stop);
    sendCommand(commands.stop);
    setCommandLog(prev => [
      `[${new Date().toLocaleTimeString()}] TX: "${commands.stop}"`,
      ...prev.slice(0, 49),
    ]);
    setTimeout(() => setActiveCmd(''), 200);
  };

  const txBgColor = activeCmd ? getCmdColor(activeCmd) : '#E5E0D5';

  return (
    <View className="flex-1 bg-[#F5F0E8]">
      <StatusBar barStyle="light-content" backgroundColor="#1C37B5" hidden={isLandscape} />

      {/* ── Header ─────────────────────────────────────────────────── */}
      {!isLandscape && (
        <View
          className="flex-row items-center px-4 py-4 mt-11 bg-[#1C37B5] border-b-4 border-[#1A1A1A]"
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
              {t('basic_header_title')}
            </Text>
            <Text className="font-[SpaceMono-Regular] text-[#BFC8E8] text-[10px] tracking-wider">
              {t('basic_header_sub')}
            </Text>
          </View>

          {/* Settings button */}
          <TouchableOpacity
            className="w-10 h-10 bg-white border-[3px] border-[#1A1A1A] items-center justify-center"
            style={{
              shadowColor: '#1A1A1A',
              shadowOffset: { width: 3, height: 3 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 6,
            }}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.8}
          >
            <Settings size={18} color="#1A1A1A" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Bluetooth button */}
          <BluetoothStatusButton />
        </View>
      )}

      {/* ── TX Indicator ───────────────────────────────────────────── */}
      {!isLandscape && (
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
              {t('basic_simulating')}
            </Text>
          )}
        </View>
      )}

      {/* ── Main Content ────────────────────────────────────────────── */}
      {isLandscape ? (
        <View className="flex-1 flex-row p-4 pl-[72px]" style={{ gap: 16 }}>
          {/* Esquerda: Direção */}
          <View
            className="flex-1 bg-white border-[3px] border-[#1A1A1A]"
            style={{
              shadowColor: '#1A1A1A',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-between px-4 py-2 bg-[#1C37B5] border-b-[3px] border-[#1A1A1A]">
              <Text className="font-[SpaceMono-Bold] text-white text-[12px] tracking-widest">
                {t('basic_direction')}
              </Text>
              <View className="flex-row" style={{ gap: 4 }}>
                {[commands.up, commands.down, commands.left, commands.right].map((cmd, idx) => (
                  <View
                    key={idx}
                    className="w-[10px] h-[10px] border border-[#1A1A1A]"
                    style={{ backgroundColor: activeCmd === cmd ? '#FFD82D' : '#4A6ACC' }}
                  />
                ))}
              </View>
            </View>
            <View className="flex-1 items-center justify-center bg-[#F0EBE0]">
              <ControlPad commands={commands} onCommand={handleCommand} onStop={handleStop} buttonSize={90} />
            </View>
          </View>

          {/* Direita: Servos + Parar */}
          <View className="flex-1" style={{ gap: 16 }}>
            <View
              className="flex-1 bg-white border-[3px] border-[#1A1A1A]"
              style={{
                shadowColor: '#1A1A1A',
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center justify-between px-4 py-2 bg-[#1C37B5] border-b-[3px] border-[#1A1A1A]">
                <Text className="font-[SpaceMono-Bold] text-white text-[12px] tracking-widest">
                  {t('basic_servos')}
                </Text>
                <Text className="font-[SpaceMono-Regular] text-[#BFC8E8] text-[9px]">
                  0° → 180°
                </Text>
              </View>
              <View className="p-4" style={{ gap: 16, flex: 1, justifyContent: 'center' }}>
                <ServoSlider label="SERVO 1" prefix="c" color="#E81C1C" onCommand={handleCommand} />
                <ServoSlider label="SERVO 2" prefix="x" color="#FFD82D" onCommand={handleCommand} />
              </View>
            </View>

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
              onPressIn={() => handleCommand(commands.stop)}
              activeOpacity={0.85}
            >
              <StopCircle size={22} color="#fff" strokeWidth={2.5} />
              <Text className="font-[SpaceGrotesk-Bold] text-white text-base tracking-widest">
                {t('basic_stop')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Seção DIREÇÃO */}
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
            <View className="flex-row items-center justify-between px-4 py-2 bg-[#1C37B5] border-b-[3px] border-[#1A1A1A]">
              <Text className="font-[SpaceMono-Bold] text-white text-[12px] tracking-widest">
                {t('basic_direction')}
              </Text>
              <View className="flex-row" style={{ gap: 4 }}>
                {[commands.up, commands.down, commands.left, commands.right].map((cmd, idx) => (
                  <View
                    key={idx}
                    className="w-[10px] h-[10px] border border-[#1A1A1A]"
                    style={{ backgroundColor: activeCmd === cmd ? '#FFD82D' : '#4A6ACC' }}
                  />
                ))}
              </View>
            </View>
            <View className="items-center justify-center bg-[#F0EBE0]">
              <ControlPad commands={commands} onCommand={handleCommand} onStop={handleStop} />
            </View>
          </View>

          {/* Botão PARAR */}
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
            onPressIn={() => handleCommand(commands.stop)}
            activeOpacity={0.85}
          >
            <StopCircle size={22} color="#fff" strokeWidth={2.5} />
            <Text className="font-[SpaceGrotesk-Bold] text-white text-base tracking-widest">
              {t('basic_stop')}
            </Text>
          </TouchableOpacity>

          {/* Seção SERVOS */}
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
            <View className="flex-row items-center justify-between px-4 py-2 bg-[#1C37B5] border-b-[3px] border-[#1A1A1A]">
              <Text className="font-[SpaceMono-Bold] text-white text-[12px] tracking-widest">
                {t('basic_servos')}
              </Text>
              <Text className="font-[SpaceMono-Regular] text-[#BFC8E8] text-[9px]">
                0° → 180°
              </Text>
            </View>
            <View className="p-4" style={{ gap: 16 }}>
              <ServoSlider label="SERVO 1" prefix="c" color="#E81C1C" onCommand={handleCommand} />
              <ServoSlider label="SERVO 2" prefix="x" color="#FFD82D" onCommand={handleCommand} />
            </View>
          </View>
        </ScrollView>
      )}

      {/* FABs no Landscape */}
      {isLandscape && (
        <View className="absolute" style={{ top: 16, left: insets.left + 12, zIndex: 100, gap: 10 }}>
          <TouchableOpacity
            onPress={toggle}
            className="w-12 h-12 border-[3px] border-[#1A1A1A] items-center justify-center bg-[#1C37B5]"
            style={{
              shadowColor: '#1A1A1A',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 8,
            }}
          >
            <MobileRotateIcon color="#fff" width={28} height={28} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-12 h-12 border-[3px] border-[#1A1A1A] items-center justify-center bg-[#FFD82D]"
            style={{
              shadowColor: '#1A1A1A',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 8,
            }}
          >
            <ArrowLeft size={20} color="#1A1A1A" strokeWidth={3} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            className="w-12 h-12 border-[3px] border-[#1A1A1A] items-center justify-center bg-white"
            style={{
              shadowColor: '#1A1A1A',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 8,
            }}
          >
            <Settings size={20} color="#1A1A1A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      )}

      {/* FAB em Portrait Mode */}
      {!isLandscape && (
        <View style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 100 }}>
          <TouchableOpacity
            onPress={toggle}
            className="w-[52px] h-[52px] rounded-full border-[3px] border-[#1A1A1A] items-center justify-center bg-[#1C37B5]"
            style={{
              shadowColor: '#1A1A1A',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 8,
            }}
          >
            <MobileRotateIcon color="#fff" width={28} height={28} />
          </TouchableOpacity>
        </View>
      )}

      {/* TX mini badge no landscape */}
      {isLandscape && activeCmd !== '' && (
        <View
          className="absolute border-2 border-[#FFD82D] bg-[#1A1A1A] px-3 py-1"
          style={{ bottom: 16, right: 16, zIndex: 100 }}
        >
          <Text className="font-[SpaceMono-Bold] text-[11px] text-[#FFD82D]">
            {activeCmd.toUpperCase()}
          </Text>
        </View>
      )}

      {/* Settings Modal */}
      <BasicCommandSettingsModal
        visible={showSettings}
        commands={commands}
        onSave={handleSaveCommands}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
}