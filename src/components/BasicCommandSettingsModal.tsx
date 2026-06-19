import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  EmitterSubscription,
} from 'react-native';
import { X, Save } from 'lucide-react-native';
import { Colors, FontFamily, Shadow } from '../constants/theme';
import { BasicCommands, DEFAULT_BASIC_COMMANDS } from '../services/basicCommandStorage';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  visible: boolean;
  commands: BasicCommands;
  onSave: (commands: BasicCommands) => void;
  onClose: () => void;
}

export default function BasicCommandSettingsModal({ visible, commands, onSave, onClose }: Props) {
  const { t } = useLanguage();
  const [localCommands, setLocalCommands] = useState<BasicCommands>(commands);

  // --- FIX: manual keyboard tracking for Android ---
  // Inside a Modal, Android renders a separate native Dialog window that
  // does not respect the Activity's windowSoftInputMode, so
  // KeyboardAvoidingView's onLayout-based math is unreliable there.
  // We bypass it on Android by listening to keyboard events ourselves and
  // pushing the sheet up by exactly the keyboard height.
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let showSub: EmitterSubscription;
    let hideSub: EmitterSubscription;

    showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Reset whenever the modal closes, so it doesn't reopen already shifted
  useEffect(() => {
    if (!visible) setKeyboardHeight(0);
  }, [visible]);
  // --- end fix ---

  const handleChange = (key: keyof BasicCommands, value: string) => {
    setLocalCommands(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localCommands);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.kav,
            // On Android we do the lifting ourselves instead of letting KAV try
            Platform.OS === 'android' && { marginBottom: keyboardHeight },
          ]}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => { }}>
            {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('basic_settings_title')}</Text>
            <TouchableOpacity
              style={[styles.closeBtn, Shadow.neoSmall]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={18} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Form */}
          <ScrollView
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('basic_settings_up')}</Text>
              <TextInput
                style={styles.input}
                value={localCommands.up}
                onChangeText={(val) => handleChange('up', val)}
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('basic_settings_down')}</Text>
              <TextInput
                style={styles.input}
                value={localCommands.down}
                onChangeText={(val) => handleChange('down', val)}
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('basic_settings_left')}</Text>
              <TextInput
                style={styles.input}
                value={localCommands.left}
                onChangeText={(val) => handleChange('left', val)}
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('basic_settings_right')}</Text>
              <TextInput
                style={styles.input}
                value={localCommands.right}
                onChangeText={(val) => handleChange('right', val)}
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('basic_settings_horn')}</Text>
              <TextInput
                style={styles.input}
                value={localCommands.horn}
                onChangeText={(val) => handleChange('horn', val)}
                maxLength={20}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('basic_settings_stop')}</Text>
              <TextInput
                style={styles.input}
                value={localCommands.stop}
                onChangeText={(val) => handleChange('stop', val)}
                maxLength={20}
              />
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, Shadow.neoSmall]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Save size={18} color="#fff" strokeWidth={2.5} />
              <Text style={styles.saveText}>{t('basic_settings_save')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  kav: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bg,
    borderWidth: 3,
    borderColor: Colors.dark,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    shadowColor: Colors.dark,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: FontFamily.title,
    fontSize: 20,
    color: Colors.dark,
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#FF2D2D',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 3,
    backgroundColor: Colors.dark,
    marginHorizontal: 20,
  },
  form: {
    padding: 20,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: FontFamily.monoBold,
    fontSize: 12,
    color: Colors.dark,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: Colors.dark,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FontFamily.mono,
    fontSize: 14,
    color: Colors.dark,
  },
  footer: {
    padding: 20,
    paddingBottom: 60,
    borderTopWidth: 3,
    borderTopColor: Colors.dark,
    backgroundColor: '#F5F0E8',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C851',
    borderWidth: 3,
    borderColor: Colors.dark,
    paddingVertical: 14,
    gap: 8,
  },
  saveText: {
    fontFamily: FontFamily.title,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 2,
  },
});