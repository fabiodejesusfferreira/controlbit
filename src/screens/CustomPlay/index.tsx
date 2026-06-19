import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  LayoutChangeEvent,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Pencil,
  Activity,
  StopCircle,
} from 'lucide-react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ControlButton, ControlProfile } from '../../types/control.types';
import { CommandStorage } from '../../services/storage';
import { useBluetooth } from '../../context/BluetoothContext';
import DraggableButton from '../../components/DraggableButton';
import BluetoothStatusButton from '../../components/BluetoothButton';
import { Colors, FontFamily } from '../../constants/theme';
import { RootStackParamList } from '../../types/root-param-list';
import { RootStackNavigationProp } from '../../types/navigation.types';
import { useScreenOrientation } from '../../hooks/useScreenOrientation';
import { useLanguage } from '../../context/LanguageContext';
import MobileRotateIcon from '../../components/icons/MobileRotateIcon';

export default function CustomPlay() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'customplay'>>();
  const insets = useSafeAreaInsets();
  const { sendCommand, isConnected } = useBluetooth();
  const { t } = useLanguage();

  const initialOrientation = route.params?.initialOrientation || 'portrait';
  // Inicia com a orientação passada por param (da tela anterior) ou portrait
  const { orientation, toggle, isLandscape, set } = useScreenOrientation(initialOrientation);

  const [profile, setProfile] = useState<ControlProfile | null>(null);
  const [buttons, setButtons] = useState<ControlButton[]>([]);
  const [activeCmd, setActiveCmd] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 500 });

  // Animação do botão STOP ao pressionar
  const stopAnim = useRef(new Animated.Value(0)).current;

  // ── Carregar perfil ─────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    const active = await CommandStorage.getActiveProfile(t);
    setProfile(active);
    setButtons(active.buttons.map((b) => ({ ...b })));
    // Aplica orientação salva no perfil se não veio de parâmetro
    if (active.orientation && !route.params?.initialOrientation) {
      set(active.orientation);
    }
  }, [set, route.params?.initialOrientation]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handlePress = useCallback((cmd: string) => {
    setActiveCmd(cmd);
    sendCommand(cmd);
  }, [sendCommand]);

  const handleRelease = useCallback(() => {
    setActiveCmd('');
    sendCommand('stop');
  }, [sendCommand]);

  const handleStop = useCallback(() => {
    // Animação de press no botão stop
    Animated.sequence([
      Animated.timing(stopAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(stopAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
    setActiveCmd('stop');
    sendCommand('stop');
    setTimeout(() => setActiveCmd(''), 300);
  }, [sendCommand, stopAnim]);

  const handleGoBack = useCallback(() => {
    if (route.params?.onReturn) {
      route.params.onReturn(isLandscape ? 'landscape' : 'portrait');
    }
    navigation.goBack();
  }, [navigation, route.params, isLandscape]);

  const onCanvasLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  }, []);

  // TX bar: muda cor conforme comando ativo
  const txBg = activeCmd ? '#1A1A1A' : '#E5E0D5';
  const txTextColor = activeCmd ? '#FFD82D' : '#999';

  // Translate do botão stop ao pressionar
  const stopTranslate = stopAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark}
        hidden={isLandscape}
      />

      {/* ── Header — oculto no landscape ───────────────────────────── */}
      {!isLandscape && (
        <View style={[styles.header, { paddingTop: insets.top }]}>
          {/* Back */}
          <View style={{ position: 'relative' }}>
            <View style={styles.fabShadowAbs} />
            <TouchableOpacity
              style={styles.backBtn}
              onPress={handleGoBack}
              activeOpacity={0.8}
            >
              <ArrowLeft size={18} color={Colors.dark} strokeWidth={3} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {profile?.name?.toUpperCase() ?? t('custom_play_default_car')}
            </Text>
            <Text style={styles.headerSub}>{t('custom_play_mode')}</Text>
          </View>

          {/* Editar */}
          <View style={{ position: 'relative', marginRight: 8 }}>
            <View style={styles.fabShadowAbs} />
            <TouchableOpacity
              style={[styles.headerIconBtn, { backgroundColor: '#1C37B5' }]}
              onPress={handleGoBack}
              activeOpacity={0.8}
            >
              <Pencil size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <BluetoothStatusButton />
        </View>
      )}

      {/* ── TX Indicator — oculto no landscape ─────────────────────── */}
      {!isLandscape && (
        <View style={[styles.txBar, { backgroundColor: txBg }]}>
          <Activity size={14} color={txTextColor} strokeWidth={2.5} />
          <Text style={[styles.txText, { color: txTextColor }]}>
            {activeCmd ? activeCmd.toUpperCase() : t('custom_play_waiting')}
          </Text>
          {!isConnected && (
            <Text style={styles.simLabel}>{t('basic_simulating')}</Text>
          )}
        </View>
      )}

      {/* ── Canvas ─────────────────────────────────────────────────── */}
      <View style={styles.canvas} onLayout={onCanvasLayout}>
        {buttons.map((btn) => (
          <DraggableButton
            key={btn.id}
            button={btn}
            editMode={false}
            focused={false}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            onPress={() => handlePress(btn.command)}
            onRelease={handleRelease}
          />
        ))}

        {buttons.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('custom_play_empty_title')}</Text>
            <Text style={styles.emptySub}>
              {t('custom_play_empty_sub')}
            </Text>
          </View>
        )}

        {/* ── FABs flutuantes — sempre visíveis ───────────────────── */}
        <View
          style={[
            styles.fabColumn,
            // No landscape, respeita inset lateral (notch)
            isLandscape && { top: 16, left: insets.left + 12 },
          ]}
        >
          {/* Orientação */}
          <PlayFAB onPress={toggle} bg="#1C37B5">
            <MobileRotateIcon color="#fff" />
          </PlayFAB>

          {/* STOP flutuante */}
          <PlayFAB onPress={handleStop} bg="#E81C1C">
            <StopCircle size={18} color="#fff" strokeWidth={2.5} />
          </PlayFAB>

          {/* No landscape: botão de editar e BT também viram FABs */}
          {isLandscape && (
            <>
              <PlayFAB onPress={handleGoBack} bg="#FFD82D">
                <Pencil size={16} color={Colors.dark} strokeWidth={2.5} />
              </PlayFAB>
            </>
          )}
        </View>

        {/* TX mini badge no landscape */}
        {isLandscape && activeCmd !== '' && (
          <View style={styles.txBadge}>
            <Text style={styles.txBadgeText}>{activeCmd.toUpperCase()}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── FAB do play ──────────────────────────────────────────────────────────────
function PlayFAB({
  onPress,
  bg,
  children,
}: {
  onPress: () => void;
  bg: string;
  children: React.ReactNode;
}) {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const onIn = () =>
    Animated.timing(pressAnim, { toValue: 1, duration: 60, useNativeDriver: true }).start();
  const onOut = () =>
    Animated.timing(pressAnim, { toValue: 0, duration: 80, useNativeDriver: true }).start();

  const translate = pressAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, 3],
  });

  return (
    <View style={{ position: 'relative', width: 48, height: 48 }}>
      {/* Sombra sólida */}
      <View
        style={{
          position: 'absolute',
          top: 4, left: 4, right: -4, bottom: -4,
          backgroundColor: Colors.dark,
        }}
      />
      <Animated.View style={{ transform: [{ translateX: translate }, { translateY: translate }] }}>
        <TouchableOpacity
          onPressIn={onIn}
          onPressOut={onOut}
          onPress={onPress}
          activeOpacity={1}
          style={{
            width: 48,
            height: 48,
            backgroundColor: bg,
            borderWidth: 3,
            borderColor: Colors.dark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

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
    paddingBottom: 10,
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
  headerIconBtn: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.title,
    fontSize: 14,
    color: '#fff',
    letterSpacing: 1.5,
  },
  headerSub: {
    fontFamily: FontFamily.monoBold,
    fontSize: 9,
    color: '#FFD82D',
    letterSpacing: 2,
    marginTop: 1,
  },

  // Sombra absoluta reutilizável
  fabShadowAbs: {
    position: 'absolute',
    top: 4, left: 4, right: -4, bottom: -4,
    backgroundColor: '#000',
  },

  // TX bar
  txBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark,
    gap: 8,
  },
  txText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 11,
    flex: 1,
  },
  simLabel: {
    fontFamily: FontFamily.monoBold,
    fontSize: 9,
    color: '#f87171',
  },

  // Canvas
  canvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F5F0E8',
  },

  // FABs — coluna superior esquerda dentro do canvas
  fabColumn: {
    position: 'absolute',
    top: 12,
    left: 12,
    gap: 10,
    alignItems: 'center',
    // zIndex garante que ficam acima dos botões do usuário
    zIndex: 100,
  },

  // TX badge no landscape
  txBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: Colors.dark,
    borderWidth: 2,
    borderColor: '#FFD82D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 100,
  },
  txBadgeText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 11,
    color: '#FFD82D',
  },

  // Empty state
  emptyState: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FontFamily.title,
    fontSize: 14,
    color: '#bbb',
  },
  emptySub: {
    fontFamily: FontFamily.mono,
    fontSize: 11,
    color: '#ccc',
  },

  // Botão PARAR (portrait)
  stopShadow: {
    position: 'absolute',
    top: 4, left: 0, right: 0, bottom: -4,
    backgroundColor: '#7B0000',
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E81C1C',
    borderTopWidth: 3,
    borderTopColor: Colors.dark,
    paddingVertical: 18,
    gap: 12,
  },
  stopText: {
    fontFamily: FontFamily.title,
    fontSize: 18,
    color: '#fff',
    letterSpacing: 2,
  },
});