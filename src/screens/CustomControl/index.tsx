import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  LayoutChangeEvent,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, Plus, Save, Play, ChevronDown, Check,
  RotateCcw,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ControlButton, ControlProfile } from '../../types/control.types';
import { CommandStorage } from '../../services/storage';
import DraggableButton from '../../components/DraggableButton';
import ProfilePickerModal from '../../components/ProfilePickerModal';
import BluetoothStatusButton from '../../components/BluetoothButton';
import ButtonFormPanel from './ButtonFormPanel';
import { Colors, FontFamily } from '../../constants/theme';
import { RootStackNavigationProp } from '../../types/navigation.types';
import { useScreenOrientation } from '../../hooks/useScreenOrientation';

export default function CustomControl() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();

  // ── Orientação ──────────────────────────────────────────────────────────────
  const { orientation, toggle, isLandscape } = useScreenOrientation('portrait');

  // ── Ocultar bottom tabs no landscape ────────────────────────────────────────
  useEffect(() => {
    if (isLandscape) {
      navigation.setOptions({
        tabBarStyle: { display: 'none' }
      } as any);
    } else {
      // Retorna ao estilo original definido no seu routes.tsx
      navigation.setOptions({
        tabBarStyle: {
          borderTopWidth: 3,
          borderTopColor: Colors.dark,
          backgroundColor: Colors.bg,
          display: 'flex',
        },
      } as any);
    }

    return () => {
      navigation.setOptions({
        tabBarStyle: {
          borderTopWidth: 3,
          borderTopColor: Colors.dark,
          backgroundColor: Colors.bg,
          display: 'flex',
        },
      } as any);
    };
  }, [isLandscape, navigation]);

  // ── Ocultar navigation bar do Android (botões sistema) no landscape ──────────
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const NavBar = require('expo-navigation-bar');
        if (isLandscape) {
          await NavBar.setVisibilityAsync('hidden');
          await NavBar.setBehaviorAsync('overlay-swipe');
          cleanup = async () => { await NavBar.setVisibilityAsync('visible'); };
        } else {
          await NavBar.setVisibilityAsync('visible');
        }
      } catch (_) {
        // expo-navigation-bar não instalado — silencioso
      }
    })();
    return () => { cleanup?.(); };
  }, [isLandscape]);

  const [profiles, setProfiles] = useState<ControlProfile[]>([]);
  const [activeId, setActiveId] = useState('preset_car');
  const [buttons, setButtons] = useState<ControlButton[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [showButtonForm, setShowButtonForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 400 });

  // ── Dimensões da tela para landscape full-screen ─────────────────────────────
  const screenDims = Dimensions.get('screen');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isSaving = useRef(false);

  // ── Carregar dados ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    const [allProfiles, active] = await Promise.all([
      CommandStorage.getProfiles(),
      CommandStorage.getActiveProfile(),
    ]);
    setProfiles(allProfiles);
    setActiveId(active.id);
    setButtons((prev) => {
      const same =
        prev.length === active.buttons.length &&
        prev.every((b, i) => b.id === active.buttons[i]?.id);
      return same ? prev : active.buttons.map((b) => ({ ...b }));
    });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const activeProfile = profiles.find((p) => p.id === activeId);

  const handleProfileSelect = useCallback(async (id: string) => {
    setActiveId(id);
    await loadData();
    setFocusedId(null);
    setShowButtonForm(false);
  }, [loadData]);

  // ── Botões ──────────────────────────────────────────────────────────────────
  const addButton = useCallback(() => {
    if (buttons.length >= 12) return;
    const newBtn: ControlButton = {
      id: `btn_${Date.now()}`,
      icon: 'zap',
      command: 'cmd',
      label: 'Botão',
      x: 20 + (buttons.length % 4) * 90,
      y: 20 + Math.floor(buttons.length / 4) * 100,
      size: 80,
      color: '#FFD82D',
    };
    setButtons((prev) => [...prev, newBtn]);
    setFocusedId(newBtn.id);
    setShowButtonForm(true);
  }, [buttons.length]);

  const handleMove = useCallback((id: string, x: number, y: number) => {
    setButtons((prev) => prev.map((b) => (b.id === id ? { ...b, x, y } : b)));
  }, []);

  const handleFocus = useCallback((id: string) => {
    setFocusedId(id);
    setShowButtonForm(true);
  }, []);

  const handleButtonChange = useCallback((updated: ControlButton) => {
    setButtons((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, []);

  const handleDeleteButton = useCallback((id: string) => {
    setButtons((prev) => prev.filter((b) => b.id !== id));
    setFocusedId(null);
    setShowButtonForm(false);
  }, []);

  // ── Salvar ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (isSaving.current) return;
    isSaving.current = true;
    await CommandStorage.saveButtonsToActiveProfile(buttons);
    setSaved(true);
    isSaving.current = false;
    setTimeout(() => setSaved(false), 2000);
  }, [buttons]);

  // ── Play com fade ───────────────────────────────────────────────────────────
  const handlePlay = useCallback(async () => {
    await handleSave();
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 220, useNativeDriver: true,
    }).start(() => {
      navigation.navigate('customplay');
      setTimeout(() => {
        fadeAnim.setValue(0);
      }, 500);
    });
  }, [handleSave, navigation, fadeAnim]);

  const focusedButton = buttons.find((b) => b.id === focusedId);

  const onCanvasLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View
      style={[
        styles.screen,
        isLandscape
          ? StyleSheet.absoluteFill
          : { paddingTop: insets.top },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark}
        hidden={isLandscape}
      />

      {/* ── Header — oculto no landscape ───────────────────────────── */}
      {!isLandscape && (
        <View style={styles.header}>
          <NeoShadow color="#000" offset={4} />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={18} color={Colors.dark} strokeWidth={3} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>EDITOR</Text>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => setShowProfilePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.profilePrefix}>PERFIL: </Text>
              <Text style={styles.profileName} numberOfLines={1}>
                {activeProfile?.name ?? '—'}
              </Text>
              <ChevronDown size={11} color="#aaa" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <BluetoothStatusButton />
        </View>
      )}

      {/* ── Toolbar — oculta no landscape ──────────────────────────── */}
      {!isLandscape && (
        <View style={styles.toolbar}>
          <Text style={styles.countLabel}>{buttons.length}/12 botões</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <ToolbarBtn
              label="BOTÃO"
              bg="#FFD82D"
              textColor={Colors.dark}
              icon={<Plus size={13} strokeWidth={3} color={Colors.dark} />}
              onPress={addButton}
              disabled={buttons.length >= 12}
            />
            <ToolbarBtn
              label={saved ? 'SALVO!' : 'SALVAR'}
              bg="#1C37B5"
              textColor="#fff"
              icon={saved
                ? <Check size={13} color="#fff" strokeWidth={3} />
                : <Save size={13} color="#fff" strokeWidth={2.5} />}
              onPress={handleSave}
            />
            <ToolbarBtn
              label="PLAY"
              bg="#E81C1C"
              textColor="#fff"
              icon={<Play size={13} color="#fff" strokeWidth={2.5} fill="#fff" />}
              onPress={handlePlay}
            />
          </View>
        </View>
      )}

      {/* ── Canvas ─────────────────────────────────────────────────── */}
      <View
        style={[
          styles.canvas,
          isLandscape && {
            width: screenDims.width,
            height: screenDims.height,
          },
        ]}
        onLayout={onCanvasLayout}
        onTouchEnd={(e) => {
          if (e.target === e.currentTarget) setFocusedId(null);
        }}
      >
        {isLandscape
          ? <DotGridLandscape w={screenDims.width} h={screenDims.height} />
          : <DotGrid />}

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
            <View style={styles.emptyIcon}>
              <Plus size={28} color="#ccc" strokeWidth={2.5} />
            </View>
            <Text style={styles.emptyTitle}>Adicione botões acima</Text>
            <Text style={styles.emptySub}>Máx. 12 botões por perfil</Text>
          </View>
        )}

        {/* ── FABs flutuantes ────────────────────────────────────── */}
        <View style={styles.fabColumn}>
          {/* Orientação */}
          <FAB onPress={toggle} bg="#1C37B5">
            <RotateCcw size={18} color="#fff" strokeWidth={2.5} />
          </FAB>

          {/* Landscape: botões de toolbar como FABs */}
          {isLandscape && (
            <>
              <FAB onPress={addButton} bg="#FFD82D" disabled={buttons.length >= 12}>
                <Plus size={18} strokeWidth={3} color={Colors.dark} />
              </FAB>
              <FAB onPress={handleSave} bg={saved ? '#22C55E' : '#1C37B5'}>
                {saved
                  ? <Check size={16} color="#fff" strokeWidth={3} />
                  : <Save size={16} color="#fff" strokeWidth={2.5} />}
              </FAB>
              <FAB onPress={handlePlay} bg="#E81C1C">
                <Play size={16} color="#fff" strokeWidth={2.5} fill="#fff" />
              </FAB>
              {/* Profile picker no landscape */}
              <FAB onPress={() => setShowProfilePicker(true)} bg={Colors.dark}>
                <ChevronDown size={16} color="#FFD82D" strokeWidth={2.5} />
              </FAB>
            </>
          )}
        </View>
      </View>

      {/* ── Hint — oculto no landscape ─────────────────────────────── */}
      {!isLandscape && (
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>
            Arraste para mover  •  TOQUE para editar
          </Text>
        </View>
      )}

      {/* ── Fade overlay (Play) ─────────────────────────────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: fadeAnim }]}
      />

      {/* ── Modal: Editar Botão ─────────────────────────────────────── */}
      <Modal
        visible={showButtonForm && !!focusedButton}
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
          onSelect={handleProfileSelect}
          onRefresh={loadData}
        />
      )}
    </View>
  );
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

