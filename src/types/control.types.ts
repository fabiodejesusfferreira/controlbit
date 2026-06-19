export interface ControlButton {
  id: string;
  icon: string;
  command: string;
  label: string;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}

export interface ControlProfile {
  id: string;
  name: string;
  buttons: ControlButton[];
  isDefault?: boolean;
  /** Orientação da tela no modo Play */
  orientation?: 'portrait' | 'landscape';
}

export type BluetoothStatus =
  | 'disconnected'
  | 'scanning'
  | 'connecting'
  | 'connected';

export interface ScannedDevice {
  id: string;
  name: string;
  rssi: number;
  type?: 'ble' | 'classic';
}
