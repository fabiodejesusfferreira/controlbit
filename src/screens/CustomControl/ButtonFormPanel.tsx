import React, { useState, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Trash2, Check, X } from 'lucide-react-native';
import { ControlButton } from '../../types/control.types';
import { Icon } from '../../utils/iconMap';
import IconPickerModal from '../../components/IconPickerModal';
import { Colors, FontFamily } from '../../constants/theme';
import { useLanguage } from '../../context/LanguageContext';

const PICKER_COLORS = [
  '#FFD82D', '#22C55E', '#3B82F6', '#A855F7', '#F97316',
  '#E81C1C', '#06B6D4', '#EC4899',
];

const LIGHT_COLORS = new Set([
  '#FFD82D', '#22C55E', '#06B6D4', '#FFFFFF', '#F5F0E8',
]);

interface Props {
  button: ControlButton;
  onChange: (updated: ControlButton) => void;
  onDelete: () => void;
  onClose: () => void;
}

function ButtonFormPanel({ button, onChange, onDelete, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const { t } = useLanguage();
  const isLandscape = width > height;
  const [showIconPicker, setShowIconPicker] = useState(false);
  // Estado local do tamanho — só chama onChange no SlidingComplete
  const [localSize, setLocalSize] = useState(button.size ?? 120);
  // Ref do botão local — evita closures stale no Slider
  const buttonRef = useRef(button);
  buttonRef.current = button;

  const textColor = LIGHT_COLORS.has(button.color ?? '')
    ? Colors.dark
    : '#fff';

  // Atualiza campo e notifica pai — useCallback para não recriar a cada render
  const update = useCallback(
    (field: keyof ControlButton, value: string | number) => {
      onChange({ ...buttonRef.current, [field]: value });
    },
    [onChange],
  );

  const handleIconSelect = useCallback(
    (icon: string) => {
      update('icon', icon);
      setShowIconPicker(false);
    },
    [update],
  );

  const handleColorSelect = useCallback(
    (c: string) => update('color', c),
    [update],
  );

  const handleLabelChange = useCallback(
    (v: string) => update('label', v),
    [update],
  );

  const handleCommandChange = useCallback(
    (v: string) => update('command', v),
    [update],
  );

  const handleSliderChange = useCallback((v: number) => {
    setLocalSize(Math.round(v / 5) * 5);
  }, []);

  const handleSliderComplete = useCallback(
    (v: number) => {
      const rounded = Math.round(v / 5) * 5;
      setLocalSize(rounded);
      update('size', rounded);
    },
    [update],
  );

  return (
    <View>
      {/* Drag handle */}
      <View style={styles.handleWrap}>
        <View style={styles.handle} />
      </View>

      {/* Título + fechar */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t('custom_form_title')}</Text>
        <View style={{ position: 'relative' }}>
          <View style={styles.closeShadow} />
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <X size={18} color={Colors.dark} strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLandscape ? (
          // ── Layout landscape: ícone+cores à esquerda | campos à direita ──
          <View style={styles.landscapeBody}>
            {/* Coluna esquerda: preview + grade de cores */}
            <View style={styles.landscapeLeft}>
              {/* Preview */}
              <TouchableOpacity
                onPress={() => setShowIconPicker(true)}
                activeOpacity={0.85}
                style={{ position: 'relative', alignSelf: 'center' }}
              >
                <View style={styles.previewShadow} />
                <View
                  style={[
                    styles.previewBox,
                    { backgroundColor: button.color ?? '#FFD82D' },
                  ]}
                >
                  <Icon name={button.icon} size={36} color={textColor} />
                </View>
              </TouchableOpacity>

              {/* Grade de cores */}
              <View style={styles.colorGrid}>
                {PICKER_COLORS.map((c) => {
                  const isSelected = button.color === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => handleColorSelect(c)}
                      activeOpacity={0.8}
                      style={{ position: 'relative' }}
                    >
                      {isSelected && <View style={styles.colorShadow} />}
                      <View
                        style={[
                          styles.colorCell,
                          {
                            backgroundColor: c,
                            borderWidth:  isSelected ? 3 : 2,
                            borderColor:  isSelected ? Colors.dark : '#ccc',
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Coluna direita: campos NOME, COMANDO, TAMANHO e ações */}
            <View style={styles.landscapeRight}>
              {/* NOME */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t('custom_form_name')}</Text>
                <TextInput
                  style={styles.input}
                  value={button.label}
                  onChangeText={handleLabelChange}
                  placeholder={t('custom_form_name_placeholder')}
                  placeholderTextColor="#bbb"
                  maxLength={20}
                />
              </View>

              {/* COMANDO */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t('custom_form_command')}</Text>
                <TextInput
                  style={styles.input}
                  value={button.command}
                  onChangeText={handleCommandChange}
                  placeholder="Ex: up, motor_on, c90"
                  placeholderTextColor="#bbb"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={32}
                />
              </View>

              {/* TAMANHO */}
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldLabel}>{t('custom_form_size')}</Text>
                  <View style={{ position: 'relative' }}>
                    <View style={styles.badgeShadow} />
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{localSize}px</Text>
                    </View>
                  </View>
                </View>
                <Slider
                  minimumValue={60}
                  maximumValue={200}
                  step={5}
                  value={localSize}
                  onValueChange={handleSliderChange}
                  onSlidingComplete={handleSliderComplete}
                  minimumTrackTintColor="#E81C1C"
                  maximumTrackTintColor="#D9D4CA"
                  thumbTintColor="#E81C1C"
                />
              </View>

              {/* EXCLUIR + SALVAR */}
              <View style={styles.actionsRow}>
                <View style={{ flex: 1, position: 'relative' }}>
                  <View style={[styles.btnShadow, { backgroundColor: Colors.dark }]} />
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#E81C1C' }]}
                    onPress={onDelete}
                    activeOpacity={0.85}
                  >
                    <Trash2 size={16} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.actionText}>{t('custom_form_delete')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flex: 1, position: 'relative' }}>
                  <View style={[styles.btnShadow, { backgroundColor: Colors.dark }]} />
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#22C55E' }]}
                    onPress={onClose}
                    activeOpacity={0.85}
                  >
                    <Check size={16} color="#fff" strokeWidth={3} />
                    <Text style={styles.actionText}>{t('custom_save')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          // ── Layout portrait: coluna única original ──
          <>
            {/* Preview + cores */}
            <View style={styles.row}>
              {/* Preview — toque abre icon picker */}
              <TouchableOpacity
                onPress={() => setShowIconPicker(true)}
                activeOpacity={0.85}
                style={{ position: 'relative' }}
              >
                <View style={styles.previewShadow} />
                <View
                  style={[
                    styles.previewBox,
                    { backgroundColor: button.color ?? '#FFD82D' },
                  ]}
                >
                  <Icon name={button.icon} size={36} color={textColor} />
                </View>
              </TouchableOpacity>

              {/* Grade de cores */}
              <View style={styles.colorGrid}>
                {PICKER_COLORS.map((c) => {
                  const isSelected = button.color === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => handleColorSelect(c)}
                      activeOpacity={0.8}
                      style={{ position: 'relative' }}
                    >
                      {isSelected && <View style={styles.colorShadow} />}
                      <View
                        style={[
                          styles.colorCell,
                          {
                            backgroundColor: c,
                            borderWidth:  isSelected ? 3 : 2,
                            borderColor:  isSelected ? Colors.dark : '#ccc',
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* NOME */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t('custom_form_name')}</Text>
              <TextInput
                style={styles.input}
                value={button.label}
                onChangeText={handleLabelChange}
                placeholder={t('custom_form_name_placeholder')}
                placeholderTextColor="#bbb"
                maxLength={20}
              />
            </View>

            {/* COMANDO */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t('custom_form_command')}</Text>
              <TextInput
                style={styles.input}
                value={button.command}
                onChangeText={handleCommandChange}
                placeholder="Ex: up, motor_on, c90"
                placeholderTextColor="#bbb"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={32}
              />
            </View>

            {/* TAMANHO */}
            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>{t('custom_form_size')}</Text>
                <View style={{ position: 'relative' }}>
                  <View style={styles.badgeShadow} />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{localSize}px</Text>
                  </View>
                </View>
              </View>
              <Slider
                minimumValue={60}
                maximumValue={200}
                step={5}
                value={localSize}
                onValueChange={handleSliderChange}
                onSlidingComplete={handleSliderComplete}
                minimumTrackTintColor="#E81C1C"
                maximumTrackTintColor="#D9D4CA"
                thumbTintColor="#E81C1C"
              />
            </View>

            {/* EXCLUIR + SALVAR */}
            <View style={styles.actionsRow}>
              <View style={{ flex: 1, position: 'relative' }}>
                <View style={[styles.btnShadow, { backgroundColor: Colors.dark }]} />
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#E81C1C' }]}
                  onPress={onDelete}
                  activeOpacity={0.85}
                >
                  <Trash2 size={16} color="#fff" strokeWidth={2.5} />
                  <Text style={styles.actionText}>{t('custom_form_delete')}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, position: 'relative' }}>
                <View style={[styles.btnShadow, { backgroundColor: Colors.dark }]} />
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#22C55E' }]}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Check size={16} color="#fff" strokeWidth={3} />
                  <Text style={styles.actionText}>{t('custom_save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {showIconPicker && (
        <IconPickerModal
          selected={button.icon}
          onSelect={handleIconSelect}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </View>
  );
}

export default memo(ButtonFormPanel);

const styles = StyleSheet.create({
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#ccc',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: Colors.dark,
  },
  title: {
    fontFamily: FontFamily.title,
    fontSize: 22,
    color: Colors.dark,
  },
  closeShadow: {
    position: 'absolute',
    top: 3, left: 3, right: -3, bottom: -3,
    backgroundColor: Colors.dark,
  },
  closeBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    maxHeight: 460,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    padding: 20,
    gap: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  // Landscape layout
  landscapeBody: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  landscapeLeft: {
    width: 120,
    gap: 12,
    alignItems: 'center',
  },
  landscapeRight: {
    flex: 1,
    gap: 14,
  },
  previewShadow: {
    position: 'absolute',
    top: 4, left: 4, right: -4, bottom: -4,
    backgroundColor: Colors.dark,
  },
  previewBox: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  colorGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorShadow: {
    position: 'absolute',
    top: 3, left: 3, right: -3, bottom: -3,
    backgroundColor: Colors.dark,
  },
  colorCell: {
    width: 44,
    height: 44,
  },
  field: {
    gap: 6,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontFamily: FontFamily.monoBold,
    fontSize: 10,
    color: '#888',
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.dark,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: FontFamily.medium,
    fontSize: 15,
    color: Colors.dark,
  },
  badgeShadow: {
    position: 'absolute',
    top: 3, left: 3, right: -3, bottom: -3,
    backgroundColor: Colors.dark,
  },
  badge: {
    backgroundColor: '#E81C1C',
    borderWidth: 2,
    borderColor: Colors.dark,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 12,
    color: '#fff',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  btnShadow: {
    position: 'absolute',
    top: 4, left: 4, right: -4, bottom: -4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  actionText: {
    fontFamily: FontFamily.title,
    fontSize: 13,
    color: '#fff',
    letterSpacing: 1,
  },
});