/** Botão da toolbar com sombra neo */
function ToolbarBtn({
  label, bg, textColor, icon, onPress, disabled,
}: {
  label: string;
  bg: string;
  textColor: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ position: 'relative' }}>
      <View style={[styles.toolBtnShadow, { backgroundColor: Colors.dark }]} />
      <TouchableOpacity
        style={[styles.toolBtn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {icon}
        <Text style={[styles.toolBtnText, { color: textColor }]}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

/** FAB flutuante com sombra neo */
function FAB({
  onPress,
  bg,
  children,
  disabled,
}: {
  onPress: () => void;
  bg: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <View style={{ position: 'relative', width: 44, height: 44 }}>
      {/* Sombra sólida */}
      <View
        style={{
          position: 'absolute',
          top: 4, left: 4, right: -4, bottom: -4,
          backgroundColor: Colors.dark,
        }}
      />
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
        style={{
          width: 44,
          height: 44,
          backgroundColor: bg,
          borderWidth: 3,
          borderColor: Colors.dark,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
}

/** Sombra inline para o header back button */
function NeoShadow({ color, offset }: { color: string; offset: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        top: offset, left: offset,
        right: -offset, bottom: -offset,
        backgroundColor: color,
      }}
    />
  );
}

/** DotGrid portrait — SVG pattern que preenche o canvas flex:1 */
const DotGrid = React.memo(() => (
  <View
    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    pointerEvents="none"
  >
    <Svg width="100%" height="100%">
      <Defs>
        <Pattern
          id="dotgrid-p"
          x="0" y="0"
          width="23" height="23"
          patternUnits="userSpaceOnUse"
        >
          <Circle cx="3" cy="3" r="1.5" fill="#B0A898" opacity={0.4} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#dotgrid-p)" />
    </Svg>
  </View>
));

/**
 * DotGridLandscape — recebe as dimensões exatas do canvas landscape
 * (as mesmas passadas ao style do canvas View) para preencher com precisão.
 */
const DotGridLandscape = React.memo(({ w, h }: { w: number; h: number }) => (
  <View
    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    pointerEvents="none"
  >
    <Svg width={w} height={h}>
      <Defs>
        <Pattern
          id="dotgrid-l"
          x="0" y="0"
          width="23" height="23"
          patternUnits="userSpaceOnUse"
        >
          <Circle cx="3" cy="3" r="1.5" fill="#B0A898" opacity={0.4} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width={w} height={h} fill="url(#dotgrid-l)" />
    </Svg>
  </View>
));

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.dark,
    borderBottomWidth: 3,
    borderBottomColor: Colors.dark,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#FFD82D',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.title,
    fontSize: 15,
    color: '#fff',
    letterSpacing: 2,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  profilePrefix: {
    fontFamily: FontFamily.monoBold,
    fontSize: 10,
    color: '#FFD82D',
  },
  profileName: {
    fontFamily: FontFamily.title,
    fontSize: 10,
    color: '#fff',
    maxWidth: 140,
  },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: Colors.dark,
    backgroundColor: Colors.bg,
    gap: 8,
  },
  countLabel: {
    fontFamily: FontFamily.monoBold,
    fontSize: 9,
    color: '#888',
    flex: 1,
  },
  toolBtnShadow: {
    position: 'absolute',
    top: 3, left: 3, right: -3, bottom: -3,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: Colors.dark,
  },
  toolBtnText: {
    fontFamily: FontFamily.title,
    fontSize: 11,
  },

  // Canvas
  canvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F0EBE0',
    overflow: 'hidden',
  },

  // FABs — coluna no canto superior esquerdo
  fabColumn: {
    position: 'absolute',
    top: 12,
    left: 36,
    gap: 10,
    alignItems: 'center',
  },

  // Empty state
  emptyState: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
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

  // Hint bar
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

  // Modal
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
    paddingBottom: 24,
  },
});