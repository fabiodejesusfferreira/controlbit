import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { X, Plus, Trash2, Check, Lock } from 'lucide-react-native';
import { ControlProfile } from '../types/control.types';
import { CommandStorage } from '../services/storage';
import { Colors, FontFamily, Shadow } from '../constants/theme';

const CARD_COLORS = [
  '#FFE500',
  '#FF6B00',
  '#00C851',
  '#0066FF',
  '#FF2D2D',
  '#7B2FFF',
];

interface Props {
  profiles: ControlProfile[];
  activeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}

export default function ProfilePickerModal({
  profiles,
  activeId,
  onClose,
  onSelect,
  onRefresh,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [loading, setLoading] = useState(false);

  const slideAnim = React.useRef(new Animated.Value(600)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    const p = await CommandStorage.createProfile(newName.trim(), orientation);
    await onRefresh();
    onSelect(p.id);
    setCreating(false);
    setNewName('');
    setLoading(false);
    onClose();
  };

  const handleDelete = async (id: string) => {
    await CommandStorage.deleteProfile(id);
    await onRefresh();
    if (activeId === id) onSelect('preset_car');
  };

  const renderProfile = ({
    item,
    index,
  }: {
    item: ControlProfile;
    index: number;
  }) => {
    const isActive = item.id === activeId;
    const bgColor = CARD_COLORS[index % CARD_COLORS.length];

    return (
      <TouchableOpacity
        style={[
          styles.profileRow,
          Shadow.neoSmall,
          { backgroundColor: isActive ? bgColor : '#fff' },
        ]}
        onPress={() => {
          onSelect(item.id);
          onClose();
        }}
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
            {item.orientation ? ` · ${item.orientation === 'landscape' ? '⬛' : '📱'}` : ''}
          </Text>
        </View>
        <View style={styles.profileActions}>
          {item.isDefault ? (
            <Lock size={14} color="#999" strokeWidth={2} />
          ) : (
            <TouchableOpacity
              style={[styles.deleteBtn, Shadow.neoSmall]}
              onPress={() => handleDelete(item.id)}
              activeOpacity={0.8}
            >
              <Trash2 size={12} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {isActive && <Check size={16} strokeWidth={3} color={Colors.dark} />}
        </View>
      </TouchableOpacity>
    );
  };

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
            <View>
              <Text style={styles.headerTitle}>PERFIS</Text>
              <Text style={styles.headerSub}>{profiles.length} perfil(s)</Text>
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

          {/* Lista */}
          <FlatList
            data={profiles}
            keyExtractor={(p) => p.id}
            renderItem={renderProfile}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Criar novo */}
          <View style={styles.createArea}>
            <View style={styles.divider} />

            {creating ? (
              <View style={styles.createForm}>
                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Nome do perfil..."
                  placeholderTextColor="#999"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCreate}
                />

                {/* Picker de orientação */}
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
                    <ActivityIndicator color={Colors.dark} />
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.confirmBtn, Shadow.neoSmall]}
                        onPress={handleCreate}
                        activeOpacity={0.8}
                      >
                        <Check size={18} color="#fff" strokeWidth={3} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.cancelBtn, Shadow.neoSmall]}
                        onPress={() => {
                          setCreating(false);
                          setNewName('');
                        }}
                        activeOpacity={0.8}
                      >
                        <X size={18} color="#fff" strokeWidth={3} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.newProfileBtn, Shadow.neoSmall]}
                onPress={() => setCreating(true)}
                activeOpacity={0.8}
              >
                <Plus size={18} strokeWidth={3} color={Colors.dark} />
                <Text style={styles.newProfileText}>NOVO PERFIL</Text>
              </TouchableOpacity>
            )}
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
    maxHeight: '78%',
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
  headerSub: {
    fontFamily: FontFamily.mono,
    fontSize: 11,
    color: '#777',
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
  list: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: Colors.dark,
    marginBottom: 8,
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
    width: 28,
    height: 28,
    backgroundColor: '#FF2D2D',
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
    gap: 12,
  },
  createForm: {
    gap: 8,
    marginTop: 12,
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
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark,
    backgroundColor: '#fff',
  },
  orientBtnActive: {
    backgroundColor: '#FFE500',
  },
  orientLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.dark,
  },
  createActions: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmBtn: {
    flex: 1,
    height: 40,
    backgroundColor: '#00C851',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    height: 40,
    backgroundColor: '#FF2D2D',
    borderWidth: 3,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#FFE500',
    borderWidth: 3,
    borderColor: Colors.dark,
    marginTop: 12,
  },
  newProfileText: {
    fontFamily: FontFamily.title,
    fontSize: 13,
    color: Colors.dark,
  },
});
