/**
 * ArduinoContext.tsx
 *
 * Contexto dedicado para conexão com módulos HC-05 / HC-06 via
 * Bluetooth Clássico (SPP — Serial Port Profile), usando a biblioteca
 * react-native-bluetooth-classic.
 *
 * Fluxo:
 *  1. isBluetoothEnabled() → verifica se o adaptador está ligado
 *  2. getBondedDevices()   → lista dispositivos PAREADOS (HC-05 precisa ser
 *     pareado antes nas configurações do Android)
 *  3. startDiscovery()     → descobre novos dispositivos próximos (opcional)
 *  4. connectToDevice()    → abre o socket SPP
 *  5. sendCommand()        → escreve texto no socket
 *  6. disconnect()         → fecha o socket
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import RNBluetoothClassic, {
  BluetoothDevice,
  BluetoothEventSubscription,
} from 'react-native-bluetooth-classic';
import { BluetoothStatus, ScannedDevice } from '../types/control.types';

// ─── Tipos do contexto ────────────────────────────────────────────────────────

export interface ArduinoContextData {
  /** Estado derivado do ciclo de vida da conexão. */
  status: BluetoothStatus;
  /** Dispositivo conectado atualmente (ou null). */
  device: BluetoothDevice | null;
  isConnected: boolean;
  isScanning: boolean;
  bluetoothEnabled: boolean;
  /** Lista de dispositivos pareados + descobertos durante o scan. */
  scannedDevices: ScannedDevice[];
  /** Log de dados recebidos do Arduino (strings terminadas em '\n'). */
  rxLog: string[];
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: ScannedDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

