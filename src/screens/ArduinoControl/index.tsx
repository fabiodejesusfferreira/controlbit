/**
 * ArduinoControl/index.tsx
 *
 * Tela de controle dedicada para Arduino + HC-05 / HC-06.
 * Usa o ArduinoContext (Bluetooth Clássico / SPP) para enviar
 * comandos de direção e exibir os dados recebidos do Arduino.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  FlatList,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowLeftIcon,
  ArrowRight,
  StopCircle,
  Bluetooth,
  BluetoothSearching,
  BluetoothConnected,
  BluetoothOff,
  Terminal,
  X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useArduino } from '../../context/ArduinoContext';
import { ScannedDevice } from '../../types/control.types';

// ─── Cores por comando ────────────────────────────────────────────────────────

const CMD_COLOR: Record<string, string> = {
  F: '#00C851',
  B: '#FF2D2D',
  L: '#0066FF',
  R: '#0066FF',
  S: '#7B2FFF',
};

function getCmdColor(cmd: string) {
  return CMD_COLOR[cmd] ?? '#FFE500';
}

// ─── Sub-componente: Modal de dispositivos Arduino ───────────────────────────

function ArduinoDeviceModal({ onClose }: { onClose: () => void }) {
  const { status, scannedDevices, startScan, stopScan, connectToDevice } =
    useArduino();
  const isScanning = status === 'scanning';
  const isConnecting = status === 'connecting';

  const slideAnim = React.useRef(new Animated.Value(500)).current;
  const dot1 = React.useRef(new Animated.Value(0.3)).current;
  const dot2 = React.useRef(new Animated.Value(0.3)).current;
  const dot3 = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    startScan();
    return () => stopScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!isScanning) return;
    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ]),
      ).start();
    pulse(dot1, 0);
    pulse(dot2, 200);
    pulse(dot3, 400);
    return () => { dot1.stopAnimation(); dot2.stopAnimation(); dot3.stopAnimation(); };
  }, [isScanning, dot1, dot2, dot3]);

  const handleConnect = async (dev: ScannedDevice) => {
    await connectToDevice(dev);
    onClose();
  };

  const renderDevice = ({ item }: { item: ScannedDevice }) => (
    <TouchableOpacity
      style={modal.deviceRow}
      activeOpacity={0.85}
      onPress={() => handleConnect(item)}
    >
      <View style={modal.deviceIcon}>
        <BluetoothConnected size={18} color="#fff" strokeWidth={2.5} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={modal.deviceName} numberOfLines={1}>{item.name}</Text>
        <Text style={modal.deviceId} numberOfLines={1}>{item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <TouchableOpacity style={modal.backdrop} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[modal.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={modal.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={modal.headerIcon}>
                {isScanning
                  ? <BluetoothSearching size={20} color="#fff" strokeWidth={2.5} />
                  : <Bluetooth size={20} color="#fff" strokeWidth={2.5} />}
              </View>
              <View>
                <Text style={modal.headerTitle}>ARDUINO / HC-05</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  {isScanning ? (
                    <>
                      <Animated.View style={[modal.dot, { opacity: dot1 }]} />
                      <Animated.View style={[modal.dot, { opacity: dot2 }]} />
                      <Animated.View style={[modal.dot, { opacity: dot3 }]} />
                      <Text style={modal.scanLabel}>PROCURANDO...</Text>
                    </>
                  ) : (
                    <Text style={modal.countLabel}>{scannedDevices.length} encontrado(s)</Text>
                  )}
                </View>
              </View>
            </View>
            <TouchableOpacity style={modal.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <X size={18} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          <View style={modal.divider} />

          {/* Lista */}
          {isConnecting ? (
            <View style={modal.connecting}>
              <ActivityIndicator size="small" color="#1A1A1A" />
              <Text style={modal.connectingText}>CONECTANDO...</Text>
            </View>
          ) : scannedDevices.length === 0 ? (
            <View style={modal.empty}>
              <View style={modal.emptyIcon}>
                <BluetoothSearching size={28} color="#555" strokeWidth={2} />
              </View>
              <Text style={modal.emptyText}>
                {isScanning
                  ? 'Procurando dispositivos pareados e próximos...'
                  : 'Nenhum dispositivo encontrado.\nPareie o HC-05/HC-06 nas\nconfigurações do Android primeiro.'}
              </Text>
              {!isScanning && (
                <TouchableOpacity style={modal.rescanBtn} onPress={startScan}>
                  <Text style={modal.rescanText}>ESCANEAR NOVAMENTE</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={scannedDevices}
              keyExtractor={d => d.id}
              renderItem={renderDevice}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, gap: 8 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          <View style={{ height: 56, backgroundColor: '#F5F0E8' }} />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ArduinoControl() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { status, device, disconnect, isConnected, sendCommand, rxLog } = useArduino();

  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [activeCmd, setActiveCmd] = useState('');

  const handle = useCallback(
    (cmd: string) => {
      setActiveCmd(cmd);
      sendCommand(cmd);
      setTimeout(() => setActiveCmd(''), 250);
    },
    [sendCommand],
  );

  // ── Botão BT do header ──

  const getBtBg = () => {
    if (status === 'connected') return '#00C851';
    if (status === 'scanning' || status === 'connecting') return '#FFE500';
    return '#FF2D2D';
  };

  const getBtLabel = () => {
    if (status === 'connected') return device?.name?.slice(0, 8) ?? 'BT';
    if (status === 'scanning') return 'SCAN';
    if (status === 'connecting') return '...';
    return 'HC-05';
  };

  const handleBtPress = () => {
    if (status === 'connected') { disconnect(); return; }
    if (status === 'scanning' || status === 'connecting') return;
    setShowDeviceModal(true);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1A6B32" />

      {/* ── Header ──────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <ArrowLeft size={18} color="#1A1A1A" strokeWidth={3} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>ARDUINO CONTROL</Text>
          <Text style={s.headerSub}>HC-05 / HC-06 — Bluetooth Clássico</Text>
        </View>

        {/* Botão Bluetooth */}
        <TouchableOpacity
          style={[s.btBtn, { backgroundColor: getBtBg() }]}
          onPress={handleBtPress}
          activeOpacity={0.85}
          disabled={status === 'scanning' || status === 'connecting'}
        >
          {status === 'connected'
            ? <BluetoothConnected size={16} color="#fff" strokeWidth={2.5} />
            : status === 'scanning' || status === 'connecting'
            ? <BluetoothSearching size={16} color="#1A1A1A" strokeWidth={2.5} />
            : <BluetoothOff size={16} color="#fff" strokeWidth={2.5} />}
          <Text style={[s.btLabel, { color: status === 'connected' || status === 'disconnected' ? '#fff' : '#1A1A1A' }]}>
            {getBtLabel()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── TX Indicator ────────────────────────────────────────── */}
      <View style={[s.txBar, { backgroundColor: activeCmd ? getCmdColor(activeCmd) : '#E5E0D5' }]}>
        <Text style={[s.txLabel, { color: activeCmd ? '#1A1A1A' : '#888' }]}>
          {activeCmd ? `CMD: ${activeCmd}` : 'AGUARDANDO COMANDO...'}
        </Text>
        {!isConnected && (
          <Text style={s.simLabel}>SEM CONEXÃO</Text>
        )}
      </View>

      {/* ── D-Pad area ──────────────────────────────────────────── */}
      <View style={s.padSection}>
        {/* Linha: cima */}
        <View style={s.padRow}>
          <TouchableOpacity style={s.padBtn} onPress={() => handle('F')} activeOpacity={0.8}>
            <ArrowUp size={28} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Linha: esq / stop / dir */}
        <View style={s.padRow}>
          <TouchableOpacity style={s.padBtn} onPress={() => handle('L')} activeOpacity={0.8}>
            <ArrowLeftIcon size={28} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.padBtn, s.stopBtn]}
            onPress={() => handle('S')}
            activeOpacity={0.8}
          >
            <StopCircle size={28} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity style={s.padBtn} onPress={() => handle('R')} activeOpacity={0.8}>
            <ArrowRight size={28} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Linha: baixo */}
        <View style={s.padRow}>
          <TouchableOpacity style={s.padBtn} onPress={() => handle('B')} activeOpacity={0.8}>
            <ArrowDown size={28} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Log Serial ──────────────────────────────────────────── */}
      <View style={s.logSection}>
        <View style={s.logHeader}>
          <Terminal size={14} color="#1A6B32" strokeWidth={2.5} />
          <Text style={s.logHeaderText}>LOG SERIAL</Text>
          <Text style={s.logHeaderSub}>(RX do Arduino)</Text>
        </View>

        {rxLog.length === 0 ? (
          <View style={s.logEmpty}>
            <Text style={s.logEmptyText}>
              Aguardando dados do Arduino...{'\n'}
              <Text style={{ fontSize: 10, color: '#aaa' }}>
                Use Serial.println() no sketch para ver as mensagens aqui.
              </Text>
            </Text>
          </View>
        ) : (
          <FlatList
            data={rxLog}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <Text style={s.logLine} numberOfLines={1}>{item}</Text>
            )}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}
      </View>

      {/* Modal de dispositivos */}
      {showDeviceModal && (
        <ArduinoDeviceModal onClose={() => setShowDeviceModal(false)} />
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1A6B32',
    borderBottomWidth: 4,
    borderBottomColor: '#1A1A1A',
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#FFD82D',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    color: '#fff',
    fontSize: 13,
    letterSpacing: 2,
  },
  headerSub: {
    fontFamily: 'SpaceMono-Regular',
    color: '#A8D5B5',
    fontSize: 10,
    letterSpacing: 1,
  },
  btBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    elevation: 4,
  },
  btLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
  },
  // TX Bar
  txBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#1A1A1A',
  },
  txLabel: {
    flex: 1,
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  simLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 9,
    color: '#FF2D2D',
  },
  // D-Pad
  padSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
    backgroundColor: '#EDE8DF',
    borderBottomWidth: 3,
    borderBottomColor: '#1A1A1A',
  },
  padRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  padBtn: {
    width: 72,
    height: 72,
    backgroundColor: '#1A6B32',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  stopBtn: {
    backgroundColor: '#7B2FFF',
  },
  // Log serial
  logSection: {
    flex: 1,
    margin: 16,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0EBE0',
    borderBottomWidth: 2,
    borderBottomColor: '#1A1A1A',
  },
  logHeaderText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 11,
    color: '#1A6B32',
    letterSpacing: 1,
  },
  logHeaderSub: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 9,
    color: '#aaa',
  },
  logEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logEmptyText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  logLine: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 11,
    color: '#1A6B32',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});

// ─── Styles do Modal ──────────────────────────────────────────────────────────

const modal = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#F5F0E8',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '72%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#1A6B32',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 16,
    color: '#1A1A1A',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A6B32',
  },
  scanLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    color: '#1A6B32',
    fontWeight: '700',
  },
  countLabel: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 10,
    color: '#777',
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#FF2D2D',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 3,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    marginBottom: 8,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#1A6B32',
    borderWidth: 2,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceName: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    color: '#1A1A1A',
  },
  deviceId: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 10,
    color: '#999',
    marginTop: 1,
  },
  connecting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFE500',
    borderWidth: 3,
    borderColor: '#1A1A1A',
  },
  connectingText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 14,
    color: '#1A1A1A',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#e0d8c8',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  rescanBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFE500',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    marginTop: 4,
  },
  rescanText: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 13,
    color: '#1A1A1A',
  },
});
