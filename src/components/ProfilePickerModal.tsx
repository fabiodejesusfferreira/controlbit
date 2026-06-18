import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Easing,
  TextInput,
  ActivityIndicator,
  Alert,
  ListRenderItemInfo,
} from 'react-native';
import { X, Plus, Trash2, Check, Lock } from 'lucide-react-native';
import { ControlProfile } from '../types/control.types';
import { CommandStorage } from '../services/storage';
import { Colors, FontFamily, Shadow } from '../constants/theme';

const CARD_COLORS = [
  '#FFD82D', '#FF6B00', '#22C55E',
  '#1C37B5', '#E81C1C', '#A855F7',
];

interface Props {
  profiles: ControlProfile[];
  activeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
  onRefresh: () => Promise<void>;
}

// ─── Item de perfil memoizado ─────────────────────────────────────────────────
interface ProfileRowProps {
  item: ControlProfile;
  index: number;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProfileRow = memo(function ProfileRow({
  item,
  index,
  isActive,
  onSelect,
  onDelete,
}: ProfileRowProps) {
  const bgColor = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <View style={{ position: 'relative', marginBottom: 10 }}>
      {/* Sombra neo */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            top: 4, left: 4,
            right: -4, bottom: -4,
            backgroundColor: Colors.dark,
          },
        ]}
      />
      <TouchableOpacity
        style={[
          styles.profileRow,
          { backgroundColor: isActive ? bgColor : '#fff' },
        ]}
        onPress={() => onSelect(item.id)}
        activeOpacity={0.85}
      >
        <View style={[styles.profileStripe, { backgroundColor: bgColor }]} />

        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.profileMeta}>
            {item.buttons.length} botão(ões)
            {item.isDefault ? ' · Padrão' : ''}
          </Text>
        </View>

        <View style={styles.profileActions}>
          {isActive && (
            <Check size={16} strokeWidth={3} color={Colors.dark} />
          )}
          {item.isDefault ? (
            <Lock size={14} color="#999" strokeWidth={2} />
          ) : (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(item.id)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={13} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
});

