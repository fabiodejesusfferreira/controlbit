/**
 * iconMap — lucide-react-native
 *
 * Componente <Icon name="arrow-up" size={24} color="#000" />
 * compatível com o mesmo mapa usado no UI design web.
 */

import React from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  StopCircle,
  Power,
  Zap,
  Bell,
  Star,
  Heart,
  RotateCw,
  RotateCcw,
  Move,
  Maximize2,
  Hand,
  Flag,
  Target,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  BluetoothSearching,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Gamepad2,
  Radio,
  Cpu,
  Wifi,
  WifiOff,
  Menu,
  Home,
  Sliders,
  Layout,
  Lock,
} from 'lucide-react-native';
import { LucideIcon } from 'lucide-react-native';

// Mapa de nome → componente Lucide (React Native)
export const ICON_MAP: Record<string, LucideIcon> = {
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  play: Play,
  pause: Pause,
  'stop-circle': StopCircle,
  power: Power,
  zap: Zap,
  bell: Bell,
  star: Star,
  heart: Heart,
  'rotate-cw': RotateCw,
  'rotate-ccw': RotateCcw,
  move: Move,
  'maximize-2': Maximize2,
  hand: Hand,
  flag: Flag,
  target: Target,
  bluetooth: Bluetooth,
  'bluetooth-connected': BluetoothConnected,
  'bluetooth-off': BluetoothOff,
  'bluetooth-searching': BluetoothSearching,
  settings: Settings,
  plus: Plus,
  'trash-2': Trash2,
  'edit-3': Edit3,
  check: Check,
  x: X,
  'gamepad-2': Gamepad2,
  radio: Radio,
  cpu: Cpu,
  wifi: Wifi,
  'wifi-off': WifiOff,
  menu: Menu,
  home: Home,
  sliders: Sliders,
  layout: Layout,
  lock: Lock,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 20, color = '#000' }: IconProps) {
  const Component = ICON_MAP[name] ?? Zap;
  return <Component size={size} color={color} strokeWidth={2.5} />;
}

/** Lista de ícones disponíveis para o picker do CustomControl */
export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

/** Cores disponíveis para botões customizados */
export const BUTTON_COLORS = [
  '#FFE500',
  '#FF6B00',
  '#FF2D2D',
  '#FF3CAC',
  '#7B2FFF',
  '#0066FF',
  '#00D9F5',
  '#00C851',
  '#1A1A1A',
  '#FFFFFF',
  '#F5F0E8',
  '#B0A898',
  '#FF8C00',
  '#EC4899',
  '#06B6D4',
];
