import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { BluetoothOff, Settings, X } from 'lucide-react-native';
import { Colors, FontFamily, Shadow } from '../constants/theme';

interface Props {
  onClose: () => void;
}

export default function BluetoothOffModal({ onClose }: Props) {
  // Animação de slide up
  const slideAnim = useRef(new Animated.Value(400)).current;
  // Animação de pulso no ícone
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide up
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Pulso no ícone
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const steps = [
    { num: '1', text: 'Abra as\nConfigurações' },
    { num: '2', text: 'Toque em\nBluetooth' },
    { num: '3', text: 'Ative\no Bluetooth' },
    { num: '4', text: 'Volte e\nconecte' },
  ];

  return (
    <Modal
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Ícone pulsante */}
              <Animated.View
                style={[
                  styles.iconWrap,
                  Shadow.neoSmall,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <BluetoothOff size={22} color="#fff" strokeWidth={2.5} />
              </Animated.View>
              <View>
                <Text style={styles.headerTitle}>BLUETOOTH DESLIGADO</Text>
                <Text style={styles.headerSub}>Ligue para conectar ao micro:bit</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, Shadow.neoSmall]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={18} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Instruções passo a passo */}
          <View style={styles.body}>
            <View style={styles.stepsRow}>
              {steps.map((step, i) => (
                <React.Fragment key={step.num}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepBadge, Shadow.neoSmall]}>
                      <Text style={styles.stepNum}>{step.num}</Text>
                    </View>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                  {i < steps.length - 1 && (
                    <View style={styles.stepArrow}>
                      <Text style={styles.stepArrowText}>›</Text>
                    </View>
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* Hint de atalho */}
            <View style={[styles.hintBox, Shadow.neoSmall]}>
              <Settings size={14} color={Colors.dark} strokeWidth={2.5} />
              <Text style={styles.hintText}>
                {Platform.OS === 'android'
                  ? 'Deslize de cima para baixo e toque no ícone de Bluetooth'
                  : 'Acesse Ajustes > Bluetooth e ative'}
              </Text>
            </View>
          </View>

          {/* Botão fechar */}
          <View style={styles.footer}>
            <View style={{ flex: 1, position: 'relative' }}>
              <View style={[styles.btnShadow]} />
              <TouchableOpacity
                style={styles.dismissBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.dismissText}>ENTENDI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
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
  sheet: {
    backgroundColor: Colors.bg,
    borderWidth: 3,
    borderColor: Colors.dark,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    backgroundColor: '#FF2D2D',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.title,
    fontSize: 15,
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: '#888',
    marginTop: 2,
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

  // Body
  body: {
    padding: 20,
    gap: 16,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stepItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  stepBadge: {
    width: 36,
    height: 36,
    backgroundColor: '#0066FF',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontFamily: FontFamily.title,
    fontSize: 16,
    color: '#fff',
  },
  stepText: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.dark,
    textAlign: 'center',
    lineHeight: 13,
  },
  stepArrow: {
    paddingBottom: 20,
  },
  stepArrowText: {
    fontSize: 22,
    color: '#ccc',
    fontFamily: FontFamily.title,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFE500',
    borderWidth: 3,
    borderColor: Colors.dark,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hintText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.dark,
    flex: 1,
    lineHeight: 17,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 60,
    paddingTop: 4,
  },
  btnShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: Colors.dark,
  },
  dismissBtn: {
    backgroundColor: Colors.dark,
    borderWidth: 3,
    borderColor: Colors.dark,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontFamily: FontFamily.title,
    fontSize: 14,
    color: '#FFD82D',
    letterSpacing: 1,
  },
});