// ─── Modal principal ──────────────────────────────────────────────────────────
export default function ProfilePickerModal({
  profiles,
  activeId,
  onClose,
  onSelect,
  onRefresh,
}: Props) {
  const [creating, setCreating]       = useState(false);
  const [newName, setNewName]         = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [loading, setLoading]         = useState(false);

  const slideAnim = useRef(new Animated.Value(500)).current;
  const inputRef  = useRef<TextInput>(null);

  // Animação de entrada — só uma vez
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue:  0,
      duration: 260,
      easing:   Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // ── Criar perfil ────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    try {
      const p = await CommandStorage.createProfile(trimmed, orientation);
      // Refresh primeiro, depois select — sem race
      await onRefresh();
      onSelect(p.id);
      // Fecha modal DEPOIS de tudo estar pronto
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o perfil.');
    } finally {
      setLoading(false);
    }
  }, [newName, orientation, onRefresh, onSelect, onClose]);

  // ── Deletar perfil ──────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    Alert.alert(
      'Excluir perfil',
      'Tem certeza? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await CommandStorage.deleteProfile(id);
            await onRefresh();
            if (activeId === id) onSelect('preset_car');
          },
        },
      ],
    );
  }, [activeId, onRefresh, onSelect]);

  // ── Selecionar perfil ───────────────────────────────────────────────────────
  const handleSelect = useCallback(async (id: string) => {
    // Fecha imediatamente (UX responsiva), depois carrega
    onClose();
    // Pequeno delay para não travar a animação de fechamento
    setTimeout(async () => {
      await CommandStorage.setActiveProfileId(id);
      onSelect(id);
    }, 50);
  }, [onClose, onSelect]);

  // ── Render item (stable reference) ─────────────────────────────────────────
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ControlProfile>) => (
      <ProfileRow
        item={item}
        index={index}
        isActive={item.id === activeId}
        onSelect={handleSelect}
        onDelete={handleDelete}
      />
    ),
    [activeId, handleSelect, handleDelete],
  );

  const keyExtractor = useCallback((p: ControlProfile) => p.id, []);

  return (
    <Modal
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop — toque fora fecha */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Bloco vazio para não propagar toque para o sheet */}
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Impede que toque no sheet feche o modal */}
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>PERFIS</Text>
                <Text style={styles.headerSub}>
                  {profiles.length} perfil(s)
                </Text>
              </View>
              <View style={{ position: 'relative' }}>
                <View style={styles.closeShadow} />
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <X size={18} color="#fff" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Lista */}
            <FlatList
              data={profiles}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 320 }}
              // Perf
              removeClippedSubviews={false}
              windowSize={5}
            />

            {/* Área de criação */}
            <View style={styles.createArea}>
              <View style={styles.divider} />

              {creating ? (
                <View style={styles.createForm}>
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Nome do perfil..."
                    placeholderTextColor="#999"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleCreate}
                    maxLength={30}
                  />

                  <View style={styles.orientationRow}>
                    {(['portrait', 'landscape'] as const).map((o) => (
                      <TouchableOpacity
                        key={o}
                        style={[
                          styles.orientBtn,
                          orientation === o && styles.orientBtnActive,
                        ]}
                        onPress={() => setOrientation(o)}
                      >
                        <Text style={styles.orientLabel}>
                          {o === 'portrait' ? '📱 Retrato' : '⬛ Paisagem'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.createActions}>
                    {loading ? (
                      <View style={styles.loadingBox}>
                        <ActivityIndicator color={Colors.dark} size="small" />
                        <Text style={styles.loadingText}>Criando...</Text>
                      </View>
                    ) : (
                      <>
                        <View style={{ flex: 1, position: 'relative' }}>
                          <View style={[styles.btnShadow, { backgroundColor: Colors.dark }]} />
                          <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={handleCreate}
                            activeOpacity={0.85}
                          >
                            <Check size={16} color="#fff" strokeWidth={3} />
                            <Text style={styles.confirmText}>CRIAR</Text>
                          </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, position: 'relative' }}>
                          <View style={[styles.btnShadow, { backgroundColor: Colors.dark }]} />
                          <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => {
                              setCreating(false);
                              setNewName('');
                            }}
                            activeOpacity={0.85}
                          >
                            <X size={16} color="#fff" strokeWidth={3} />
                            <Text style={styles.cancelText}>CANCELAR</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              ) : (
                <View style={{ position: 'relative', marginTop: 12 }}>
                  <View style={[styles.btnShadow, { backgroundColor: Colors.dark }]} />
                  <TouchableOpacity
                    style={styles.newProfileBtn}
                    onPress={() => setCreating(true)}
                    activeOpacity={0.85}
                  >
                    <Plus size={18} strokeWidth={3} color={Colors.dark} />
                    <Text style={styles.newProfileText}>NOVO PERFIL</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bg,
    borderWidth: 3,
    borderColor: Colors.dark,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 36,
    maxHeight: '80%',
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
    fontSize: 22,
    color: Colors.dark,
  },
  headerSub: {
    fontFamily: FontFamily.mono,
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },
  closeShadow: {
    position: 'absolute',
    top: 3, left: 3,
    right: -3, bottom: -3,
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
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  profileStripe: {
    width: 8,
    height: 32,
    borderWidth: 2,
    borderColor: Colors.dark,
    flexShrink: 0,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontFamily: FontFamily.title,
    fontSize: 13,
    color: Colors.dark,
  },
  profileMeta: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#E81C1C',
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createArea: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  createForm: {
    gap: 10,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: Colors.dark,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.dark,
  },
  orientationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  orientBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark,
    backgroundColor: '#fff',
  },
  orientBtnActive: {
    backgroundColor: '#FFD82D',
  },
  orientLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.dark,
  },
  createActions: {
    flexDirection: 'row',
    gap: 10,
  },
  loadingBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.dark,
  },
  btnShadow: {
    position: 'absolute',
    top: 4, left: 4,
    right: -4, bottom: -4,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  confirmText: {
    fontFamily: FontFamily.title,
    fontSize: 13,
    color: '#fff',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#E81C1C',
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  cancelText: {
    fontFamily: FontFamily.title,
    fontSize: 13,
    color: '#fff',
  },
  newProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#FFD82D',
    borderWidth: 3,
    borderColor: Colors.dark,
  },
  newProfileText: {
    fontFamily: FontFamily.title,
    fontSize: 13,
    color: Colors.dark,
  },
});