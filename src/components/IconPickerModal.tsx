import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Icon, AVAILABLE_ICONS } from '../utils/iconMap';
import { Colors, FontFamily, Shadow } from '../constants/theme';

interface Props {
  selected: string;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

export default function IconPickerModal({ selected, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');

  const filtered = AVAILABLE_ICONS.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal
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
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>ÍCONES</Text>
            <TouchableOpacity
              style={[styles.closeBtn, Shadow.neoSmall]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={18} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar ícone..."
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.divider} />

          {/* Grid de ícones */}
          <FlatList
            data={filtered}
            keyExtractor={(name) => name}
            numColumns={5}
            renderItem={({ item: name }) => {
              const isActive = selected === name;
              return (
                <TouchableOpacity
                  style={[
                    styles.iconCell,
                    isActive && styles.iconCellActive,
                    isActive && Shadow.neoSmall,
                  ]}
                  onPress={() => {
                    onSelect(name);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name={name} size={22} color={isActive ? '#fff' : Colors.dark} />
                  <Text style={[styles.iconName, { color: isActive ? '#fff' : '#777' }]} numberOfLines={1}>
                    {name.replace(/-/g, ' ')}
                  </Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
    maxHeight: '75%',
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
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: Colors.dark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.dark,
  },
  divider: {
    height: 3,
    backgroundColor: Colors.dark,
    marginHorizontal: 20,
  },
  grid: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  iconCell: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: 4,
  },
  iconCellActive: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  iconName: {
    fontFamily: FontFamily.mono,
    fontSize: 6,
    textAlign: 'center',
  },
});
