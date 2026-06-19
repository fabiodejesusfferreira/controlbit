import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from 'react-native';
import { X, ZoomIn } from 'lucide-react-native';
import { Colors, FontFamily } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const IMAGE_SOURCE = require('../../assets/controlbit-como-configurar-o-microbit.png');

export default function MicrobitGuideModal({ visible, onClose }: Props) {
  const { t } = useLanguage();
  const slideAnim = useRef(new Animated.Value(800)).current;
  const [imageZoomed, setImageZoomed] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(800);
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 800,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <>
      <Modal
        transparent
        animationType="none"
        visible={visible}
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={styles.backdrop}>
          <Animated.View
            style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t('microbit_modal_title')}</Text>
              <View style={{ position: 'relative' }}>
                <View style={styles.closeShadow} />
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <X size={18} color="#fff" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Step 1 */}
              <StepCard
                title={t('microbit_step1_title')}
                body={t('microbit_step1_body')}
                accent="#1C37B5"
              />

              {/* Step 2 */}
              <StepCard
                title={t('microbit_step2_title')}
                body={t('microbit_step2_body')}
                accent="#22C55E"
              />

              {/* Step 3 */}
              <StepCard
                title={t('microbit_step3_title')}
                body={t('microbit_step3_body')}
                accent="#E81C1C"
              />

              {/* Image */}
              <TouchableOpacity
                style={styles.imageWrapper}
                onPress={() => setImageZoomed(true)}
                activeOpacity={0.85}
              >
                <View style={styles.imageShadow} />
                <Image
                  source={IMAGE_SOURCE}
                  style={styles.image}
                  resizeMode="contain"
                />
                <View style={styles.zoomBadge}>
                  <ZoomIn size={13} color={Colors.dark} strokeWidth={2.5} />
                  <Text style={styles.zoomText}>{t('microbit_tap_to_zoom')}</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Zoom Modal — pinch-to-zoom */}
      <Modal
        visible={imageZoomed}
        transparent
        animationType="fade"
        onRequestClose={() => setImageZoomed(false)}
        statusBarTranslucent
      >
        <StatusBar hidden />
        <View style={styles.zoomBackdrop}>
          
          {/* 2. SUBSTITUINDO O SCROLLVIEW PELO ZOOMABLE VIEW */}
          <ReactNativeZoomableView
            maxZoom={5}
            minZoom={1}
            zoomStep={0.5}
            initialZoom={1}
            bindToBorders={true}
            style={styles.zoomScrollContent}
          >
            <Image
              source={IMAGE_SOURCE}
              style={styles.zoomedImage}
              resizeMode="contain"
            />
          </ReactNativeZoomableView>

          {/* Botão fechar */}
          <TouchableOpacity
            style={styles.zoomCloseBtn}
            onPress={() => setImageZoomed(false)}
            activeOpacity={0.8}
          >
            <X size={24} color="#fff" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

function StepCard({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <View style={styles.stepCard}>
      <View style={[styles.stepAccent, { backgroundColor: accent }]} />
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepBody}>{body}</Text>
      </View>
    </View>
  );
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: Colors.dark,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  headerTitle: {
    fontFamily: FontFamily.title,
    fontSize: 18,
    color: Colors.dark,
    flex: 1,
    marginRight: 12,
  },
  closeShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    backgroundColor: Colors.dark,
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#E81C1C',
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
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 20,
    gap: 14,
    paddingBottom: 36,
  },

  // Step card
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.dark,
    overflow: 'hidden',
  },
  stepAccent: {
    width: 6,
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  stepTitle: {
    fontFamily: FontFamily.title,
    fontSize: 13,
    color: Colors.dark,
    letterSpacing: 0.3,
  },
  stepBody: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: '#555',
    lineHeight: 18,
  },

  // Image
  imageWrapper: {
    position: 'relative',
    marginTop: 6,
    alignSelf: 'stretch',
  },
  imageShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: Colors.dark,
  },
  image: {
    width: '100%',
    height: 200,
    borderWidth: 3,
    borderColor: Colors.dark,
    backgroundColor: '#fff',
  },
  zoomBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD82D',
    borderWidth: 2,
    borderColor: Colors.dark,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  zoomText: {
    fontFamily: FontFamily.monoBold,
    fontSize: 9,
    color: Colors.dark,
    letterSpacing: 0.5,
  },

  // Zoom modal
  zoomBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  zoomScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomedImage: {
    width: SCREEN_W,
    height: SCREEN_H * 0.85,
  },
  zoomCloseBtn: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