export const ArduinoContext = createContext<ArduinoContextData>(
  {} as ArduinoContextData,
);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ArduinoProvider = ({ children }: { children: ReactNode }) => {
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [rxLog, setRxLog] = useState<string[]>([]);

  // Refs para acesso dentro de callbacks sem causar re-criação
  const deviceRef = useRef<BluetoothDevice | null>(null);
  deviceRef.current = connectedDevice;

  // Subscription de dados recebidos
  const rxSubscriptionRef = useRef<BluetoothEventSubscription | null>(null);

  // Subscription de estado do adaptador
  const btStateSubRef = useRef<BluetoothEventSubscription | null>(null);

  // Subscription de dispositivo desconectado
  const disconnectSubRef = useRef<BluetoothEventSubscription | null>(null);

  const status: BluetoothStatus = isConnected
    ? 'connected'
    : isConnecting
    ? 'connecting'
    : isScanning
    ? 'scanning'
    : 'disconnected';

  // ── Monitorar estado do adaptador ──────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    // Lê estado inicial
    RNBluetoothClassic.isBluetoothEnabled()
      .then(enabled => { if (mounted) setBluetoothEnabled(enabled); })
      .catch(() => {});

    // Escuta mudanças de estado
    const enabledSub = RNBluetoothClassic.onBluetoothEnabled(() => {
      if (mounted) setBluetoothEnabled(true);
    });
    const disabledSub = RNBluetoothClassic.onBluetoothDisabled(() => {
      if (mounted) setBluetoothEnabled(false);
    });

    btStateSubRef.current = enabledSub; // guardamos apenas o primeiro para cleanup

    return () => {
      mounted = false;
      enabledSub.remove();
      disabledSub.remove();
    };
  }, []);

  // ── Cleanup global na desmontagem ─────────────────────────────────────────

  useEffect(() => {
    return () => {
      rxSubscriptionRef.current?.remove();
      disconnectSubRef.current?.remove();
      btStateSubRef.current?.remove();
      // Fecha o socket se houver conexão ativa
      if (deviceRef.current) {
        deviceRef.current.disconnect().catch(() => {});
      }
    };
  }, []);

  // ── Permissões Android ────────────────────────────────────────────────────

  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    if (Platform.Version >= 31) {
      // Android 12+ — permissões granulares de BT
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    } else {
      // Android < 12 — localização para descoberta BT
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
  }, []);

  // ── Stop Scan ─────────────────────────────────────────────────────────────

  const stopScan = useCallback(() => {
    RNBluetoothClassic.cancelDiscovery().catch(() => {});
    setIsScanning(false);
  }, []);

  // ── Start Scan ────────────────────────────────────────────────────────────

  const startScan = useCallback(async () => {
    await requestPermissions();
    if (isScanning) return;

    setScannedDevices([]);
    setIsScanning(true);

    try {
      // 1. Dispositivos JÁ PAREADOS — aparecem instantaneamente
      const bonded = await RNBluetoothClassic.getBondedDevices();
      const bondedList: ScannedDevice[] = bonded.map(d => ({
        id: d.address,
        name: d.name || 'HC-05 / HC-06',
        rssi: -50, // dispositivos pareados não fornecem RSSI sem scan ativo
        type: 'classic' as const,
      }));
      setScannedDevices(bondedList);

      // 2. Descoberta ativa — encontra dispositivos próximos não pareados
      //    startDiscovery() é bloqueante (~12 s); já retorna a lista final.
      const discovered = await RNBluetoothClassic.startDiscovery();
      const discoveredList: ScannedDevice[] = discovered
        .filter(d => !bonded.some(b => b.address === d.address)) // sem duplicatas
        .map(d => ({
          id: d.address,
          name: d.name || 'Dispositivo BT',
          rssi: typeof d.rssi === 'number' ? (d.rssi as number) : -80,
          type: 'classic' as const,
        }));

      setScannedDevices(prev => [...prev, ...discoveredList]);
    } catch (err) {
      console.warn('[Arduino] Erro no scan:', err);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, requestPermissions]);

  // ── Connect ───────────────────────────────────────────────────────────────

  const connectToDevice = useCallback(async (deviceInfo: ScannedDevice) => {
    stopScan();
    setIsConnecting(true);

    // Remove subscriptions antigas
    rxSubscriptionRef.current?.remove();
    disconnectSubRef.current?.remove();

    try {
      const btDevice = await RNBluetoothClassic.connectToDevice(deviceInfo.id);

      // Escuta dados vindos do Arduino (linhas terminadas em '\n')
      rxSubscriptionRef.current = btDevice.onDataReceived(event => {
        const line = (event.data as string)?.trim();
        if (line) {
          setRxLog(prev => [
            `[${new Date().toLocaleTimeString()}] RX: "${line}"`,
            ...prev.slice(0, 99),
          ]);
        }
      });

      // Escuta desconexão inesperada via evento global
      disconnectSubRef.current = RNBluetoothClassic.onDeviceDisconnected(
        ({ device: dev }) => {
          if (dev?.address === deviceInfo.id) {
            setConnectedDevice(null);
            setIsConnected(false);
            rxSubscriptionRef.current?.remove();
          }
        },
      );

      setConnectedDevice(btDevice);
      setIsConnected(true);
      setIsConnecting(false);
    } catch (e) {
      console.error('[Arduino] Erro na conexão:', e);
      setIsConnecting(false);
      Alert.alert(
        'Erro de Conexão',
        'Não foi possível conectar ao módulo.\n\nVerifique se o HC-05/HC-06 está ligado e pareado com o Android.',
      );
    }
  }, [stopScan]);

  // ── Disconnect ────────────────────────────────────────────────────────────

  const disconnect = useCallback(async () => {
    rxSubscriptionRef.current?.remove();
    rxSubscriptionRef.current = null;
    disconnectSubRef.current?.remove();
    disconnectSubRef.current = null;

    try {
      if (deviceRef.current) {
        await deviceRef.current.disconnect();
      }
    } catch (e) {
      // ignora erros de desconexão
    } finally {
      setConnectedDevice(null);
      setIsConnected(false);
    }
  }, []);

  // ── Send Command ──────────────────────────────────────────────────────────

  const sendCommand = useCallback(async (command: string) => {
    const dev = deviceRef.current;
    if (!dev) return;

    try {
      // O SPP transmite texto puro — adiciona '\n' como delimitador para o Arduino
      await dev.write(command + '\n');
    } catch (e) {
      console.error(`[Arduino] Erro ao enviar "${command}":`, e);
    }
  }, []);

  // ── Valor do contexto ─────────────────────────────────────────────────────

  const contextValue = useMemo<ArduinoContextData>(
    () => ({
      status,
      device: connectedDevice,
      isConnected,
      isScanning,
      bluetoothEnabled,
      scannedDevices,
      rxLog,
      startScan,
      stopScan,
      connectToDevice,
      disconnect,
      sendCommand,
    }),
    [
      status,
      connectedDevice,
      isConnected,
      isScanning,
      bluetoothEnabled,
      scannedDevices,
      rxLog,
      startScan,
      stopScan,
      connectToDevice,
      disconnect,
      sendCommand,
    ],
  );

  return (
    <ArduinoContext.Provider value={contextValue}>
      {children}
    </ArduinoContext.Provider>
  );
};

// ─── Hook de conveniência ─────────────────────────────────────────────────────

export const useArduino = () => useContext(ArduinoContext);