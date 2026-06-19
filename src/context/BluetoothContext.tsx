import React, {
  createContext, useContext, useState, useEffect,
  useMemo, useCallback, useRef, ReactNode,
} from "react";
import { Platform, PermissionsAndroid, Alert } from "react-native";
import { BleManager, Device as BleDevice } from "react-native-ble-plx";
import RNBluetoothClassic, {
  BluetoothDevice as ClassicDevice,
  BluetoothEventSubscription,
} from "react-native-bluetooth-classic";
import { BluetoothStatus, ScannedDevice } from "../types/control.types";

// ─── BLE UUIDs ────────────────────────────────────────────────────────────────
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_UUID      = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const HM10_SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
const HM10_CHAR_UUID    = "0000ffe1-0000-1000-8000-00805f9b34fb";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface BluetoothContextData {
  status: BluetoothStatus;
  device: BleDevice | ClassicDevice | null;
  isConnected: boolean;
  isScanning: boolean;
  bluetoothEnabled: boolean;
  scannedDevices: ScannedDevice[];
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: ScannedDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
}

export const BluetoothContext = createContext<BluetoothContextData>(
  {} as BluetoothContextData,
);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const BluetoothProvider = ({ children }: { children: ReactNode }) => {
  const [manager] = useState(() => new BleManager());

  const [bleDevice,     setBleDevice]     = useState<BleDevice | null>(null);
  const [classicDevice, setClassicDevice] = useState<ClassicDevice | null>(null);
  const [isConnected,   setIsConnected]   = useState(false);
  const [isScanning,    setIsScanning]    = useState(false);
  const [isConnecting,  setIsConnecting]  = useState(false);
  const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);

  // Refs para sendCommand sem recriar o callback
  const bleRef     = useRef<BleDevice | null>(null);
  const classicRef = useRef<ClassicDevice | null>(null);
  bleRef.current     = bleDevice;
  classicRef.current = classicDevice;

  // Protocolo BLE ativo: 'hm10' | 'uart' | null
  const bleProtocolRef = useRef<"hm10" | "uart" | null>(null);

  // Subscription de desconexão clássica
  const classicDisconnectSub = useRef<BluetoothEventSubscription | null>(null);

  // Status derivado
  const status: BluetoothStatus = isConnected
    ? "connected"
    : isConnecting
    ? "connecting"
    : isScanning
    ? "scanning"
    : "disconnected";

  // ── Monitora estado do adaptador BLE ────────────────────────────────────────
  useEffect(() => {
    const sub = manager.onStateChange((state) => {
      setBluetoothEnabled(state === "PoweredOn");
    }, true);
    return () => sub.remove();
  }, [manager]);

  // ── Monitora estado do adaptador Clássico ───────────────────────────────────
  useEffect(() => {
    RNBluetoothClassic.isBluetoothEnabled()
      .then(setBluetoothEnabled)
      .catch(() => {});

    const en  = RNBluetoothClassic.onBluetoothEnabled(() => setBluetoothEnabled(true));
    const dis = RNBluetoothClassic.onBluetoothDisabled(() => setBluetoothEnabled(false));
    return () => { en.remove(); dis.remove(); };
  }, []);

  // ── Cleanup na desmontagem ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      manager.destroy();
      classicDisconnectSub.current?.remove();
    };
  }, [manager]);

  // ── Permissões ───────────────────────────────────────────────────────────────
  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== "android") return;
    if (Platform.Version >= 31) {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    } else {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
  }, []);

  // ── Stop Scan ────────────────────────────────────────────────────────────────
  const stopScan = useCallback(() => {
    manager.stopDeviceScan();
    RNBluetoothClassic.cancelDiscovery().catch(() => {});
    setIsScanning(false);
  }, [manager]);

  // ── Start Scan ───────────────────────────────────────────────────────────────
  const startScan = useCallback(async () => {
    await requestPermissions();
    if (isScanning) return;

    setScannedDevices([]);
    setIsScanning(true);

    // 1. Dispositivos Clássicos PAREADOS (HC-05/HC-06) — aparecem imediatamente
    try {
      const bonded = await RNBluetoothClassic.getBondedDevices();
      const classicList: ScannedDevice[] = bonded.map(d => ({
        id:   d.address,
        name: d.name || "HC-05 / HC-06",
        rssi: -50,
        type: "classic" as const,
      }));
      if (classicList.length > 0) {
        setScannedDevices(classicList);
      }
    } catch (err) {
      console.warn("[BT] Erro ao buscar dispositivos pareados:", err);
    }

    // 2. Scan BLE (HM-10, HC-08, Micro:bit…)
    manager.startDeviceScan(null, null, (error, scanned) => {
      if (error) { setIsScanning(false); return; }
      if (scanned?.name) {
        setScannedDevices(prev => {
          if (prev.some(d => d.id === scanned.id)) return prev;
          return [...prev, {
            id:   scanned.id,
            name: scanned.name!,
            rssi: scanned.rssi ?? -100,
            type: "ble" as const,
          }];
        });
      }
    });

    setTimeout(() => stopScan(), 12000);
  }, [manager, isScanning, requestPermissions, stopScan]);

  // ── Connect ──────────────────────────────────────────────────────────────────
  const connectToDevice = useCallback(async (deviceInfo: ScannedDevice) => {
    stopScan();
    setIsConnecting(true);

    try {
      // ── Bluetooth Clássico (HC-05 / HC-06) ──────────────────────────────────
      if (deviceInfo.type === "classic") {
        const connected = await RNBluetoothClassic.connectToDevice(deviceInfo.id);

        // Escuta desconexão inesperada
        classicDisconnectSub.current?.remove();
        classicDisconnectSub.current = RNBluetoothClassic.onDeviceDisconnected(
          ({ device: dev }) => {
            if ((dev as any)?.address === deviceInfo.id) {
              setClassicDevice(null);
              setIsConnected(false);
              bleProtocolRef.current = null;
              classicDisconnectSub.current?.remove();
            }
          },
        );

        setClassicDevice(connected);
        setIsConnected(true);
        setIsConnecting(false);
        return;
      }

      // ── BLE (HM-10 / HC-08 / Micro:bit) ────────────────────────────────────
      const connected = await manager.connectToDevice(deviceInfo.id, {
        requestMTU: 23,
        autoConnect: false,
      });

      if (Platform.OS === "android") {
        try {
          // @ts-ignore
          if (typeof connected.refreshGatt === "function") await connected.refreshGatt();
        } catch (_) {}
      }

      await connected.discoverAllServicesAndCharacteristics();
      const services = await connected.services();

      let protocol: "hm10" | "uart" | null = null;
      for (const svc of services) {
        const id = svc.uuid.toLowerCase();
        if (id.includes("ffe0"))     { protocol = "hm10"; break; }
        if (id.includes("6e400001")) { protocol = "uart"; break; }
      }
      bleProtocolRef.current = protocol;

      connected.onDisconnected(() => {
        setBleDevice(null);
        setIsConnected(false);
        bleProtocolRef.current = null;
      });

      setBleDevice(connected);
      setIsConnected(true);
      setIsConnecting(false);
    } catch (e) {
      console.error("[BT] Erro na conexão:", e);
      setIsConnecting(false);
      Alert.alert(
        "Erro de Conexão",
        "Não foi possível conectar ao dispositivo.\n\nPara HC-05/HC-06, certifique-se de que o módulo está pareado nas configurações do Android.",
      );
    }
  }, [manager, stopScan]);

  // ── Disconnect ───────────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    classicDisconnectSub.current?.remove();
    classicDisconnectSub.current = null;
    try {
      if (bleRef.current)     await bleRef.current.cancelConnection();
      if (classicRef.current) await classicRef.current.disconnect();
    } catch (_) {}
    setBleDevice(null);
    setClassicDevice(null);
    setIsConnected(false);
    bleProtocolRef.current = null;
  }, []);

  // ── Send Command ─────────────────────────────────────────────────────────────
  const sendCommand = useCallback(async (command: string) => {
    const cmdNL = command + "\n";

    try {
      // Clássico (HC-05/HC-06) — texto puro via SPP
      if (classicRef.current) {
        await classicRef.current.write(cmdNL);
        return;
      }

      // BLE — base64 via characteristic
      if (!bleRef.current) return;
      const payload =
        typeof btoa !== "undefined"
          ? btoa(cmdNL)
          : Buffer.from(cmdNL).toString("base64");

      const proto = bleProtocolRef.current;
      if (proto === "hm10") {
        await bleRef.current.writeCharacteristicWithoutResponseForService(
          HM10_SERVICE_UUID, HM10_CHAR_UUID, payload,
        );
      } else {
        await bleRef.current.writeCharacteristicWithoutResponseForService(
          UART_SERVICE_UUID, UART_RX_UUID, payload,
        );
      }
    } catch (e) {
      console.error(`[BT] Erro ao enviar "${command}":`, e);
    }
  }, []);

  // ── Valor do contexto ────────────────────────────────────────────────────────
  const contextValue = useMemo(() => ({
    status,
    device: (bleDevice ?? classicDevice) as BleDevice | ClassicDevice | null,
    isConnected,
    isScanning,
    bluetoothEnabled,
    scannedDevices,
    startScan,
    stopScan,
    connectToDevice,
    disconnect,
    sendCommand,
  }), [
    status, bleDevice, classicDevice, isConnected, isScanning,
    bluetoothEnabled, scannedDevices, startScan, stopScan,
    connectToDevice, disconnect, sendCommand,
  ]);

  return (
    <BluetoothContext.Provider value={contextValue}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);
