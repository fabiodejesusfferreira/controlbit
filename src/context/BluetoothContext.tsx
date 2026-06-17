import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform, PermissionsAndroid, Alert } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { BluetoothStatus, ScannedDevice } from "../types/control.types";

// UUIDs CORRIGIDOS (UART Service)
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // Notify
const UART_RX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // Write

interface BluetoothContextData {
  status: BluetoothStatus;
  device: Device | null;
  isConnected: boolean;
  isScanning: boolean;
  scannedDevices: ScannedDevice[];
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: ScannedDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
}

export const BluetoothContext = createContext<BluetoothContextData>(
  {} as BluetoothContextData
);

export const BluetoothProvider = ({ children }: { children: ReactNode }) => {
  const [manager] = useState(new BleManager());
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);

  // Deriva status a partir dos estados booleanos
  const status: BluetoothStatus = isConnected
    ? "connected"
    : isConnecting
    ? "connecting"
    : isScanning
    ? "scanning"
    : "disconnected";

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, [manager]);

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if (Platform.Version >= 31) {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      } else {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
      }
    }
  };

  const startScan = async () => {
    await requestPermissions();

    if (isScanning) return;

    setScannedDevices([]); // Limpa lista anterior
    setIsScanning(true);
    console.log("LOG: Iniciando Scan Manual...");

    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.warn("Erro no scan:", error);
        setIsScanning(false);
        return;
      }

      // Filtra apenas micro:bits e evita duplicados na lista
      if (
        scannedDevice &&
        scannedDevice.name &&
        scannedDevice.name.includes("micro:bit")
      ) {
        const simplified: ScannedDevice = {
          id: scannedDevice.id,
          name: scannedDevice.name,
          rssi: scannedDevice.rssi ?? -100,
        };
        setScannedDevices((prevDevices) => {
          if (!prevDevices.some((d) => d.id === simplified.id)) {
            return [...prevDevices, simplified];
          }
          return prevDevices;
        });
      }
    });

    // Timeout de segurança: para o scan após 10 segundos
    setTimeout(() => {
      stopScan();
    }, 10000);
  };

  const stopScan = () => {
    manager.stopDeviceScan();
    setIsScanning(false);
    console.log("LOG: Scan finalizado.");
  };

  const connectToDevice = async (deviceInfo: ScannedDevice) => {
    stopScan(); // Garante que parou de escanear
    setIsConnecting(true);

    try {
      console.log(`LOG: Conectando ao ${deviceInfo.name}...`);

      const options = { requestMTU: 23, autoConnect: false };
      const connectedDevice = await manager.connectToDevice(deviceInfo.id, options);

      // Tratamento Android RefreshGatt
      if (Platform.OS === "android") {
        try {
          // @ts-ignore
          if (typeof connectedDevice.refreshGatt === "function") {
            // @ts-ignore
            await connectedDevice.refreshGatt();
            await new Promise((r) => setTimeout(r, 500));
          }
        } catch (e) {}
      }

      await connectedDevice.discoverAllServicesAndCharacteristics();

      // Listener de desconexão
      connectedDevice.onDisconnected(() => {
        console.log("LOG: Dispositivo desconectado.");
        setIsConnected(false);
        setIsConnecting(false);
        setDevice(null);
      });

      setDevice(connectedDevice);
      setIsConnected(true);
      setIsConnecting(false);
      console.log("LOG: Conectado com sucesso!");
    } catch (e) {
      console.error("LOG: Erro na conexão", e);
      setIsConnecting(false);
      Alert.alert("Erro", "Falha ao conectar. Tente reiniciar o micro:bit.");
      try {
        await manager.cancelDeviceConnection(deviceInfo.id);
      } catch (err) {}
    }
  };

  const disconnect = async () => {
    if (device) {
      try {
        await device.cancelConnection();
      } catch (e) {}
      setDevice(null);
      setIsConnected(false);
    }
  };

  const sendCommand = async (command: string) => {
    if (!device || !isConnected) return;
    try {
      const commandWithNewLine = command + "\n";
      const payload =
        typeof btoa !== "undefined"
          ? btoa(commandWithNewLine)
          : Buffer.from(commandWithNewLine).toString("base64");

      await device.writeCharacteristicWithoutResponseForService(
        UART_SERVICE_UUID,
        UART_RX_UUID,
        payload
      );
    } catch (e) {
      console.error(`Erro envio ${command}:`, e);
    }
  };

  return (
    <BluetoothContext.Provider
      value={{
        status,
        device,
        isConnected,
        isScanning,
        scannedDevices,
        startScan,
        stopScan,
        connectToDevice,
        disconnect,
        sendCommand,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};

// Hook de conveniência para consumir o contexto
export const useBluetooth = () => useContext(BluetoothContext);
