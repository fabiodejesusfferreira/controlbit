import AsyncStorage from '@react-native-async-storage/async-storage';
import { ControlButton, ControlProfile } from '../types/control.types';
import { TranslationKey } from '../i18n/translations';

const PROFILES_KEY = '@controlbit_profiles_v1';
const ACTIVE_PROFILE_KEY = '@controlbit_active_profile';

type TFunc = (key: TranslationKey) => string;

const getDefaultProfiles = (t?: TFunc): ControlProfile[] => [
  {
    id: 'preset_car',
    name: t ? t('preset_car_name') : 'Carro Padrão',
    isDefault: true,
    orientation: 'portrait',
    buttons: [
      {
        id: 'b1',
        icon: 'arrow-up',
        command: 'up',
        label: t ? t('preset_btn_frente') : 'Frente',
        x: 120,
        y: 40,
        size: 80,
        color: '#00C851',
      },
      {
        id: 'b2',
        icon: 'arrow-down',
        command: 'down',
        label: t ? t('preset_btn_re') : 'Ré',
        x: 120,
        y: 160,
        size: 80,
        color: '#FF2D2D',
      },
      {
        id: 'b3',
        icon: 'arrow-left',
        command: 'left',
        label: t ? t('preset_btn_esq') : 'Esq',
        x: 30,
        y: 100,
        size: 80,
        color: '#0066FF',
      },
      {
        id: 'b4',
        icon: 'arrow-right',
        command: 'right',
        label: t ? t('preset_btn_dir') : 'Dir',
        x: 210,
        y: 100,
        size: 80,
        color: '#0066FF',
      },
      {
        id: 'b5',
        icon: 'bell',
        command: 'horn',
        label: t ? t('preset_btn_buzina') : 'Buzina',
        x: 120,
        y: 100,
        size: 80,
        color: '#FFE500',
      },
    ],
  },
  {
    id: 'preset_arm',
    name: t ? t('preset_arm_name') : 'Braço Robótico',
    isDefault: true,
    orientation: 'landscape',
    buttons: [
      {
        id: 'c1',
        icon: 'rotate-cw',
        command: 'base_cw',
        label: t ? t('preset_btn_base_dir') : 'Base →',
        x: 180,
        y: 40,
        size: 90,
        color: '#7B2FFF',
      },
      {
        id: 'c2',
        icon: 'rotate-ccw',
        command: 'base_ccw',
        label: t ? t('preset_btn_base_esq') : 'Base ←',
        x: 30,
        y: 40,
        size: 90,
        color: '#7B2FFF',
      },
      {
        id: 'c3',
        icon: 'maximize-2',
        command: 'claw_open',
        label: t ? t('preset_btn_abrir') : 'Abrir',
        x: 30,
        y: 170,
        size: 90,
        color: '#FF6B00',
      },
      {
        id: 'c4',
        icon: 'zap',
        command: 'claw_close',
        label: t ? t('preset_btn_fechar') : 'Fechar',
        x: 180,
        y: 170,
        size: 90,
        color: '#FF6B00',
      },
    ],
  },
];

// ─── Helpers assíncronos internos ─────────────────────────────────────────────

async function readStorage(t?: TFunc): Promise<{
  profiles: ControlProfile[];
  activeId: string;
}> {
  try {
    const [rawProfiles, activeId] = await Promise.all([
      AsyncStorage.getItem(PROFILES_KEY),
      AsyncStorage.getItem(ACTIVE_PROFILE_KEY),
    ]);

    const stored: ControlProfile[] = rawProfiles
      ? JSON.parse(rawProfiles)
      : [];

    // Mescla perfis padrão + perfis salvos:
    // - Perfis customizados são adicionados normalmente
    // - Perfis padrão usam os botões salvos se existirem (para permitir edição)
    const storedMap = new Map(stored.map((p) => [p.id, p]));
    const defaults = getDefaultProfiles(t).map((d) => {
      const savedVersion = storedMap.get(d.id);
      if (savedVersion) {
        // Usa meta do default (name, orientation) mas botões salvos
        return { ...d, buttons: savedVersion.buttons };
      }
      return d;
    });
    const defaultIds = new Set(defaults.map((d) => d.id));
    const customProfiles = stored.filter((p) => !defaultIds.has(p.id));

    return {
      profiles: [...defaults, ...customProfiles],
      activeId: activeId ?? 'preset_car',
    };
  } catch {
    return { profiles: getDefaultProfiles(t), activeId: 'preset_car' };
  }
}

/** Salva apenas perfis customizados (não os defaults) */
async function writeProfiles(profiles: ControlProfile[]): Promise<void> {
  const custom = profiles.filter((p) => !p.isDefault);
  await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(custom));
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const CommandStorage = {
  async getProfiles(t?: TFunc): Promise<ControlProfile[]> {
    const { profiles } = await readStorage(t);
    return profiles;
  },

  async getActiveProfile(t?: TFunc): Promise<ControlProfile> {
    const { profiles, activeId } = await readStorage(t);
    return profiles.find((p) => p.id === activeId) ?? profiles[0];
  },

  async setActiveProfileId(id: string): Promise<void> {
    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, id);
  },

  async createProfile(
    name: string,
    orientation: 'portrait' | 'landscape' = 'portrait',
  ): Promise<ControlProfile> {
    const newProfile: ControlProfile = {
      id: `profile_${Date.now()}`,
      name,
      buttons: [],
      orientation,
    };
    const { profiles } = await readStorage();
    profiles.push(newProfile);
    await writeProfiles(profiles);
    return newProfile;
  },

  async saveButtonsToActiveProfile(buttons: ControlButton[]): Promise<void> {
    const { profiles, activeId } = await readStorage();
    const idx = profiles.findIndex((p) => p.id === activeId);
    if (idx !== -1) {
      profiles[idx].buttons = buttons;
      // Persiste customizações mesmo em perfis padrão
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }
  },

  async updateProfileOrientation(
    id: string,
    orientation: 'portrait' | 'landscape',
  ): Promise<void> {
    const { profiles } = await readStorage();
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx !== -1 && !profiles[idx].isDefault) {
      profiles[idx].orientation = orientation;
      await writeProfiles(profiles);
    }
  },

  async deleteProfile(id: string): Promise<void> {
    const { profiles } = await readStorage();
    const filtered = profiles.filter((p) => p.id !== id && !p.isDefault);
    await writeProfiles(filtered);
  },

  async renameProfile(id: string, name: string): Promise<void> {
    const { profiles } = await readStorage();
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx !== -1 && !profiles[idx].isDefault) {
      profiles[idx].name = name;
      await writeProfiles(profiles);
    }
  },
};
