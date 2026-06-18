import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {
  BluetoothConnected,
  BluetoothOff,
  BluetoothSearching,
} from 'lucide-react-native';
import { useBluetooth } from '../context/BluetoothContext';
import DeviceListModal from './DeviceListModal';
import BluetoothOffModal from './BluetoothOffModal';
import { Colors, FontFamily, Shadow } from '../constants/theme';

/**
 * Botão de conexão Bluetooth — aparece no header de todas as telas.
 * - Se Bluetooth desligado: abre BluetoothOffModal com instruções
 * - Se desconectado: abre DeviceListModal para escanear dispositivos
 * - Se conectado: desconecta ao tocar
 */
export default function BluetoothStatusButton() {
  const { status, device, disconnect, bluetoothEnabled } = useBluetooth();
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showOffModal, setShowOffModal] = useState(false);

  const handlePress = () => {
    if (status === 'connected') {
      disconnect();
      return;
    }
    if (status === 'scanning' || status === 'connecting') {
      return; // botão desabilitado neste estado
    }
    // status === 'disconnected'
    if (!bluetoothEnabled) {
      setShowOffModal(true);
    } else {
      setShowDeviceModal(true);
    }
  };

  const getBg = () => {
    if (status === 'connected') return '#00C851';
    if (status === 'scanning' || status === 'connecting') return '#FFE500';
    return '#FF2D2D';
  };

  const getIcon = () => {
    if (status === 'connected')
      return <BluetoothConnected size={16} color="#fff" strokeWidth={2.5} />;
    if (status === 'scanning' || status === 'connecting')
      return <BluetoothSearching size={16} color={Colors.dark} strokeWidth={2.5} />;
    return <BluetoothOff size={16} color="#fff" strokeWidth={2.5} />;
  };

  const getLabel = () => {
    if (status === 'connected')
      return device?.name?.replace('micro:bit ', '') || 'BIT';
    if (status === 'scanning') return 'SCAN';
    if (status === 'connecting') return '...';
    return 'BLE';
  };

  const labelColor =
    status === 'connected' || status === 'disconnected' ? '#fff' : Colors.dark;

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.btn, { backgroundColor: getBg() }, Shadow.neoSmall]}
        activeOpacity={0.85}
        disabled={status === 'scanning' || status === 'connecting'}
      >
        {getIcon()}
        <Text style={[styles.label, { color: labelColor }]}>{getLabel()}</Text>
      </TouchableOpacity>

      {showDeviceModal && (
        <DeviceListModal onClose={() => setShowDeviceModal(false)} />
      )}

      {showOffModal && (
        <BluetoothOffModal onClose={() => setShowOffModal(false)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  label: {
    fontFamily: FontFamily.monoBold,
    fontSize: 11,
  },
});
