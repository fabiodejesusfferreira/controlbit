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
import { Colors, FontFamily, Shadow } from '../constants/theme';

/**
 * Botão de conexão Bluetooth — aparece no header de todas as telas.
 * Abre o DeviceListModal ao tocar quando desconectado.
 * Desconecta ao tocar quando conectado.
 */
export default function BluetoothStatusButton() {
  const { status, device, disconnect } = useBluetooth();
  const [showModal, setShowModal] = useState(false);

  const handlePress = () => {
    if (status === 'connected') {
      disconnect();
    } else if (status === 'disconnected') {
      setShowModal(true);
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

  const labelColor = status === 'connected' || status === 'disconnected' ? '#fff' : Colors.dark;

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

      {showModal && <DeviceListModal onClose={() => setShowModal(false)} />}
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
