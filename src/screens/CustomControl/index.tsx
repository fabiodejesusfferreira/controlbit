import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  LayoutChangeEvent,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Save,
  Play,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ControlButton, ControlProfile } from '../../types/control.types';
import { CommandStorage } from '../../services/storage';
import DraggableButton from '../../components/DraggableButton';
import ProfilePickerModal from '../../components/ProfilePickerModal';
import BluetoothStatusButton from '../../components/BluetoothButton';
import ButtonFormPanel from './ButtonFormPanel';
import { Colors, FontFamily, Shadow } from '../../constants/theme';
import { RootStackNavigationProp } from '../../types/navigation.types';

export default function CustomControl() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();

  const [profiles, setProfiles] = useState<ControlProfile[]>([]);
  const [activeId, setActiveId] = useState('preset_car');
  const [buttons, setButtons] = useState<ControlButton[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [showButtonForm, setShowButtonForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 400 });

  const loadData = useCallback(async () => {
    const [allProfiles, active] = await Promise.all([
      CommandStorage.getProfiles(),
      CommandStorage.getActiveProfile(),
    ]);
    setProfiles(allProfiles);
    setActiveId(active.id);
    setButtons(active.buttons.map((b) => ({ ...b })));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeProfile = profiles.find((p) => p.id === activeId);

  const handleSelectProfile = async (id: string) => {
    await CommandStorage.setActiveProfileId(id);
    await loadData();
    setFocusedId(null);
    setShowButtonForm(false);
  };

  const addButton = () => {
    if (buttons.length >= 12) return;
    const newBtn: ControlButton = {
      id: `btn_${Date.now()}`,
      icon: 'zap',
      command: 'cmd',
      label: 'Botão',
      x: 20 + (buttons.length % 4) * 90,
      y: 20 + Math.floor(buttons.length / 4) * 100,
      size: 80,
      color: '#FFE500',
    };
    setButtons((prev) => [...prev, newBtn]);
    setFocusedId(newBtn.id);
    setShowButtonForm(true);
  };

  const handleMove = (id: string, x: number, y: number) => {
    setButtons((prev) => prev.map((b) => (b.id === id ? { ...b, x, y } : b)));
  };

  const handleFocus = (id: string) => {
    if (focusedId === id) {
      setShowButtonForm(true);
    } else {
      setFocusedId(id);
      setShowButtonForm(true);
    }
  };

  const handleButtonChange = (updated: ControlButton) => {
    setButtons((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleDeleteButton = (id: string) => {
    setButtons((prev) => prev.filter((b) => b.id !== id));
    setFocusedId(null);
    setShowButtonForm(false);
  };

  const handleSave = async () => {
    await CommandStorage.saveButtonsToActiveProfile(buttons);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePlay = async () => {
    await handleSave();
    navigation.navigate('customplay');
  };

  const focusedButton = buttons.find((b) => b.id === focusedId);

  const onCanvasLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#7B2FFF" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, Shadow.neoSmall]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color={Colors.dark} strokeWidth={3} />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>EDITOR</Text>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => setShowProfilePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.profileName} numberOfLines={1}>
              {activeProfile?.name ?? '—'}
            </Text>
            <ChevronDown size={12} color="#c4b5fd" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <BluetoothStatusButton />
      </View>

      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <View style={styles.toolbar}>
        <Text style={styles.countLabel}>{buttons.length}/12 botões</Text>
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: '#FFE500' }, Shadow.neoSmall]}
            onPress={addButton}
            disabled={buttons.length >= 12}
            activeOpacity={0.8}
          >
            <Plus size={14} strokeWidth={3} color={Colors.dark} />
            <Text style={[styles.toolBtnText, { color: Colors.dark }]}>BOTÃO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: '#00C851' }, Shadow.neoSmall]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            {saved ? (
              <Check size={14} color="#fff" strokeWidth={3} />
            ) : (
              <Save size={14} color="#fff" strokeWidth={2.5} />
            )}
            <Text style={[styles.toolBtnText, { color: '#fff' }]}>
              {saved ? 'SALVO!' : 'SALVAR'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: '#0066FF' }, Shadow.neoSmall]}
            onPress={handlePlay}
            activeOpacity={0.8}
          >
            <Play size={14} color="#fff" strokeWidth={2.5} />
            <Text style={[styles.toolBtnText, { color: '#fff' }]}>PLAY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Canvas ─────────────────────────────────────────────────── */}
      <View
        style={styles.canvas}
        onLayout={onCanvasLayout}
        onTouchEnd={(e) => {
          if (e.target === e.currentTarget) {
            setFocusedId(null);
          }
        }}
      >
        {buttons.map((btn) => (
          <DraggableButton
            key={btn.id}
            button={btn}
            editMode
            focused={focusedId === btn.id}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            onMove={handleMove}
            onFocus={handleFocus}
          />
        ))}

        {buttons.length === 0 && (
          <View style={styles.emptyState} pointerEvents="none">
            <View style={[styles.emptyIcon, Shadow.neoSmall]}>
              <Plus size={28} color="#ccc" strokeWidth={2.5} />
            </View>
            <Text style={styles.emptyTitle}>Adicione botões acima</Text>
            <Text style={styles.emptySub}>Máx. 12 botões por perfil</Text>
          </View>
        )}
      </View>

      {/* ── Hint ───────────────────────────────────────────────────── */}
      <View style={styles.hintBar}>
        <Text style={styles.hintText}>
          ARRASTE para mover · TOQUE para editar
        </Text>
      </View>

      {/* ── Modal: Editar Botão ─────────────────────────────────────── */}
      <Modal
        visible={showButtonForm && focusedButton !== undefined}
        transparent
        animationType="slide"
        onRequestClose={() => setShowButtonForm(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowButtonForm(false)}
          />
          {focusedButton && (
            <View style={styles.modalSheet}>
              <ButtonFormPanel
                button={focusedButton}
                onChange={handleButtonChange}
                onDelete={() => handleDeleteButton(focusedButton.id)}
                onClose={() => setShowButtonForm(false)}
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal: Perfis ─────────────────────────────────────────── */}
      {showProfilePicker && (
        <ProfilePickerModal
          profiles={profiles}
          activeId={activeId}
          onClose={() => setShowProfilePicker(false)}
          onSelect={handleSelectProfile}
          onRefresh={loadData}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#7B2FFF',
    borderBottomWidth: 3,
    borderBottomColor: Colors.dark,
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#FFE500',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontFamily: FontFamily.title,
    fontSize: 15,
    color: '#fff',
    lineHeight: 18,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  profileName: {
    fontFamily: FontFamily.title,
    fontSize: 11,
    color: '#c4b5fd',
    maxWidth: 140,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 3,
    borderBottomColor: Colors.dark,
    backgroundColor: Colors.bg,
  },
  countLabel: {
    fontFamily: FontFamily.monoBold,
    fontSize: 9,
    color: '#888',
    flex: 1,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  toolBtnText: {
    fontFamily: FontFamily.title,
    fontSize: 11,
  },
  canvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F5F0E8',
    overflow: 'hidden',
  },
  emptyState: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: FontFamily.title,
    fontSize: 14,
    color: '#aaa',
  },
  emptySub: {
    fontFamily: FontFamily.mono,
    fontSize: 11,
    color: '#bbb',
  },
  hintBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 3,
    borderTopColor: Colors.dark,
    backgroundColor: '#fff',
  },
  hintText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 9,
    color: '#aaa',
    textAlign: 'center',
  },
  // Modal de edição de botão
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalSheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 3,
    borderColor: Colors.dark,
    borderBottomWidth: 0,
    shadowColor: Colors.dark,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 20,
    paddingBottom: 24,
  },
});