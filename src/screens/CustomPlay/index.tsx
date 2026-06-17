import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { ArrowLeft, Edit3, Activity, StopCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ControlButton, ControlProfile } from '../../types/control.types';
import { CommandStorage } from '../../services/storage';
import { useBluetooth } from '../../context/BluetoothContext';
import DraggableButton from '../../components/DraggableButton';
import BluetoothStatusButton from '../../components/BluetoothButton';
import { Colors, FontFamily, Shadow } from '../../constants/theme';

export default function CustomPlay() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { sendCommand, status } = useBluetooth();
  const isConnected = status === 'connected';

  const [profile, setProfile] = useState<ControlProfile | null>(null);
  const [buttons, setButtons] = useState<ControlButton[]>([]);
  const [activeCmd, setActiveCmd] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 400 });

  useEffect(() => {
    (async () => {
      const p = await CommandStorage.getActiveProfile();
      setProfile(p);
      setButtons(p.buttons);

      // Travar orientação conforme configurado no perfil
      if (p.orientation === 'landscape') {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE,
        );
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        );
      }
    })();

    return () => {
      // Restaura orientação ao sair
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const handlePress = useCallback(
    (button: ControlButton) => {
      setActiveCmd(button.command);
      setActiveId(button.id);
      sendCommand(button.command);
    },
    [sendCommand],
  );

  const handleRelease = useCallback(() => {
    sendCommand('stop');
    setActiveCmd('stop');
    setActiveId(null);
    setTimeout(() => setActiveCmd(''), 300);
  }, [sendCommand]);

  const getCmdBg = () => {
    if (!activeCmd) return '#2A2A2A';
    if (activeCmd === 'stop') return '#7B2FFF';
    const activeBtn = buttons.find((b) => b.command === activeCmd);
    return activeBtn?.color ?? '#00C851';
  };

  const onCanvasLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, Shadow.neoSmall]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color={Colors.dark} strokeWidth={3} />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {profile?.name?.toUpperCase() ?? 'CONTROLE'}
          </Text>
          <Text style={styles.headerSub}>MODO JOGO</Text>
        </View>

        <TouchableOpacity
          style={[styles.editBtn, Shadow.neoSmall]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Edit3 size={16} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>

        <BluetoothStatusButton />
      </View>

      {/* ── TX bar ─────────────────────────────────────────────────── */}
      <View style={[styles.txBar, { backgroundColor: getCmdBg() }]}>
        <Activity
          size={14}
          color={activeCmd ? Colors.dark : '#555'}
          strokeWidth={2.5}
        />
        <Text
          style={[
            styles.txText,
            { color: activeCmd ? Colors.dark : '#555' },
          ]}
        >
          {activeCmd ? `TX → "${activeCmd}"` : '— AGUARDANDO —'}
        </Text>
        <View style={[styles.bleTag, { backgroundColor: isConnected ? '#00C851' : '#FF2D2D' }]}>
          <Text style={styles.bleTagText}>{isConnected ? 'BLE ON' : 'SIM'}</Text>
        </View>
      </View>

      {/* ── Canvas play ────────────────────────────────────────────── */}
      <View style={styles.canvas} onLayout={onCanvasLayout}>
        {buttons.map((btn) => (
          <DraggableButton
            key={btn.id}
            button={btn}
            editMode={false}
            focused={activeId === btn.id}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            onPress={() => handlePress(btn)}
            onRelease={handleRelease}
          />
        ))}

        {buttons.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, Shadow.neoSmall]}>
              <Edit3 size={24} color="#555" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum botão configurado</Text>
            <Text style={styles.emptySub}>Volte ao editor para adicionar botões</Text>
          </View>
        )}
      </View>

      {/* ── STOP ───────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.stopBtn}
        onPressIn={() => {
          sendCommand('stop');
          setActiveCmd('stop');
        }}
        onPressOut={() => setTimeout(() => setActiveCmd(''), 300)}
        activeOpacity={0.9}
      >
        <StopCircle size={18} color="#fff" strokeWidth={2.5} />
        <Text style={styles.stopText}>STOP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.dark,
    borderBottomWidth: 3,
    borderBottomColor: '#FFE500',
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#FFE500',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontFamily: FontFamily.title,
    fontSize: 15,
    color: '#fff',
    lineHeight: 18,
  },
  headerSub: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: '#FFE500',
  },
  editBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#7B2FFF',
    borderWidth: 3,
    borderColor: '#FFE500',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  txBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 3,
    borderBottomColor: Colors.dark,
  },
  txText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 11,
    flex: 1,
  },
  bleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  bleTagText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 9,
    color: '#fff',
  },
  canvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  emptyState: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#222',
    borderWidth: 3,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: FontFamily.title,
    fontSize: 14,
    color: '#666',
  },
  emptySub: {
    fontFamily: FontFamily.mono,
    fontSize: 11,
    color: '#555',
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#FF2D2D',
    borderTopWidth: 3,
    borderTopColor: '#FF2D2D',
  },
  stopText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 14,
    color: '#fff',
  },
});
