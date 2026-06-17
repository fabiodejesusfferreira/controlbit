import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, StopCircle, Zap, Activity, Terminal } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useBluetooth } from '../../context/BluetoothContext';
import ControlPad from '../../components/ControlPad';
import ServoSlider from '../../components/ServoSlider';
import BluetoothStatusButton from '../../components/BluetoothButton';
import { Colors, FontFamily, Shadow } from '../../constants/theme';

// Mapeia comando → cor do indicador TX
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

const LEGEND = [
  { cmd: 'up', label: '↑ FRENTE', color: '#00C851' },
  { cmd: 'down', label: '↓ RÉ', color: '#FF2D2D' },
  { cmd: 'left', label: '← ESQ', color: '#0066FF' },
  { cmd: 'right', label: '→ DIR', color: '#0066FF' },
  { cmd: 'horn', label: '🔔 BUZINA', color: '#FF6B00' },
  { cmd: 'stop', label: '■ STOP', color: '#7B2FFF' },
];

export default function BasicControl() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isConnected, sendCommand } = useBluetooth();
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [activeCmd, setActiveCmd] = useState('');
  const [showLog, setShowLog] = useState(false);

  const handleCommand = useCallback((cmd: string) => {
    setActiveCmd(cmd);
    sendCommand(cmd);
    setCommandLog(prev => [
      `[${new Date().toLocaleTimeString()}] TX: "${cmd}"`,
      ...prev.slice(0, 49),
    ]);
  }, [sendCommand]);

  const handleStop = () => {
    setActiveCmd('stop');
    sendCommand('stop');
    setCommandLog(prev => [
      `[${new Date().toLocaleTimeString()}] TX: "stop"`,
      ...prev.slice(0, 49),
    ]);
    setTimeout(() => setActiveCmd(''), 200);
  };

  const cmdBg = activeCmd ? getCmdColor(activeCmd) : '#2A2A2A';

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
          <Text style={styles.headerTitle}>CONTROLE BÁSICO</Text>
          <Text style={styles.headerSub}>D-PAD + SERVOS</Text>
        </View>

        <TouchableOpacity
          style={[styles.logToggleBtn, showLog && styles.logToggleBtnActive]}
          onPress={() => setShowLog(v => !v)}
          activeOpacity={0.8}
        >
          <Terminal size={14} color={showLog ? Colors.dark : '#fff'} strokeWidth={2.5} />
        </TouchableOpacity>

        <BluetoothStatusButton />
      </View>

      {/* ── TX Indicator ───────────────────────────────────────────── */}
      <View style={[styles.txBar, { backgroundColor: cmdBg }]}>
        <Activity
          size={14}
          color={activeCmd ? Colors.dark : '#555'}
          strokeWidth={2.5}
        />
        <Text style={[styles.txText, { color: activeCmd ? Colors.dark : '#555' }]}>
          TX: {activeCmd ? `"${activeCmd}"` : '—'}
        </Text>
        {!isConnected && (
          <Text style={styles.simLabel}>SIMULANDO</Text>
        )}
      </View>

      {/* ── Log BLE (visível quando showLog = true) ───────────────────── */}
      {showLog && (
        <View style={styles.logPanel}>
          <FlatList
            data={commandLog}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <Text style={styles.logLine} numberOfLines={2}>{item}</Text>
            )}
            style={{ maxHeight: 140 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.logEmpty}>Nenhum log ainda...</Text>
            }
          />
        </View>
      )}
      {/* ── Main scroll ────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Seção D-Pad */}
        <View style={[styles.section, Shadow.neo]}>
          {/* Section header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DIREÇÃO</Text>
            <View style={styles.indicatorRow}>
              {['up', 'down', 'left', 'right'].map((d) => (
                <View
                  key={d}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor:
                        activeCmd === d ? '#00C851' : '#444',
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* D-Pad */}
          <View style={styles.dpadArea}>
            <ControlPad onCommand={handleCommand} onStop={handleStop} />
          </View>

          {/* Legend grid */}
          <View style={styles.legendGrid}>
            {LEGEND.map((item, i) => (
              <View
                key={item.cmd}
                style={[
                  styles.legendCell,
                  i % 3 !== 2 && styles.legendBorderRight,
                  i < 3 && styles.legendBorderBottom,
                  activeCmd === item.cmd && {
                    backgroundColor: item.color + '33',
                  },
                ]}
              >
                <Text style={[styles.legendText, { color: item.color }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Seção Servos */}
        <View style={[styles.section, Shadow.neo]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SERVOS</Text>
            <Text style={styles.sectionSub}>0° → 180°</Text>
          </View>
          <View style={styles.servosArea}>
            <ServoSlider
              label="SERVO 1"
              prefix="c"
              color="#FF3CAC"
              onCommand={handleCommand}
            />
            <ServoSlider
              label="SERVO 2"
              prefix="x"
              color="#00D9F5"
              onCommand={handleCommand}
            />
          </View>
        </View>

        {/* Botão STOP */}
        <TouchableOpacity
          style={[styles.stopBtn, Shadow.neo]}
          onPressIn={() => handleCommand('stop')}
          activeOpacity={0.85}
        >
          <StopCircle size={22} color="#fff" strokeWidth={2.5} />
          <Text style={styles.stopText}>STOP EMERGÊNCIA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.dark,
    borderBottomWidth: 3,
    borderBottomColor: Colors.dark,
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#FFE500',
    borderWidth: 3,
    borderColor: '#fff',
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
    color: '#aaa',
    fontWeight: '600',
  },
  logToggleBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#444',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 4,
  },
  logToggleBtnActive: {
    backgroundColor: '#FFE500',
    borderColor: '#FFE500',
  },
  logPanel: {
    backgroundColor: '#0D1117',
    borderBottomWidth: 2,
    borderBottomColor: '#FFE500',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logLine: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: '#00C851',
    paddingVertical: 1,
  },
  logEmpty: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // TX bar
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
  simLabel: {
    fontFamily: FontFamily.monoBold,
    fontSize: 9,
    color: '#f87171',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },

  // Section card
  section: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.dark,
    borderBottomWidth: 3,
    borderBottomColor: Colors.dark,
  },
  sectionTitle: {
    fontFamily: FontFamily.monoBold,
    fontSize: 11,
    color: '#fff',
  },
  sectionSub: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: '#aaa',
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 3,
  },
  indicator: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: Colors.dark,
  },

  // D-Pad
  dpadArea: {
    alignItems: 'center',
    paddingVertical: 24,
  },

  // Legend
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 3,
    borderTopColor: Colors.dark,
  },
  legendCell: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  legendBorderRight: {
    borderRightWidth: 2,
    borderRightColor: Colors.dark,
  },
  legendBorderBottom: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark,
  },
  legendText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 9,
  },

  // Servos
  servosArea: {
    padding: 16,
    gap: 12,
  },

  // Stop button
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    backgroundColor: '#FF2D2D',
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  stopText: {
    fontFamily: FontFamily.title,
    fontSize: 15,
    color: '#fff',
  },

  // Protocol note
  protocolNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.dark,
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  protocolText: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: '#aaa',
    flex: 1,
  },
});
