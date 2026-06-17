import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Trash2, Check, Edit3 } from 'lucide-react-native';
import { ControlButton } from '../../types/control.types';
import { Icon, BUTTON_COLORS } from '../../utils/iconMap';
import IconPickerModal from '../../components/IconPickerModal';
import { Colors, FontFamily, Shadow } from '../../constants/theme';

interface Props {
  button: ControlButton;
  onChange: (updated: ControlButton) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ButtonFormPanel({
  button,
  onChange,
  onDelete,
  onClose,
}: Props) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [size, setSize] = useState(button.size ?? 80);

  const update = (field: keyof ControlButton, value: string | number) => {
    onChange({ ...button, [field]: value });
  };

  const handleSizeComplete = (v: number) => {
    const rounded = Math.round(v / 5) * 5;
    setSize(rounded);
    update('size', rounded);
  };

  const textColor = ['#FFE500', '#FFFFFF', '#F5F0E8', '#00D9F5', '#00C851'].includes(
    button.color ?? '',
  )
    ? Colors.dark
    : '#fff';

  return (
    <View style={[styles.panel, Shadow.neo]}>
      {/* Header */}
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>EDITAR BOTÃO</Text>
        <View style={styles.panelActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FF2D2D' }, Shadow.neoSmall]}
            onPress={onDelete}
            activeOpacity={0.8}
          >
            <Trash2 size={13} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#00C851' }, Shadow.neoSmall]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Check size={13} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Ícone + cor */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.iconPickerBtn, Shadow.neoSmall]}
            onPress={() => setShowIconPicker(true)}
            activeOpacity={0.85}
          >
            <Icon name={button.icon} size={16} color={Colors.dark} />
            <Text style={styles.iconLabel} numberOfLines={1}>
              {button.icon}
            </Text>
            <Edit3 size={12} color="#999" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.colorSwatch,
              {
                backgroundColor: button.color ?? '#FFE500',
              },
              Shadow.neoSmall,
            ]}
            onPress={() => setShowColorPicker(!showColorPicker)}
          />
        </View>

        {/* Color picker */}
        {showColorPicker && (
          <View style={styles.colorGrid}>
            {BUTTON_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorCell,
                  { backgroundColor: c },
                  button.color === c && styles.colorCellActive,
                ]}
                onPress={() => {
                  update('color', c);
                  setShowColorPicker(false);
                }}
              />
            ))}
          </View>
        )}

        {/* Label */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>LABEL</Text>
          <TextInput
            style={styles.textInput}
            value={button.label}
            onChangeText={(v) => update('label', v)}
            placeholder="Ex: Frente"
            placeholderTextColor="#bbb"
          />
        </View>

        {/* Comando */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>COMANDO BLE</Text>
          <TextInput
            style={[styles.textInput, styles.cmdInput]}
            value={button.command}
            onChangeText={(v) => update('command', v)}
            placeholder="Ex: up, motor_on, c90"
            placeholderTextColor="#555"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Tamanho */}
        <View style={styles.field}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>TAMANHO</Text>
            <Text style={styles.fieldValue}>{size}dp</Text>
          </View>
          <Slider
            minimumValue={50}
            maximumValue={180}
            step={5}
            value={size}
            onValueChange={(v) => setSize(Math.round(v / 5) * 5)}
            onSlidingComplete={handleSizeComplete}
            minimumTrackTintColor={button.color ?? '#FFE500'}
            maximumTrackTintColor="#ccc"
            thumbTintColor={button.color ?? '#FFE500'}
          />
        </View>

        {/* Preview */}
        <View style={styles.preview}>
          <View
            style={[
              styles.previewBtn,
              {
                width: Math.min(80, Math.max(36, size * 0.6)),
                height: Math.min(80, Math.max(36, size * 0.6)),
                backgroundColor: button.color ?? '#FFE500',
              },
              Shadow.neoSmall,
            ]}
          >
            <Icon
              name={button.icon}
              size={Math.min(24, Math.round(size * 0.2))}
              color={textColor}
            />
          </View>
          <View style={styles.previewInfo}>
            <Text style={styles.previewName}>{button.label || '—'}</Text>
            <Text style={styles.previewCmd}>TX: "{button.command}"</Text>
          </View>
        </View>
      </ScrollView>

      {showIconPicker && (
        <IconPickerModal
          selected={button.icon}
          onSelect={(icon) => update('icon', icon)}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: Colors.bg,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.dark,
    borderBottomWidth: 3,
    borderBottomColor: Colors.dark,
  },
  panelTitle: {
    fontFamily: FontFamily.monoBold,
    fontSize: 11,
    color: '#fff',
  },
  panelActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { maxHeight: 380 },
  scrollContent: {
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconPickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  iconLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.dark,
    flex: 1,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: Colors.dark,
    flexShrink: 0,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.dark,
    padding: 8,
  },
  colorCell: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  colorCellActive: {
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  field: {
    gap: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontFamily: FontFamily.monoBold,
    fontSize: 9,
    color: '#888',
  },
  fieldValue: {
    fontFamily: FontFamily.monoBold,
    fontSize: 11,
    color: Colors.dark,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.dark,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.dark,
  },
  cmdInput: {
    backgroundColor: Colors.dark,
    color: '#00C851',
    fontFamily: FontFamily.mono,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  previewBtn: {
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  previewInfo: {
    gap: 2,
  },
  previewName: {
    fontFamily: FontFamily.title,
    fontSize: 12,
    color: Colors.dark,
  },
  previewCmd: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: '#00C851',
  },
});
